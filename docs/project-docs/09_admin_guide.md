# 09 — Admin & Host Moderation Manual

## 9.1 Host Privileges in Active Meetings
When an authenticated user creates a room, they are designated as the **Meeting Host**. A gold `Host` badge appears alongside their name. Hosts have access to moderation tools to prevent disruptions:

### 1. Remotely Muting a Disruptive Participant
If an attendee has severe background noise or forgets to mute:
1. Click the **Participants** button in the bottom floating toolbar to open the participant drawer.
2. Locate the participant in the list.
3. Click the gray **Mute** button next to their name.
4. A signal is instantly sent over WebSockets (`force-mute`), automatically disabling the attendee's microphone track and showing a toast notification on their screen.

### 2. Ejecting a Participant (Kick)
To remove an unwanted attendee:
1. Open the **Participants** drawer.
2. Click the red **Remove** button next to their name.
3. Confirm the browser prompt.
4. The server relays a `force-kick` action, terminating their WebRTC connection and redirecting their browser away from the room.

### 3. Ending the Meeting for All Attendees
When the session is complete:
1. Hosts have an **End for All** button visible in the bottom toolbar.
2. Clicking **End for All** terminates the session across all connected clients simultaneously and marks `is_active = False` in the database.

## 9.2 Django Superuser & Site Administration
System administrators can access the Django admin portal at `/admin/` to oversee users, rooms, and chat logs:
- **Create a Superuser Account:**
  ```bash
  python manage.py createsuperuser
  ```
- **Manage Rooms:** View active rooms, creation dates, host ownership, and manually deactivate legacy rooms.
- **Participant Audit:** View attendee history and connection logs for security audits.
