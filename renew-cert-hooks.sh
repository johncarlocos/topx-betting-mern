#!/bin/bash
# Certbot hooks for Docker-based nginx setup
# This script is called by certbot during certificate renewal

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

case "$1" in
  "deploy")
    # This hook runs after certificates are successfully obtained/renewed
    echo "Restarting nginx container to load new certificates..."
    docker-compose -f docker-compose.prod.yml restart nginx
    ;;
  "pre")
    # This hook runs before certbot starts
    echo "Stopping nginx container to free up ports..."
    docker-compose -f docker-compose.prod.yml stop nginx || true
    sleep 2
    ;;
  "post")
    # This hook runs after certbot finishes (even if it fails)
    echo "Starting nginx container..."
    docker-compose -f docker-compose.prod.yml start nginx || true
    ;;
esac

