# Hướng dẫn Deploy lên VPS với Docker

## Bước 1: Đẩy code lên Git

### Local (máy của bạn)

```bash
# 1. Khởi tạo git (nếu chưa có)
cd /Users/hoatepdev/Developer/personal/VPS-SEO
git init

# 2. Add tất cả files
git add .

# 3. Commit
git commit -m "Initial commit: VPS-based SEO setup with Docker"

# 4. Tạo repo trên GitHub/GitLab, sau đó push
# GitHub:
git remote add origin https://github.com/username/vps-seo.git
git branch -M main
git push -u origin main

# Hoặc GitLab:
git remote add origin https://gitlab.com/username/vps-seo.git
git push -u origin main
```

---

## Bước 2: Chuẩn bị VPS

### Yêu cầu VPS
- **OS**: Ubuntu 20.04+ hoặc Debian 11+
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB)
- **CPU**: 2 core trở lên
- **Disk**: 20GB+

### Kết nối SSH

```bash
ssh root@your-vps-ip
# hoặc với user thường
ssh user@your-vps-ip
```

---

## Bước 3: Cài Docker trên VPS

### Script cài đặt nhanh

```bash
# Tải và chạy script cài đặt
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user hiện tại vào docker group
sudo usermod -aG docker $USER

# Kích hoạt ngay
newgrp docker

# Enable Docker tự启动
sudo systemctl enable docker
sudo systemctl start docker

# Kiểm tra
docker --version
```

### Cài Docker Compose

```bash
# Tải docker compose
sudo curl -SL "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose

# Thêm quyền execute
sudo chmod +x /usr/local/bin/docker-compose

# Kiểm tra
docker compose version
```

---

## Bước 4: Clone code và cấu hình

### Clone từ Git

```bash
# Di chuyển đến thư mục web
cd /var/www

# Clone repository
sudo git clone https://github.com/username/vps-seo.git seo-app
cd seo-app

# Hoặc nếu dùng private repo với token:
# git clone https://username:token@github.com/username/vps-seo.git seo-app
```

### Cấu hình domain

```bash
# Edit docker-compose.yml
sudo nano docker-compose.yml
```

Tìm và sửa dòng này:

```yaml
environment:
  - SPA_URL=https://yourdomain.com  # Đổi thành domain của bạn
```

Edit nginx config:

```bash
sudo nano nginx/sites-available/default.conf
```

Tìm và sửa:

```nginx
server_name yourdomain.com www.yourdomain.com;  # Đổi thành domain của bạn
```

Lưu và thoát: `Ctrl+X`, `Y`, `Enter`

---

## Bước 5: Build React App trên VPS

### Cài Node.js

```bash
# Cài Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Kiểm tra
node --version
npm --version
```

### Build app

```bash
cd /var/www/seo-app

# Cài dependencies
npm install

# Build app
npm run build
```

---

## Bước 6: Start Docker Containers

```bash
cd /var/www/seo-app

# Build và start containers
docker compose up -d

# Xem logs
docker compose logs -f

# Kiểm tra status
docker compose ps
```

Bạn nên thấy:

```
NAME           IMAGE          STATUS
seo-nginx      nginx:alpine   Up
seo-prerender  ...            Up
seo-redis      redis:alpine   Up
```

---

## Bước 7: Cấu hình DNS

### Trên nhà cung cấp domain (Namecheap, Godaddy, Cloudflare...)

Thêm **A Record**:

| Type | Name | Value |
|------|------|-------|
| A | @ | your-vps-ip |
| A | www | your-vps-ip |

---

## Bước 8: Cấu hình SSL (HTTPS)

### Cách 1: Cloudflare (Đơn giản nhất - Khuyến nghị)

