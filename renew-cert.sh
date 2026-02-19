#!/bin/bash
# Script to renew Let's Encrypt certificate for Docker-based nginx setup

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting certificate renewal process..."

# Stop nginx container temporarily to free up ports 80 and 443
echo "Stopping nginx container..."
docker-compose -f docker-compose.prod.yml stop nginx || true

# Wait a moment for ports to be released
sleep 2

# Renew certificate using standalone mode
echo "Renewing certificate..."
# Use certonly with force-renewal to renew existing certificate
sudo certbot certonly --standalone --preferred-challenges http -d topxhk.ai -d www.topxhk.ai --force-renewal --non-interactive --agree-tos

# Restart nginx container
echo "Restarting nginx container..."
docker-compose -f docker-compose.prod.yml start nginx

echo "Certificate renewal completed successfully!"

