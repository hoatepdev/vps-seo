#!/bin/bash
# Docker Setup Script for VPS-based SEO
# Run on your VPS: sudo bash setup-docker.sh

set -e

echo "=========================================="
echo "Docker SEO Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Domain configuration
read -p "Enter your domain name (e.g., example.com): " DOMAIN
echo ""

# 1. Install Docker
echo -e "${YELLOW}[1/5] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}Docker installed${NC}"
else
    echo -e "${GREEN}Docker already installed${NC}"
fi

# 2. Install Docker Compose
echo -e "${YELLOW}[2/5] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    curl -SL https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed${NC}"
else
    echo -e "${GREEN}Docker Compose already installed${NC}"
fi

# 3. Create project directory
echo -e "${YELLOW}[3/5] Setting up project directory...${NC}"
PROJECT_DIR="/var/www/seo-app"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 4. Create SSL directory
echo -e "${YELLOW}[4/5] Creating SSL directory...${NC}"
mkdir -p nginx/ssl
chmod 700 nginx/ssl

# 5. Update nginx config with domain
echo -e "${YELLOW}[5/5] Configuring domain...${NC}"
sed -i "s/yourdomain.com/$DOMAIN/g" nginx/sites-available/default.conf 2>/dev/null || echo "Skip config update (will do after file copy)"

echo ""
echo -e "${GREEN}=========================================="
echo "Docker Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Copy your project files to: $PROJECT_DIR"
echo "   scp -r dist/ user@$(hostname):$PROJECT_DIR/"
echo ""
echo "2. Update docker-compose.yml with your domain:"
echo "   SPA_URL: https://$DOMAIN"
echo ""
echo "3. Start the containers:"
echo "   cd $PROJECT_DIR"
echo "   docker compose up -d"
echo ""
echo "4. Get SSL certificate (optional):"
echo "   docker compose exec nginx certbot --nginx -d $DOMAIN"
echo ""
echo "5. Check status:"
echo "   docker compose ps"
echo "   docker compose logs -f"
echo ""
