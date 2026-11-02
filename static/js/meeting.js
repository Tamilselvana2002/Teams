/**
 * Teams — WebRTC Real-Time Meeting Engine
 * Full mesh WebRTC video/audio, screen sharing, recording, chat, and host moderation.
 */

class TeamsMeetingEngine {
  constructor() {
    this.roomSlug = document.body.dataset.roomSlug;
    this.displayName = document.body.dataset.displayName || "Participant";
    this.isHost = document.body.dataset.isHost === "true";
    this.myPeerId = "peer_" + Math.random().toString(36).substring(2, 10);

    this.localStream = null;
    this.screenStream = null;
    this.isMicMuted = sessionStorage.getItem("teams_mic_muted") === "1";
    this.isCamOff = sessionStorage.getItem("teams_cam_off") === "1";
    this.isScreenSharing = false;
    this.isLowBandwidth = false;
    this.isRecording = false;

    this.peers = new Map(); // peerId -> { pc, stream, displayName, isHost }
    this.socket = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.audioContext = null;

    this.rtcConfig = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" }
      ]
    };

    this.initDOM();
  }

  initDOM() {
    this.videoGrid = document.getElementById("video-grid");
    this.localTile = document.getElementById("local-video-tile");
    this.localVideo = document.getElementById("local-video");
    this.localAvatar = document.getElementById("local-avatar");
    this.localNameBadge = document.getElementById("local-name-badge");
    this.localMuteBadge = document.getElementById("local-mute-badge");

    // Toolbars
    this.btnMic = document.getElementById("btn-toggle-mic");
    this.btnCam = document.getElementById("btn-toggle-cam");
    this.btnScreen = document.getElementById("btn-share-screen");
    this.btnBandwidth = document.getElementById("btn-low-bandwidth");
    this.btnRecord = document.getElementById("btn-record-meeting");
    this.btnChat = document.getElementById("btn-toggle-chat");
    this.btnParticipants = document.getElementById("btn-toggle-participants");
    this.btnCopy = document.getElementById("btn-copy-invite");
    this.btnLeave = document.getElementById("btn-leave-call");
    this.btnEndAll = document.getElementById("btn-end-meeting-all");

    // Drawers
    this.chatDrawer = document.getElementById("chat-drawer");
    this.chatClose = document.getElementById("chat-close-btn");
    this.chatInput = document.getElementById("input-chat-message");
    this.chatSend = document.getElementById("btn-send-chat");
    this.chatMessages = document.getElementById("chat-messages-list");
    this.chatBadge = document.getElementById("chat-unread-badge");

    this.participantsDrawer = document.getElementById("participants-drawer");
    this.participantsClose = document.getElementById("participants-close-btn");
    this.participantsList = document.getElementById("participants-list");
    this.participantsCount = document.getElementById("badge-participant-count");
    this.recBadge = document.getElementById("rec-status-badge");
    this.toast = document.getElementById("app-toast");

    this.bindEvents();
  }

  async start() {
    this.localNameBadge.textContent = this.displayName + (this.isHost ? " (Host - You)" : " (You)");
    document.getElementById("local-avatar-circle").textContent = this.displayName.substring(0, 2).toUpperCase();

    await this.setupLocalMedia();
    this.connectWebSocket();
  }

  async setupLocalMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });

      this.localVideo.srcObject = this.localStream;

      // Apply initial mute/cam state from lobby
      if (this.isMicMuted) {
        this.localStream.getAudioTracks().forEach(t => t.enabled = false);
        this.btnMic.classList.add("active-off");
        this.localMuteBadge.style.display = "inline";
      }
      if (this.isCamOff) {
        this.localStream.getVideoTracks().forEach(t => t.enabled = false);
        this.btnCam.classList.add("active-off");
        this.localVideo.style.display = "none";
        this.localAvatar.style.display = "flex";
      }

      this.setupLocalAudioMeter();
    } catch (err) {
      console.warn("Could not capture full media, attempting audio fallback:", err);
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.localVideo.style.display = "none";
        this.localAvatar.style.display = "flex";
      } catch (audioErr) {
        console.error("No media devices available:", audioErr);
        // Create an empty dummy stream
        this.localStream = new MediaStream();
        this.localVideo.style.display = "none";
        this.localAvatar.style.display = "flex";
      }
    }
  }

  setupLocalAudioMeter() {
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 64;
      const source = this.audioContext.createMediaStreamSource(this.localStream);
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      let wasSpeaking = false;

      const checkSpeech = () => {
        if (!this.isMicMuted) {
          analyser.getByteFrequencyData(buffer);
          let sum = buffer.reduce((a, b) => a + b, 0);
          let avg = sum / buffer.length;
          let isSpeaking = avg > 25;

          if (isSpeaking !== wasSpeaking) {
            wasSpeaking = isSpeaking;
            this.localTile.classList.toggle("speaking", isSpeaking);
            this.sendWS({ action: "speaking-state", is_speaking: isSpeaking });
          }
        } else if (wasSpeaking) {
          wasSpeaking = false;
          this.localTile.classList.remove("speaking");
          this.sendWS({ action: "speaking-state", is_speaking: false });
        }
        requestAnimationFrame(checkSpeech);
      };
      checkSpeech();
    } catch (e) {
      console.warn("Audio meter setup skipped:", e);
    }
  }

  connectWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/room/${this.roomSlug}/`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.sendWS({
        action: "join",
        peer_id: this.myPeerId,
        display_name: this.displayName,
        is_host: this.isHost
      });
      this.showToast("Connected to meeting room");
      this.updateParticipantList();
    };

    this.socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      await this.handleSignalingMessage(data);
    };

    this.socket.onclose = () => {};
  }

  sendWS(payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  async handleSignalingMessage(data) {
    switch (data.action) {
      case "user-joined":
        if (data.peer_id !== this.myPeerId) {
          this.showToast(`${data.display_name} joined the meeting`);
          await this.initiatePeerConnection(data.peer_id, data.display_name, data.is_host);
        }
        this.updateParticipantList(data.participants);
        break;

      case "signal-offer":
        if (data.target_peer_id === this.myPeerId) {
          await this.handleOffer(data.sender_peer_id, data.sdp);
        }
        break;

      case "signal-answer":
        if (data.target_peer_id === this.myPeerId) {
          await this.handleAnswer(data.sender_peer_id, data.sdp);
        }
        break;

      case "ice-candidate":
        if (data.target_peer_id === this.myPeerId) {
          await this.handleIceCandidate(data.sender_peer_id, data.candidate);
        }
        break;

      case "speaking-state":
        const peer = this.peers.get(data.peer_id);
        if (peer && peer.tile) {
          peer.tile.classList.toggle("speaking", data.is_speaking);
        }
        break;

      case "chat-message":
        this.appendChatMessage(data.sender_name, data.text, data.timestamp, data.sender_peer_id === this.myPeerId);
        break;

      case "user-left":
        this.handlePeerDisconnect(data.peer_id, data.display_name);
        break;

      case "force-mute":
        if (data.target_peer_id === this.myPeerId) {
          this.muteLocalAudio();
          this.showToast(`Your microphone was muted by the host.`);
        }
        break;

      case "force-kick":
        if (data.target_peer_id === this.myPeerId) {
          this.showToast("You have been removed from the meeting by the host.");
          setTimeout(() => this.leaveMeeting(), 1200);
        }
        break;

      case "meeting-ended":
        this.showToast("The host has ended this meeting for all participants.");
        setTimeout(() => this.leaveMeeting(), 1200);
        break;
    }
  }

  createPeerConnection(remotePeerId, displayName, isHost) {
    const pc = new RTCPeerConnection(this.rtcConfig);

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendWS({
          action: "ice-candidate",
          target_peer_id: remotePeerId,
          candidate: event.candidate
        });
      }
    };

    const remoteStream = new MediaStream();
    const tileObj = this.createRemoteTile(remotePeerId, displayName, isHost);

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
      tileObj.video.srcObject = remoteStream;
      tileObj.video.play().catch(() => {});
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        this.handlePeerDisconnect(remotePeerId, displayName);
      }
    };

    this.peers.set(remotePeerId, {
      pc,
      stream: remoteStream,
      displayName,
      isHost,
      tile: tileObj.tile
    });

    return pc;
  }

  async initiatePeerConnection(remotePeerId, displayName, isHost) {
    const pc = this.createPeerConnection(remotePeerId, displayName, isHost);
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await pc.setLocalDescription(offer);

    this.sendWS({
      action: "signal-offer",
      target_peer_id: remotePeerId,
      sdp: offer
    });
  }

  async handleOffer(senderPeerId, sdp) {
    let peer = this.peers.get(senderPeerId);
    let pc = peer ? peer.pc : this.createPeerConnection(senderPeerId, "Participant", false);

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.sendWS({
      action: "signal-answer",
      target_peer_id: senderPeerId,
      sdp: answer
    });
  }

  async handleAnswer(senderPeerId, sdp) {
    const peer = this.peers.get(senderPeerId);
    if (peer && peer.pc) {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  }

  async handleIceCandidate(senderPeerId, candidate) {
    const peer = this.peers.get(senderPeerId);
    if (peer && peer.pc) {
      try {
        await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("Error adding ice candidate:", e);
      }
    }
  }

  createRemoteTile(peerId, displayName, isHost) {
    const tile = document.createElement("div");
    tile.className = "video-tile";
    tile.id = `tile-${peerId}`;
    tile.setAttribute("data-testid", "tile-remote-video");

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;

    const badge = document.createElement("div");
    badge.className = "tile-bottom-badge";
    badge.innerHTML = `
      <span>${displayName}</span>
      ${isHost ? '<span class="host-badge-pill">Host</span>' : ''}
    `;

    tile.appendChild(video);
    tile.appendChild(badge);
    this.videoGrid.appendChild(tile);

    return { tile, video };
  }

  handlePeerDisconnect(peerId, displayName) {
    const peer = this.peers.get(peerId);
    if (peer) {
      if (peer.pc) peer.pc.close();
      if (peer.tile && peer.tile.parentNode) {
        peer.tile.parentNode.removeChild(peer.tile);
      }
      this.peers.delete(peerId);
      this.showToast(`${displayName || "A participant"} left the call`);
      this.updateParticipantList();
    }
  }

  // Media Controls
  toggleMic() {
    this.isMicMuted = !this.isMicMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(t => t.enabled = !this.isMicMuted);
    }
    this.btnMic.classList.toggle("active-off", this.isMicMuted);
    this.localMuteBadge.style.display = this.isMicMuted ? "inline" : "none";
    this.showToast(this.isMicMuted ? "Microphone muted" : "Microphone unmuted");
  }

  muteLocalAudio() {
    this.isMicMuted = true;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(t => t.enabled = false);
    }
    this.btnMic.classList.add("active-off");
    this.localMuteBadge.style.display = "inline";
  }

  toggleCam() {
    this.isCamOff = !this.isCamOff;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(t => t.enabled = !this.isCamOff);
    }
    this.btnCam.classList.toggle("active-off", this.isCamOff);
    this.localVideo.style.display = this.isCamOff ? "none" : "block";
    this.localAvatar.style.display = this.isCamOff ? "flex" : "none";
    this.showToast(this.isCamOff ? "Camera turned off" : "Camera turned on");
  }

  async toggleScreenShare() {
    if (!this.isScreenSharing) {
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = this.screenStream.getVideoTracks()[0];

        // Replace video track in all active peer connections
        this.peers.forEach(peer => {
          const sender = peer.pc.getSenders().find(s => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        this.localVideo.srcObject = this.screenStream;
        this.localTile.classList.add("is-screenshare");
        this.btnScreen.classList.add("active-on");
        this.isScreenSharing = true;

        screenTrack.onended = () => this.stopScreenShare();
        this.showToast("Screen sharing started");
      } catch (err) {
        console.warn("Screen share cancelled or failed:", err);
      }
    } else {
      this.stopScreenShare();
    }
  }

  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
    }
    const camTrack = this.localStream.getVideoTracks()[0];
    this.peers.forEach(peer => {
      const sender = peer.pc.getSenders().find(s => s.track && s.track.kind === "video");
      if (sender && camTrack) {
        sender.replaceTrack(camTrack);
      }
    });

    this.localVideo.srcObject = this.localStream;
    this.localTile.classList.remove("is-screenshare");
    this.btnScreen.classList.remove("active-on");
    this.isScreenSharing = false;
    this.showToast("Screen sharing stopped");
  }

  toggleLowBandwidth() {
    this.isLowBandwidth = !this.isLowBandwidth;
    this.btnBandwidth.classList.toggle("active-on", this.isLowBandwidth);

    // In low bandwidth, pause local outgoing video and mute incoming video tiles
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(t => t.enabled = !this.isLowBandwidth);
    }
    this.peers.forEach(peer => {
      if (peer.tile) {
        const vid = peer.tile.querySelector("video");
        if (vid) vid.style.display = this.isLowBandwidth ? "none" : "block";
      }
    });
    this.showToast(this.isLowBandwidth ? "Low-Bandwidth Mode Enabled (Audio-Only)" : "Low-Bandwidth Mode Disabled");
  }

  // Local Recording (.webm download via MediaRecorder)
  toggleRecording() {
    if (!this.isRecording) {
      try {
        const streamToRecord = this.localVideo.srcObject || this.localStream;
        this.mediaRecorder = new MediaRecorder(streamToRecord, { mimeType: "video/webm;codecs=vp8,opus" });
        this.recordedChunks = [];

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) this.recordedChunks.push(e.data);
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = `Teams_Meeting_${this.roomSlug}_${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 100);
          this.showToast("Recording saved and downloaded.");
        };

        this.mediaRecorder.start(1000);
        this.isRecording = true;
        this.recBadge.style.display = "inline-flex";
        this.btnRecord.classList.add("active-on");
        this.showToast("Recording started");
      } catch (err) {
        this.showToast("Recording not supported or media stream unavailable.");
      }
    } else {
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }
      this.isRecording = false;
      this.recBadge.style.display = "none";
      this.btnRecord.classList.remove("active-on");
    }
  }

  // Chat
  sendChat() {
    const text = this.chatInput.value.trim();
    if (!text) return;
    this.sendWS({ action: "chat-message", text });
    this.chatInput.value = "";
  }

  appendChatMessage(senderName, text, timestamp, isMine) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble" + (isMine ? " mine" : "");
    bubble.innerHTML = `
      <div class="chat-sender">${senderName} <span class="chat-time">${timestamp || ""}</span></div>
      <div class="chat-text">${text}</div>
    `;
    this.chatMessages.appendChild(bubble);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

    if (!this.chatDrawer.classList.contains("open") && !isMine) {
      this.chatBadge.style.display = "block";
    }
  }

  // Participants
  updateParticipantList(participants = null) {
    const count = 1 + this.peers.size;
    this.participantsCount.textContent = count;

    this.participantsList.innerHTML = `
      <div class="participant-item">
        <span>${this.displayName} (You)</span>
        ${this.isHost ? '<span class="host-badge-pill">Host</span>' : ''}
      </div>
    `;

    this.peers.forEach((peer, peerId) => {
      const item = document.createElement("div");
      item.className = "participant-item";
      item.innerHTML = `
        <span>${peer.displayName}</span>
        <div style="display: flex; gap: 8px; align-items: center;">
          ${peer.isHost ? '<span class="host-badge-pill">Host</span>' : ''}
          ${this.isHost ? `
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="meetingEngine.mutePeer('${peerId}')" data-testid="btn-host-mute-peer">Mute</button>
            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 11px;" onclick="meetingEngine.kickPeer('${peerId}')" data-testid="btn-host-kick-peer">Remove</button>
          ` : ''}
        </div>
      `;
      this.participantsList.appendChild(item);
    });
  }

  mutePeer(peerId) {
    this.sendWS({ action: "peer-mute", target_peer_id: peerId });
    this.showToast("Mute signal sent to participant");
  }

  kickPeer(peerId) {
    if (confirm("Are you sure you want to remove this participant?")) {
      this.sendWS({ action: "peer-kick", target_peer_id: peerId });
    }
  }

  endMeetingAll() {
    if (confirm("Are you sure you want to terminate this meeting for everyone?")) {
      this.sendWS({ action: "room-ended" });
      setTimeout(() => this.leaveMeeting(), 300);
    }
  }

  copyInviteLink() {
    const url = `${window.location.origin}/room/${this.roomSlug}/lobby/`;
    navigator.clipboard.writeText(url).then(() => {
      this.showToast("Meeting invite link copied!");
    }).catch(() => {
      prompt("Copy meeting link:", url);
    });
  }

  leaveMeeting() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
    }
    if (this.socket) {
      this.socket.close();
    }
    window.location.href = `/room/${this.roomSlug}/ended/`;
  }

  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add("show");
    setTimeout(() => this.toast.classList.remove("show"), 3000);
  }

  bindEvents() {
    this.btnMic.addEventListener("click", () => this.toggleMic());
    this.btnCam.addEventListener("click", () => this.toggleCam());
    this.btnScreen.addEventListener("click", () => this.toggleScreenShare());
    this.btnBandwidth.addEventListener("click", () => this.toggleLowBandwidth());
    this.btnRecord.addEventListener("click", () => this.toggleRecording());
    this.btnCopy.addEventListener("click", () => this.copyInviteLink());
    this.btnLeave.addEventListener("click", () => this.leaveMeeting());
    if (this.btnEndAll) {
      this.btnEndAll.addEventListener("click", () => this.endMeetingAll());
    }

    // Drawers toggle
    this.btnChat.addEventListener("click", () => {
      this.chatDrawer.classList.toggle("open");
      this.chatBadge.style.display = "none";
      if (this.participantsDrawer.classList.contains("open")) {
        this.participantsDrawer.classList.remove("open");
      }
    });
    this.chatClose.addEventListener("click", () => this.chatDrawer.classList.remove("open"));

    this.btnParticipants.addEventListener("click", () => {
      this.participantsDrawer.classList.toggle("open");
      if (this.chatDrawer.classList.contains("open")) {
        this.chatDrawer.classList.remove("open");
      }
    });
    this.participantsClose.addEventListener("click", () => this.participantsDrawer.classList.remove("open"));

    // Chat send
    this.chatSend.addEventListener("click", () => this.sendChat());
    this.chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.sendChat();
    });
  }
}

let meetingEngine = null;
document.addEventListener("DOMContentLoaded", () => {
  meetingEngine = new TeamsMeetingEngine();
  meetingEngine.start();
});
