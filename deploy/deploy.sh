#!/usr/bin/env bash
# ==============================================================================
# Teams Platform — Production Deployment / Update Script
# Usage: ./deploy/deploy.sh
# ==============================================================================

set -e

echo "🚀 Starting Teams Deployment..."

# Navigate to project root
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📂 Current Directory: $PROJECT_DIR"

# 1. Pull latest code from git
echo "📥 Pulling latest git changes..."
git pull origin main

# 2. Activate virtualenv
if [ -d "venv" ]; then
    echo "🐍 Activating Python virtual environment..."
    source venv/bin/activate
else
    echo "❌ venv directory not found! Creating venv..."
    python3 -m venv venv
    source venv/bin/activate
fi

# 3. Install/upgrade dependencies
echo "📦 Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# 4. Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# 5. Collect static assets
echo "🎨 Collecting static assets..."
python manage.py collectstatic --noinput

# 6. Restart Daphne systemd service
echo "🔄 Restarting teams.service..."
sudo systemctl restart teams

# 7. Check service status
if sudo systemctl is-active --quiet teams; then
    echo "✅ Teams application is ACTIVE and running smoothly!"
else
    echo "❌ Error: teams.service failed to restart. Check logs with: sudo journalctl -u teams -n 50"
    exit 1
fi

echo "🎉 Deployment complete!"
