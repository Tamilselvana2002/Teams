from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from meeting.models import Room, Participant, ChatMessage, generate_unique_room_slug
from channels.testing import WebsocketCommunicator
from config.asgi import application


class RoomModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="password123")

    def test_room_creation(self):
        room = Room.objects.create(title="Sprint Standup", host=self.user)
        self.assertTrue(room.slug)
        self.assertTrue(len(room.slug) >= 9)
        self.assertEqual(room.title, "Sprint Standup")
        self.assertTrue(room.is_active)
        self.assertEqual(str(room), f"Sprint Standup ({room.slug})")

    def test_unique_slug_generation(self):
        slug1 = generate_unique_room_slug()
        slug2 = generate_unique_room_slug()
        self.assertNotEqual(slug1, slug2)

    def test_chat_message_creation(self):
        room = Room.objects.create(title="Tech Sync")
        msg = ChatMessage.objects.create(room=room, sender_name="Alice", message="Hello world!")
        self.assertEqual(msg.sender_name, "Alice")
        self.assertEqual(msg.message, "Hello world!")
        self.assertEqual(str(msg), "Alice: Hello world!")


class ViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="hostuser", email="host@example.com", password="password123")
        self.room = Room.objects.create(title="Existing Room", host=self.user, slug="test-room-123")

    def test_landing_page_loads(self):
        response = self.client.get(reverse("landing"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Teams")
        self.assertContains(response, "data-testid=\"page-landing\"")
        self.assertContains(response, "data-testid=\"input-join-code\"")

    def test_landing_page_join_post_redirects(self):
        response = self.client.post(reverse("landing"), {"room_code": "my-code-123"})
        self.assertEqual(response.status_code, 302)
        self.assertIn("/room/my-code-123/lobby/", response.url)

    def test_host_registration_flow(self):
        response = self.client.post(reverse("host_register"), {
            "username": "newhost",
            "email": "newhost@example.com",
            "password": "securepassword",
            "password_confirm": "securepassword",
        })
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse("host_dashboard"))
        self.assertTrue(User.objects.filter(username="newhost").exists())

    def test_host_registration_password_mismatch(self):
        response = self.client.post(reverse("host_register"), {
            "username": "mismatchuser",
            "email": "mismatch@example.com",
            "password": "password1",
            "password_confirm": "password2",
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Passwords do not match")

    def test_host_login_and_logout(self):
        response = self.client.post(reverse("host_login"), {
            "username": "hostuser",
            "password": "password123"
        })
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse("host_dashboard"))

        # Logout
        logout_resp = self.client.get(reverse("host_logout"))
        self.assertEqual(logout_resp.status_code, 302)
        self.assertRedirects(logout_resp, reverse("landing"))

    def test_dashboard_requires_auth(self):
        response = self.client.get(reverse("host_dashboard"))
        self.assertEqual(response.status_code, 302)
        self.assertIn("/login/", response.url)

    def test_dashboard_for_authenticated_host(self):
        self.client.login(username="hostuser", password="password123")
        response = self.client.get(reverse("host_dashboard"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "data-testid=\"page-dashboard\"")
        self.assertContains(response, "test-room-123")

    def test_create_room_endpoint(self):
        self.client.login(username="hostuser", password="password123")
        response = self.client.post(reverse("create_room"), {"title": "Sprint Review"})
        self.assertEqual(response.status_code, 302)
        created_room = Room.objects.filter(title="Sprint Review").first()
        self.assertIsNotNone(created_room)
        self.assertEqual(created_room.host, self.user)

    def test_room_lobby_view(self):
        response = self.client.get(reverse("room_lobby", kwargs={"slug": "test-room-123"}))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "data-testid=\"page-lobby\"")
        self.assertContains(response, "data-testid=\"video-lobby-preview\"")
        self.assertContains(response, "data-testid=\"btn-join-room\"")

    def test_meeting_room_redirects_if_no_name(self):
        response = self.client.get(reverse("meeting_room", kwargs={"slug": "test-room-123"}))
        self.assertEqual(response.status_code, 302)
        self.assertIn("/lobby/", response.url)

    def test_meeting_room_loads_with_name(self):
        response = self.client.get(reverse("meeting_room", kwargs={"slug": "test-room-123"}) + "?name=Jordan")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "data-testid=\"page-meeting-room\"")
        self.assertContains(response, "data-testid=\"btn-toggle-mic\"")
        self.assertContains(response, "data-testid=\"btn-toggle-cam\"")
        self.assertContains(response, "data-testid=\"btn-share-screen\"")

    def test_meeting_ended_view(self):
        response = self.client.get(reverse("meeting_ended", kwargs={"slug": "test-room-123"}))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "data-testid=\"page-meeting-ended\"")
        self.assertContains(response, "data-testid=\"btn-rejoin-meeting\"")

    def test_api_room_info_view(self):
        response = self.client.get(reverse("api_room_info", kwargs={"slug": "test-room-123"}))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["slug"], "test-room-123")
        self.assertEqual(data["title"], "Existing Room")
        self.assertTrue(data["is_active"])


class WebSocketSignalingTests(TestCase):
    async def test_websocket_join_and_chat(self):
        communicator = WebsocketCommunicator(application, "/ws/room/test-slug-ws/")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Send join message
        await communicator.send_json_to({
            "action": "join",
            "peer_id": "peer_alpha",
            "display_name": "Alice",
            "is_host": True
        })

        response = await communicator.receive_json_from()
        self.assertEqual(response["action"], "user-joined")
        self.assertEqual(response["peer_id"], "peer_alpha")
        self.assertEqual(response["display_name"], "Alice")
        self.assertTrue(response["is_host"])

        # Send chat message
        await communicator.send_json_to({
            "action": "chat-message",
            "text": "Hello room!"
        })

        chat_resp = await communicator.receive_json_from()
        self.assertEqual(chat_resp["action"], "chat-message")
        self.assertEqual(chat_resp["text"], "Hello room!")
        self.assertEqual(chat_resp["sender_name"], "Alice")

        await communicator.disconnect()
