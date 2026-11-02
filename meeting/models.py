import random
import string
from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse


def generate_unique_room_slug():
    """Generates a Google Meet style slug: xxx-yyyy-zzz"""
    chars = string.ascii_lowercase + string.digits
    part1 = ''.join(random.choices(chars, k=3))
    part2 = ''.join(random.choices(chars, k=4))
    part3 = ''.join(random.choices(chars, k=3))
    return f"{part1}-{part2}-{part3}"


class Room(models.Model):
    slug = models.CharField(max_length=24, unique=True, db_index=True, default=generate_unique_room_slug)
    title = models.CharField(max_length=150, default="Instant Meeting")
    host = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="hosted_rooms")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.slug})"

    def get_absolute_url(self):
        return reverse('room_lobby', kwargs={'slug': self.slug})


class Participant(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="participants")
    peer_id = models.CharField(max_length=64, db_index=True)
    display_name = models.CharField(max_length=60)
    is_host = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['joined_at']

    def __str__(self):
        return f"{self.display_name} in {self.room.slug}"


class ChatMessage(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="chat_messages")
    sender_name = models.CharField(max_length=60)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender_name}: {self.message[:20]}"
