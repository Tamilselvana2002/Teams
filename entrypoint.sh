#!/bin/sh
set -e

# ==============================================================================
# Teams Container Entrypoint Script
# Runs database migrations, gathers static files, and starts Daphne ASGI server
# ==============================================================================

echo "🚀 Preparing Teams Application Container..."

# Ensure data and media directories exist for SQLite persistence
mkdir -p /app/data /app/media

# Apply any pending database schema migrations
echo "🗄️ Applying database migrations..."
python manage.py migrate --noinput

# Collect static assets into staticfiles/
echo "🎨 Collecting static files..."
python manage.py collectstatic --noinput

# Launch Daphne ASGI Server (handles HTTP and WebSockets for WebRTC)
echo "⚡ Starting Daphne ASGI Server on 0.0.0.0:8000..."
exec daphne -b 0.0.0.0 -p 8000 config.asgi:application
