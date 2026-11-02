import re
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_POST, require_http_methods
from django.contrib import messages
from .models import Room, generate_unique_room_slug


def landing_view(request):
    """P01 — Landing Page"""
    if request.method == "POST":
        room_code = request.POST.get("room_code", "").strip()
        # Clean slug: remove spaces and clean dashes
        clean_code = re.sub(r"[^a-zA-Z0-9-]", "", room_code).lower()
        if clean_code:
            return redirect("room_lobby", slug=clean_code)
        messages.error(request, "Please enter a valid room code.")

    return render(request, "meeting/landing.html")


def host_login_view(request):
    """P02 — Host Login"""
    if request.user.is_authenticated:
        return redirect("host_dashboard")

    if request.method == "POST":
        username_or_email = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")

        user = None
        # Allow login by email or username
        if "@" in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
        else:
            user = authenticate(request, username=username_or_email, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f"Welcome back, {user.username}!")
            return redirect("host_dashboard")
        else:
            messages.error(request, "Invalid username or password. Please try again.")

    return render(request, "meeting/login.html")


def host_register_view(request):
    """P03 — Host Register"""
    if request.user.is_authenticated:
        return redirect("host_dashboard")

    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        email = request.POST.get("email", "").strip().lower()
        password = request.POST.get("password", "")
        password_confirm = request.POST.get("password_confirm", "")

        if not username or not email or not password:
            messages.error(request, "All fields are required.")
            return render(request, "meeting/register.html")

        if password != password_confirm:
            messages.error(request, "Passwords do not match.")
            return render(request, "meeting/register.html")

        if User.objects.filter(username__iexact=username).exists():
            messages.error(request, "An account with that username already exists.")
            return render(request, "meeting/register.html")

        if User.objects.filter(email__iexact=email).exists():
            messages.error(request, "An account with that email already exists.")
            return render(request, "meeting/register.html")

        user = User.objects.create_user(username=username, email=email, password=password)
        login(request, user)
        messages.success(request, "Account created successfully! Welcome to Teams.")
        return redirect("host_dashboard")

    return render(request, "meeting/register.html")


def host_logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect("landing")


@login_required
def host_dashboard_view(request):
    """P04 — Host Dashboard"""
    recent_rooms = Room.objects.filter(host=request.user).order_by("-created_at")[:10]
    return render(request, "meeting/dashboard.html", {
        "recent_rooms": recent_rooms,
    })


@require_POST
def create_room_view(request):
    """API endpoint to create instant room"""
    title = request.POST.get("title", "").strip() or "Instant Meeting"
    host = request.user if request.user.is_authenticated else None

    room = Room.objects.create(
        slug=generate_unique_room_slug(),
        title=title,
        host=host
    )

    if request.headers.get("x-requested-with") == "XMLHttpRequest" or request.content_type == "application/json":
        return JsonResponse({
            "status": "success",
            "slug": room.slug,
            "lobby_url": f"/room/{room.slug}/lobby/",
            "room_url": f"/room/{room.slug}/"
        })

    return redirect("room_lobby", slug=room.slug)


def room_lobby_view(request, slug):
    """P05 — Pre-Join Lobby"""
    clean_slug = re.sub(r"[^a-zA-Z0-9-]", "", slug).lower()
    room, _ = Room.objects.get_or_create(slug=clean_slug, defaults={"title": "Team Meeting"})

    is_host = request.user.is_authenticated and (room.host == request.user or room.host is None)
    default_name = request.user.username if request.user.is_authenticated else ""

    return render(request, "meeting/lobby.html", {
        "room": room,
        "is_host": is_host,
        "default_name": default_name,
    })


def meeting_room_view(request, slug):
    """P06 — Live Meeting Room"""
    clean_slug = re.sub(r"[^a-zA-Z0-9-]", "", slug).lower()
    room = get_object_or_404(Room, slug=clean_slug)

    display_name = request.GET.get("name", "").strip()
    if not display_name:
        if request.user.is_authenticated:
            display_name = request.user.username
        else:
            return redirect("room_lobby", slug=room.slug)

    is_host = request.user.is_authenticated and (room.host == request.user or room.host is None)

    return render(request, "meeting/room.html", {
        "room": room,
        "display_name": display_name,
        "is_host": is_host,
    })


def meeting_ended_view(request, slug):
    """P07 — Meeting Ended Screen"""
    clean_slug = re.sub(r"[^a-zA-Z0-9-]", "", slug).lower()
    room = Room.objects.filter(slug=clean_slug).first()
    return render(request, "meeting/ended.html", {
        "room": room,
        "slug": clean_slug,
    })


def api_room_info_view(request, slug):
    clean_slug = re.sub(r"[^a-zA-Z0-9-]", "", slug).lower()
    room = Room.objects.filter(slug=clean_slug).first()
    if not room:
        return JsonResponse({"error": "Room not found"}, status=404)

    return JsonResponse({
        "slug": room.slug,
        "title": room.title,
        "is_active": room.is_active,
        "host": room.host.username if room.host else "Guest Host",
        "created_at": room.created_at.isoformat(),
    })
