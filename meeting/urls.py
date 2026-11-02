from django.urls import path
from . import views

urlpatterns = [
    path("", views.landing_view, name="landing"),
    path("login/", views.host_login_view, name="host_login"),
    path("register/", views.host_register_view, name="host_register"),
    path("logout/", views.host_logout_view, name="host_logout"),
    path("dashboard/", views.host_dashboard_view, name="host_dashboard"),

    # Room routes
    path("api/rooms/create/", views.create_room_view, name="create_room"),
    path("api/rooms/<slug:slug>/", views.api_room_info_view, name="api_room_info"),
    path("room/<slug:slug>/lobby/", views.room_lobby_view, name="room_lobby"),
    path("room/<slug:slug>/", views.meeting_room_view, name="meeting_room"),
    path("room/<slug:slug>/ended/", views.meeting_ended_view, name="meeting_ended"),
]
