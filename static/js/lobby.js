/**
 * Teams — Pre-Join Lobby Controller
 * Handles local camera/mic permissions, live VU meter, device selection, and room entry.
 */

let localStream = null;
let audioContext = null;
let analyser = null;
let micAnimationId = null;
let isMicMuted = false;
let isCamOff = false;

document.addEventListener("DOMContentLoaded", async () => {
  const videoPreview = document.getElementById("lobby-preview-video");
  const avatarFallback = document.getElementById("lobby-avatar-fallback");
  const avatarCircle = document.getElementById("lobby-avatar-circle");
  const vuFill = document.getElementById("lobby-vu-fill");
  const micToggleBtn = document.getElementById("btn-lobby-mic-toggle");
  const camToggleBtn = document.getElementById("btn-lobby-cam-toggle");
  const cameraSelect = document.getElementById("select-camera-device");
  const micSelect = document.getElementById("select-mic-device");
  const nameInput = document.getElementById("input-display-name");
  const joinBtn = document.getElementById("btn-join-room");
  const roomSlug = document.body.dataset.roomSlug;

  // Restore cached name if exists
  const savedName = sessionStorage.getItem("teams_display_name");
  if (savedName && !nameInput.value) {
    nameInput.value = savedName;
  }

  // Update avatar initials on name input
  function updateAvatarInitials() {
    const val = nameInput.value.trim() || "G";
    avatarCircle.textContent = val.substring(0, 2).toUpperCase();
  }
  nameInput.addEventListener("input", updateAvatarInitials);
  updateAvatarInitials();

  // Initialize Media Devices
  async function initMedia(videoDeviceId = null, audioDeviceId = null) {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: videoDeviceId ? { deviceId: { exact: videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } } : { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: audioDeviceId ? { deviceId: { exact: audioDeviceId }, echoCancellation: true, noiseSuppression: true } : { echoCancellation: true, noiseSuppression: true }
    };

    try {
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoPreview.srcObject = localStream;
      setupAudioMeter(localStream);
      await populateDevices();
    } catch (err) {
      console.warn("Unable to capture media stream:", err);
      // Fallback: try audio only, or show placeholder
      showNoMediaFallback();
    }
  }

  function showNoMediaFallback() {
    videoPreview.style.display = "none";
    avatarFallback.style.display = "flex";
  }

  function setupAudioMeter(stream) {
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function updateMeter() {
        if (!isMicMuted && analyser) {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
          let average = sum / bufferLength;
          let percent = Math.min(100, Math.round((average / 128) * 100));
          vuFill.style.width = percent + "%";
        } else {
          vuFill.style.width = "0%";
        }
        micAnimationId = requestAnimationFrame(updateMeter);
      }
      if (micAnimationId) cancelAnimationFrame(micAnimationId);
      updateMeter();
    } catch (e) {
      console.warn("Audio meter setup error:", e);
    }
  }

  async function populateDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      cameraSelect.innerHTML = "";
      micSelect.innerHTML = "";

      let camIndex = 1;
      let micIndex = 1;

      devices.forEach(device => {
        const option = document.createElement("option");
        option.value = device.deviceId;

        if (device.kind === "videoinput") {
          option.text = device.label || `Camera ${camIndex++}`;
          cameraSelect.appendChild(option);
        } else if (device.kind === "audioinput") {
          option.text = device.label || `Microphone ${micIndex++}`;
          micSelect.appendChild(option);
        }
      });
    } catch (e) {
      console.warn("Error enumerating devices:", e);
    }
  }

  // Device selectors change
  cameraSelect.addEventListener("change", () => {
    initMedia(cameraSelect.value, micSelect.value);
  });
  micSelect.addEventListener("change", () => {
    initMedia(cameraSelect.value, micSelect.value);
  });

  // Toggle Microphone
  micToggleBtn.addEventListener("click", () => {
    isMicMuted = !isMicMuted;
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !isMicMuted);
    }
    micToggleBtn.classList.toggle("active-off", isMicMuted);
    micToggleBtn.innerHTML = isMicMuted
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
  });

  // Toggle Camera
  camToggleBtn.addEventListener("click", () => {
    isCamOff = !isCamOff;
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = !isCamOff);
    }
    videoPreview.style.display = isCamOff ? "none" : "block";
    avatarFallback.style.display = isCamOff ? "flex" : "none";
    camToggleBtn.classList.toggle("active-off", isCamOff);
    camToggleBtn.innerHTML = isCamOff
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21l-3.6-3.6M3 3l18 18"></path><path d="M16 16v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1m5 0h3a2 2 0 0 1 2 2v3l4-3v7"></path></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>';
  });

  // Join Meeting
  joinBtn.addEventListener("click", () => {
    const displayName = nameInput.value.trim();
    if (!displayName) {
      nameInput.style.borderColor = "var(--accent-danger)";
      nameInput.focus();
      return;
    }

    // Persist settings for meeting room
    sessionStorage.setItem("teams_display_name", displayName);
    sessionStorage.setItem("teams_mic_muted", isMicMuted ? "1" : "0");
    sessionStorage.setItem("teams_cam_off", isCamOff ? "1" : "0");

    // Clean up lobby stream before transitioning
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }

    const targetUrl = `/room/${roomSlug}/?name=${encodeURIComponent(displayName)}`;
    window.location.href = targetUrl;
  });

  // Kick off initial device capture
  await initMedia();
});
