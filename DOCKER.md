# Docker Deployment Guide for VPS-based SEO

## Overview

Run the entire SEO prerendering stack using Docker containers:
- **Nginx** - Reverse proxy with bot detection
- **Prerender** - Node.js + Playwright service
- **Redis** - Cache for prerendered HTML

## Quick Start

### 1. Build Your React App

```bash
npm run build
```

### 2. Upload to VPS

```bash
# Upload project files
scp -r dist/ user@your-vps:/var/www/seo-app/
scp docker-compose.yml Dockerfile.prerender user@your-vps:/var/www/seo-app/
scp -r nginx/ user@your-vps:/var/www/seo-app/
scp -r prerender/ user@your-vps:/var/www/seo-app/
```

### 3. Configure

Edit `docker-compose.yml` on your VPS:

```yaml
environment:
  - SPA_URL=https://yourdomain.com  # CHANGE THIS!
```

Edit `nginx/sites-available/default.conf`:

```nginx
server_name yourdomain.com www.yourdomain.com;  # CHANGE THIS!
```

### 4. Start Containers

```bash
cd /var/www/seo-app
docker compose up -d
```

### 5. Check Status

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f

# Check prerender health
curl http://localhost:3000/health
```

## Docker Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart a service
docker compose restart prerender

# View logs
docker compose logs -f prerender
docker compose logs nginx

# Update and rebuild
docker compose down
docker compose build --no-cache
docker compose up -d

# Clean up everything
docker compose down -v
docker system prune -a
```

## Getting SSL Certificate

### Option 1: Certbot with Docker

```bash
# Run certbot in nginx container
docker compose exec nginx certbot --nginx -d yourdomain.com

# Auto-renewal with cron
crontab -e
# Add: 0 3 * * * docker compose exec nginx certbot renew
```

### Option 2: Cloudflare (Recommended)

1. Add your domain to Cloudflare
2. Enable "Full SSL" mode
3. Enable "Auto Minify" for JS/CSS
4. Enable "Browser Cache TTL"

## Directory Structure

```
/var/www/seo-app/
├── docker-compose.yml
├── Dockerfile.prerender
├── dist/                      # Built React app
│   ├── index.html
│   ├── robots.txt
│   ├── sitemap.xml
│   └── assets/
├── nginx/
│   ├── nginx.conf
│   ├── sites-available/
│   │   └── default.conf
│   └── ssl/                   # SSL certificates
├── prerender/
│   ├── server.js
│   └── package.json
└── logs/                      # Docker volumes
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs prerender

# Common issues:
# - Port 3000 already in use
# - SPA_URL not configured
# - Redis connection failed
```

### Prerender not working

```bash
# Check if prerender is accessible
curl http://localhost:3000/health

# Test prerendering
curl -A "Googlebot" http://localhost/

# Check Redis
docker compose exec redis redis-cli ping
```

### Nginx issues

```bash
# Test nginx config
docker compose exec nginx nginx -t

# Reload nginx
docker compose exec nginx nginx -s reload

# Check nginx logs
docker compose logs nginx
```

## Performance Tuning

### Prerender Service

Edit `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'       # Increase for more parallel requests
      memory: 2G      # Increase for larger pages
```

### Redis Cache

```yaml
command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Nginx Cache

Edit `nginx/nginx.conf`:

```nginx
proxy_cache_path /var/cache/nginx/prerender
    max_size=2g       # Increase for more cached pages
    inactive=24h;     # Cache longer
```

## Monitoring

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Log sizes
docker compose logs | wc -l

# Redis cache size
docker compose exec redis redis-cli INFO memory
```

## Security Checklist

- [ ] Use non-root user in containers (done in Dockerfile)
- [ ] Restrict container resources (limits in docker-compose.yml)
- [ ] Enable SSL/TLS
- [ ] Set up firewall (ufw/iptables)
- [ ] Use secrets for sensitive data (don't commit SPA_URL with real domain)
- [ ] Regular security updates: `docker compose pull && docker compose up -d`
