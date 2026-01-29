# Quick Start Guide

This guide will help you implement the VPS-based SEO architecture step by step.

## Part 1: React + Vite App Setup

### Step 1: Install Dependencies

```bash
cd /path/to/your/vite-app
npm install react-helmet-async express-user-agent
npm install -D vite-plugin-prerender @prerenderer/renderer-playwright
```

### Step 2: Add SEO Component

Copy `ARCHITECTURE.md` → Section 3.1.2 → Create `src/components/SEO.jsx`

### Step 3: Wrap App with HelmetProvider

Update `src/main.jsx`:

```jsx
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);
```

### Step 4: Update Vite Config

Update `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { prerender } from 'vite-plugin-prerender';
import { PlaywrightLauncher } from '@prerenderer/renderer-playwright';

export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: ['/', '/about', '/contact'], // Your static routes
      renderer: new PlaywrightLauncher({
        headless: true,
        renderAfterTime: 2000, // Wait for hydration
      }),
    }),
  ],
});
```

### Step 5: Add Meta Tags to Pages

```jsx
import SEO from '../components/SEO';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about our company and mission"
        canonical="https://yourdomain.com/about"
      />
      <main>
        <h1>About Us</h1>
        {/* ... */}
      </main>
    </>
  );
}
```

---

## Part 2: VPS Setup

### Step 1: Prerequisites

On your VPS (Ubuntu/Debian):

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Redis (optional, for caching)
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Setup Prerender Service

```bash
# Create directory
sudo mkdir -p /var/www/prerender
cd /var/www/prerender

# Create package.json
cat > package.json << 'EOF'
{
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "playwright": "^1.40.0",
    "redis": "^4.6.0"
  }
}
EOF

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Step 3: Create Prerender Server

Copy from `ARCHITECTURE.md` → Section 3.2.1 → Create `/var/www/prerender/server.js`

### Step 4: Start Prerender Service

```bash
# Start with PM2
pm2 start server.js --name prerender

# Save PM2 config
pm2 save
pm2 startup # Follow the command output

# Verify it's running
pm2 status
curl http://localhost:3000
```

---

## Part 3: Nginx Configuration

### Step 1: Create Site Config

```bash
sudo nano /etc/nginx/sites-available/your-site
```

Copy the Nginx config from `ARCHITECTURE.md` → Section 3.3.2

### Step 2: Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 3: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

---

## Part 4: Deploy Your SPA

```bash
# Build your app locally
npm run build

# Upload to VPS (choose method)
rsync -avz dist/ user@your-vps:/var/www/your-site/

# Or use scp
scp -r dist/* user@your-vps:/var/www/your-site/
```

---

## Part 5: Verify Everything Works

### Test 1: Bot Detection

```bash
# Should return prerendered HTML
curl -A "Googlebot" https://yourdomain.com/

# Should return SPA index.html
curl -A "Mozilla" https://yourdomain.com/
```

### Test 2: SSL

```bash
curl -I https://yourdomain.com/
# Should include: SSL certificate is valid
```

### Test 3: Meta Tags

```bash
curl -A "Googlebot" https://yourdomain.com/ | grep -E "(<title>|<meta name=\"description\")"
```

---

## Common Commands

```bash
# Prerender service
pm2 restart prerender
pm2 logs prerender
pm2 status

# Nginx
sudo nginx -t              # Test config
sudo systemctl reload nginx
sudo systemctl status nginx

# Redis
redis-cli ping             # Should return PONG
redis-cli FLUSHALL         # Clear cache (careful!)

# SSL
sudo certbot renew         # Renew certificates
```

---

## Next Steps

1. Submit sitemap to Google Search Console
2. Submit sitemap to Bing Webmaster Tools
3. Monitor prerender logs: `pm2 logs prerender`
4. Set up analytics (Google Analytics, Plausible, etc.)
5. Configure Cloudflare (optional but recommended)
