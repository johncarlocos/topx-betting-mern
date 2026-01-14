# Production Deployment Guide for topxhk.ai

This guide covers deploying the application to production at `https://topxhk.ai`.

## Prerequisites

1. A server with Docker and Docker Compose installed
2. Domain name `topxhk.ai` pointing to your server's IP address
3. MongoDB Atlas account (recommended for production) or MongoDB instance
4. SSL certificate (Let's Encrypt recommended)

## Step 1: Server Setup

### Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Step 2: Clone and Prepare Repository

```bash
# Clone repository
git clone <your-repo-url>
cd topx-betting-mern

# Build frontend
cd frontend
npm install
npm run build
cd ..
```

## Step 3: Environment Configuration

1. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

2. Edit `.env` with your production values:
```env
# Use MongoDB Atlas URI for production
ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/betting-china?authSource=admin

# Server configuration
PORT=5000
FETCHER=true
NODE_ENV=production
```

**Important:** Never commit the `.env` file to git. It contains sensitive credentials.

## Step 4: SSL Certificate Setup (Let's Encrypt)

Install Certbot and obtain SSL certificate:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop nginx if running
sudo docker-compose down

# Obtain certificate (replace email with your email)
sudo certbot certonly --standalone -d topxhk.ai -d www.topxhk.ai --email your-email@example.com --agree-tos --non-interactive

# Certificates will be stored in /etc/letsencrypt/live/topxhk.ai/
```

## Step 5: Update Nginx Configuration

The `nginx.ssl.conf` file is already configured for SSL. Make sure the SSL certificate paths are correct:

- Certificate: `/etc/letsencrypt/live/topxhk.ai/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/topxhk.ai/privkey.pem`

## Step 6: Deploy with Docker Compose

```bash
# Start services using production configuration
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

## Step 7: Verify Deployment

1. **Check HTTPS**: Visit `https://topxhk.ai` - should load the frontend
2. **Test API**: Visit `https://topxhk.ai/api/match/match-data` - should return JSON data
3. **Check SSL**: Use SSL Labs to test SSL configuration: https://www.ssllabs.com/ssltest/

## Step 8: SSL Certificate Auto-Renewal

Set up automatic renewal for Let's Encrypt certificates:

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab (runs twice daily)
sudo crontab -e
# Add this line:
0 0,12 * * * certbot renew --quiet && docker-compose -f /path/to/docker-compose.prod.yml restart nginx
```

## Production Checklist

- [ ] `.env` file configured with production credentials
- [ ] Frontend built (`npm run build` in frontend directory)
- [ ] SSL certificates installed and configured
- [ ] MongoDB Atlas connection string configured
- [ ] Domain DNS pointing to server IP
- [ ] Docker Compose services running
- [ ] HTTPS working and redirecting HTTP
- [ ] API endpoints accessible
- [ ] SSL certificate auto-renewal configured
- [ ] Firewall configured (ports 80, 443 open)
- [ ] Backups configured for MongoDB

## Monitoring and Maintenance

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild frontend if changed
cd frontend && npm run build && cd ..

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Backup MongoDB
If using MongoDB Atlas, backups are handled automatically. If using self-hosted MongoDB:
```bash
# Backup command (adjust connection string)
docker-compose -f docker-compose.prod.yml exec mongodb mongodump --out /backup
```

## Security Considerations

1. **Never expose MongoDB to the internet** - Use MongoDB Atlas or secure MongoDB instance
2. **Remove mongo-express in production** - Already commented out in docker-compose.prod.yml
3. **Use strong passwords** - For MongoDB and all services
4. **Keep SSL certificates updated** - Let's Encrypt auto-renewal configured
5. **Monitor logs** - Regularly check for errors or suspicious activity
6. **Keep dependencies updated** - Regularly update npm packages and Docker images

## Troubleshooting

### API not accessible
- Check if backend container is running: `docker-compose -f docker-compose.prod.yml ps`
- Check backend logs: `docker-compose -f docker-compose.prod.yml logs backend`
- Verify MongoDB connection string in `.env`

### SSL certificate issues
- Verify certificates exist: `ls -la /etc/letsencrypt/live/topxhk.ai/`
- Check nginx configuration: `docker-compose -f docker-compose.prod.yml exec nginx nginx -t`
- Ensure port 443 is open in firewall

### Frontend not loading
- Verify frontend is built: Check `frontend/build` directory exists
- Check nginx logs: `docker-compose -f docker-compose.prod.yml logs nginx`
- Verify nginx volume mount in docker-compose.prod.yml

## Support

For issues or questions, check:
- Application logs
- Nginx logs
- Backend logs
- MongoDB connection status