1. **Truy cập [Cloudflare](https://dash.cloudflare.com/)**
2. **Add Site** → nhập domain → Free plan
3. **Chọn DNS** → Thêm A record trỏ về VPS IP
4. **SSL/TLS** → Chọn **"Full"** mode
5. **Đợi DNS propagate** (5-30 phút)

✅ Xong! Cloudflare sẽ tự động xử lý SSL.

---

### Cách 2: Let's Encrypt (Direct SSL trên VPS)

```bash
# Tải certbot
sudo apt install -y certbot

# Tạo thư mục SSL
mkdir -p nginx/ssl

# Lấy certificate (chưa start https, dùng standalone mode)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates sẽ được lưu ở:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

Copy certificates:

```bash
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
```

Enable HTTPS trong nginx config:

```bash
sudo nano nginx/sites-available/default.conf
```

Uncomment phần HTTPS server (xóa dấu `#`):

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ...
}
```

Restart nginx:

```bash
docker compose restart nginx
```

Auto-renewal (crontab):

```bash
sudo crontab -e
# Thêm dòng này:
0 3 * * * certbot renew --quiet && docker compose -f /var/www/seo-app/docker-compose.yml restart nginx
```

---

## Bước 9: Test

### Test prerendering

```bash
# Test như Googlebot (phải trả về HTML đầy đủ)
curl -A "Googlebot" http://yourdomain.com/

# Test như user bình thường (phải trả về index.html của SPA)
curl http://yourdomain.com/

# Test meta tags
curl -s -A "Googlebot" http://yourdomain.com/ | grep -E "(<title>|<meta name=\"description\")"
```

### Test trên browser

```
https://yourdomain.com/
https://yourdomain.com/about
https://yourdomain.com/products
https://yourdomain.com/sitemap.xml
https://yourdomain.com/robots.txt
```

---

## Bước 10: Submit Sitemap lên Google

### Google Search Console

1. Truy cập [Google Search Console](https://search.google.com/search-console)
2. Add property → URL prefix → `https://yourdomain.com/`
3. Verify ownership (HTML file upload hoặc DNS)
4. **Sitemaps** → Submit: `https://yourdomain.com/sitemap.xml`

---

## Commands thường dùng

### Update code

```bash
cd /var/www/seo-app

# Pull code mới
git pull origin main

# Rebuild React app
npm run build

# Restart containers
docker compose down
docker compose up -d
```

### Xem logs

```bash
# Tất cả logs
docker compose logs -f

# Chỉ prerender service
docker compose logs -f prerender

# Nginx logs
docker compose logs -f nginx

# 100 dòng gần nhất
docker compose logs --tail=100 prerender
```

### Debug

```bash
# Vào trong container
docker compose exec prerender bash
docker compose exec nginx sh

# Redis CLI
docker compose exec redis redis-cli
> INFO memory
> KEYS prerender:*
> FLUSHALL  # Xóa cache

# Prerender health
curl http://localhost:3000/health
```

---

## Troubleshooting

### Container không start

```bash
# Xem lỗi
docker compose ps
docker compose logs prerender

# Kiểm tra port đã được dùng chưa
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :80

# Giải phóng port
sudo fuser -k 80/tcp
```

### Prerender timeout

```bash
# Kiểm tra kết nối SPA
curl https://yourdomain.com/

# Tăng timeout trong prerender/server.js
# timeout: 30000 → 60000

# Restart
docker compose restart prerender
```

### RAM đầy

```bash
# Xem RAM usage
free -h

# Xem Docker resource usage
docker stats

# Dừng không dùng services
docker compose down

# Clean Docker
docker system prune -a
```

### DNS không propagate

```bash
# Kiểm tra DNS
dig yourdomain.com
nslookup yourdomain.com

# Trên Windows:
nslookup yourdomain.com
```

DNS có thể mất 5-30 phút để propagate.

---

## Firewall (UFW)

```bash
# Enable firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Kiểm tra status
sudo ufw status
```

---

## Backup

### Backup code

```bash
# Tạo script backup
cat > /var/www/seo-app/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/seo-app-$DATE.tar.gz .
EOF

chmod +x /var/www/seo-app/backup.sh

# Run backup
/var/www/seo-app/backup.sh
```

### Backup Docker volumes

```bash
# Backup Redis data
docker run --rm -v seo-app_redis-data:/data \
  -v /backup:/backup alpine \
  tar czf /backup/redis-$(date +%Y%m%d).tar.gz /data
```

---

## Tóm tắt nhanh

```bash
# 1. Clone repo
cd /var/www
sudo git clone https://github.com/username/vps-seo.git seo-app
cd seo-app

# 2. Build app
npm install
npm run build

# 3. Configure domain
nano docker-compose.yml  # Edit SPA_URL
nano nginx/sites-available/default.conf  # Edit server_name

# 4. Start
docker compose up -d

# 5. Add domain DNS → VPS IP

# 6. SSL: Thêm vào Cloudflare OR chạy certbot

# 7. Test
curl -A "Googlebot" http://yourdomain.com/
```
