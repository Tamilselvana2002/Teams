import json
import html
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Room, Participant, ChatMessage


class MeetingConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.slug = self.scope['url_route']['kwargs']['slug']
        self.room_group_name = f"meeting_{self.slug}"
        self.peer_id = None
        self.display_name = "Anonymous"
        self.is_host = False

        # Join the Channels room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        if self.peer_id:
            await self.mark_participant_left(self.slug, self.peer_id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_event",
                    "event": {
                        "action": "user-left",
                        "peer_id": self.peer_id,
                        "display_name": self.display_name
                    }
                }
            )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        action = content.get("action")

        if action == "join":
            self.peer_id = content.get("peer_id")
            self.display_name = html.escape(content.get("display_name", "Guest")[:50])
            self.is_host = bool(content.get("is_host", False))

            await self.record_participant_join(self.slug, self.peer_id, self.display_name, self.is_host)
            current_participants = await self.get_active_participants(self.slug)

            # Broadcast arrival to peers in the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_event",
                    "event": {
                        "action": "user-joined",
                        "peer_id": self.peer_id,
                        "display_name": self.display_name,
                        "is_host": self.is_host,
                        "participants": current_participants
                    }
                }
            )

        elif action in ("signal-offer", "signal-answer", "ice-candidate"):
            # Relay P2P WebRTC signaling to specific target peer
            target_peer_id = content.get("target_peer_id")
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_event",
                    "event": {
                        "action": action,
                        "sender_peer_id": self.peer_id,
                        "target_peer_id": target_peer_id,
                        "sdp": content.get("sdp"),
                        "candidate": content.get("candidate")
                    }
                }
            )

        elif action == "chat-message":
            raw_text = content.get("text", "").strip()
            if raw_text:
                clean_text = html.escape(raw_text[:2000])
                msg_record = await self.save_chat_message(self.slug, self.display_name, clean_text)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "broadcast_event",
                        "event": {
                            "action": "chat-message",
                            "sender_name": self.display_name,
                            "sender_peer_id": self.peer_id,
                            "text": clean_text,
                            "timestamp": msg_record["timestamp"]
                        }
                    }
                )

        elif action == "speaking-state":
            is_speaking = bool(content.get("is_speaking", False))
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_event",
                    "event": {
                        "action": "speaking-state",
                        "peer_id": self.peer_id,
                        "is_speaking": is_speaking
                    }
                }
            )

        elif action == "peer-mute":
            # Host requests a peer to be muted
            target_peer_id = content.get("target_peer_id")
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_event",
                    "event": {
                        "action": "force-mute",
                        "target_peer_id": target_peer_id,
                        "initiated_by": self.display_name
                    }
                }
            )

        elif action == "peer-kick":
            target_peer_id = content.get("target_peer_id")
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_event",
                    "event": {
                        "action": "force-kick",
                        "target_peer_id": target_peer_id,
                        "reason": "Removed by meeting host"
                    }
                }
            )

        elif action == "room-ended":
            # Host terminates meeting for all
            await self.deactivate_room(self.slug)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_event",
                    "event": {
                        "action": "meeting-ended",
                        "reason": "Host ended the meeting for all participants"
                    }
                }
            )

    async def broadcast_event(self, event):
        # Push message directly to the WebSocket client
        await self.send_json(event["event"])

    @database_sync_to_async
    def record_participant_join(self, slug, peer_id, display_name, is_host):
        room = Room.objects.filter(slug=slug).first()
        if room:
            Participant.objects.create(
                room=room,
                peer_id=peer_id,
                display_name=display_name,
                is_host=is_host
            )

    @database_sync_to_async
    def mark_participant_left(self, slug, peer_id):
        Participant.objects.filter(
            room__slug=slug,
            peer_id=peer_id,
            left_at__isnull=True
        ).update(left_at=timezone.now())

    @database_sync_to_async
    def get_active_participants(self, slug):
        participants = Participant.objects.filter(
            room__slug=slug,
            left_at__isnull=True
        ).values('peer_id', 'display_name', 'is_host')
        return list(participants)

    @database_sync_to_async
    def save_chat_message(self, slug, sender_name, message):
        room = Room.objects.filter(slug=slug).first()
        if room:
            msg = ChatMessage.objects.create(
                room=room,
                sender_name=sender_name,
                message=message
            )
            return {"timestamp": msg.timestamp.strftime("%H:%M")}
        return {"timestamp": timezone.now().strftime("%H:%M")}

    @database_sync_to_async
    def deactivate_room(self, slug):
        Room.objects.filter(slug=slug).update(is_active=False)
