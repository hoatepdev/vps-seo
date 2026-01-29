# VPS-Based SEO Architecture for React + Vite SPA
## Production-Ready Implementation Plan

---

## Executive Summary

This architecture implements **hybrid rendering** for a React + Vite SPA:
- **Static content routes** → Build-time prerendering (SSG via Vite plugin)
- **Dynamic data routes** → Runtime prerendering on VPS (Playwright for bots)
- **Non-SEO routes** → Pure SPA (no prerendering)

**Key principle**: Same HTML content for bots and humans (no cloaking).

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                              Internet                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Cloudflare CDN (Optional)                        │
│  - Static asset caching (JS, CSS, images)                            │
│  - Page cache for prerendered HTML (TTL: 1-24 hours)                 │
│  - Bot detection via User-Agent headers                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Nginx Reverse Proxy                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Bot Detection Logic (User-Agent + Bot Pattern Matching)      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                    │                                  │
│              ┌─────────────────────┴─────────────────────┐           │
│              ▼                                           ▼           │
│      ┌───────────────┐                           ┌───────────────┐   │
│      │ Bot Traffic   │                           │ User Traffic  │   │
│      └───────┬───────┘                           └───────┬───────┘   │
│              │                                           │           │
│              ▼                                           ▼           │
│      ┌───────────────┐                           ┌───────────────┐   │
│      │ Prerender     │                           │ SPA Files     │   │
│      │ Service       │                           │ (index.html)  │   │
│      │ (Node.js +    │                           │               │   │
│      │  Playwright)  │                           │               │   │
│      └───────┬───────┘                           └───────┬───────┘   │
│              │                                           │           │
│              ▼                                           │           │
│      ┌───────────────┐                                   │           │
│      │ Rendered HTML │                                   │           │
│      │ (cached)      │                                   │           │
│      └───────┬───────┘                                   │           │
│              │                                           │           │
│              └─────────────────────┬─────────────────────┘           │
│                                    ▼                                 │
│                         ┌──────────────────┐                          │
│                         │ Response to User │                          │
│                         └──────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      VPS Server Components                            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │ Nginx          │  │ Prerender      │  │ SPA Static     │         │
│  │ (Port 80/443)  │  │ Service        │  │ Files          │         │
│  │                │  │ (Port 3000)    │  │ (/var/www/)    │         │
│  │ - Bot routing  │  │                │  │                │         │
│  │ - Cache headers│  │ - Playwright   │  │ - index.html   │         │
│  │ - SSL certs    │  │ - Redis cache  │  │ - assets/      │         │
│  └────────────────┘  └────────────────┘  └────────────────┘         │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │ Redis Cache    │  │ Sitemap        │  │ Robots.txt     │         │
│  │ (Optional)     │  │ Generator      │  │ Generator      │         │
│  │                │  │ (Cron job)     │  │                │         │
│  │ - HTML cache   │  │                │  │                │         │
│  │ - TTL: 1-24h   │  │                │  │                │         │
│  └────────────────┘  └────────────────┘  └────────────────┘         │
└──────────────────────────────────���──────────────────────────────────┘
```

---

## 2. Toolchain Recommendations

### 2.1 Static Prerendering (Build-Time)

| Tool | Purpose | Why |
|------|---------|-----|
| **vite-plugin-prerender** | SSG for static routes | Lightweight, Vite-native, stable |
| **vite-ssg** (alternative) | More advanced SSG | Good for complex static content |

### 2.2 Runtime Prerendering (VPS-Based)

| Tool | Purpose | Why |
|------|---------|-----|
| **Playwright** | Browser automation | Faster than Puppeteer, better API, actively maintained |
| **@prerenderer/renderer-playwright** | Integration plugin | Works with Vite prerender plugins |
| **Express** | Prerender server | Simple, stable, widely used |

### 2.3 Meta Tag Management

| Tool | Purpose | Why |
|------|---------|-----|
| **react-helmet-async** | Dynamic meta tags | SEO standard for React, async-safe |
| **react-meta-tags** (alternative) | Simpler option | For basic use cases |

### 2.4 Sitemap Generation

| Tool | Purpose | Why |
|------|---------|-----|
| **sitemap-generator** | Static sitemap | Simple, well-maintained |
| Custom script | Dynamic sitemap | For routes from API/database |

### 2.5 Bot Detection

| Method | Tool | Why |
|--------|------|-----|
| User-Agent matching | Nginx map + express-useragent | Fast, no external dependencies |
| **Optional** | Cloudflare Bot Fight Mode | Enhanced security, CDN-level |

---

## 3. Step-by-Step Implementation Plan

### Phase 1: Vite App Configuration

#### 3.1.1 Install Core Dependencies

```bash
# Meta tag management
npm install react-helmet-async

# Static prerendering (build-time)
npm install -D vite-plugin-prerender

# For runtime prerendering support (VPS side)
npm install -D @prerenderer/renderer-playwright
```

#### 3.1.2 Configure Meta Tags Component

Create `src/components/SEO.jsx`:

```jsx
import { Helmet } from 'react-helmet-async';

const DEFAULT_META = {
  title: 'Your Site Name',
  description: 'Your default description',
  ogImage: '/og-default.jpg',
  twitterCard: 'summary_large_image',
};

export default function SEO({
  title = DEFAULT_META.title,
  description = DEFAULT_META.description,
  ogImage = DEFAULT_META.ogImage,
  ogType = 'website',
  twitterCard = DEFAULT_META.twitterCard,
  canonical = '',
  noindex = false,
  structuredData = null,
}) {
  const fullTitle = title === DEFAULT_META.title
    ? title
    : `${title} | ${DEFAULT_META.title}`;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
```

#### 3.1.3 Wrap App with Helmet Provider

Update `src/main.jsx` or `src/main.tsx`:

```jsx
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);
```

#### 3.1.4 Configure Vite for Static Prerendering

Update `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { prerender } from 'vite-plugin-prerender';
import { PlaywrightLauncher } from '@prerenderer/renderer-playwright';

export default defineConfig({
  plugins: [
    react(),
    // Static prerendering for known static routes
    prerender({
      routes: [
        '/',
        '/about',
        '/contact',
        '/products',
        '/blog',
        // Add your static routes here
      ],
      renderer: new PlaywrightLauncher({
        headless: true,
        // Wait for hydration before capturing
        renderAfterTime: 1000,
        // Or wait for specific element
        // renderAfterElementExists: '#main-content',
      }),
      // Optional: skip JS for statically prerendered pages
      skipInject: false,
      // Output directory
      outDir: './dist',
    }),
  ],
  // Ensure absolute URLs for assets
  base: '/',
  build: {
    // Generate source maps for debugging (optional, disable in prod)
    sourcemap: false,
  },
});
```

#### 3.1.5 Create Sitemap Generator Script

Create `scripts/generate-sitemap.js`:

```js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://yourdomain.com';

// Static routes
const staticRoutes = [
  '',
  '/about',
  '/contact',
  '/products',
  '/blog',
];

// Dynamic routes (fetch from API)
async function getDynamicRoutes() {
  try {
    // Example: Fetch from your API
    const response = await fetch('https://api.yourdomain.com/products');
    const products = await response.json();
    return products.map(p => `/products/${p.slug}`);
  } catch (error) {
    console.error('Failed to fetch dynamic routes:', error);
    return [];
  }
}

// Generate sitemap XML
function generateSitemapXML(routes) {
  const date = new Date().toISOString();

  const urlElements = routes.map(route => `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

async function main() {
  const dynamicRoutes = await getDynamicRoutes();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const xml = generateSitemapXML(allRoutes);

  // Write to public directory (will be copied to dist)
  const publicDir = path.resolve(__dirname, '../public');
  await fs.promises.mkdir(publicDir, { recursive: true });
  await fs.promises.writeFile(path.join(publicDir, 'sitemap.xml'), xml);

  console.log(`✅ Sitemap generated with ${allRoutes.length} routes`);
}

main();
```

Add to `package.json`:

```json
{
  "scripts": {
    "generate-sitemap": "node scripts/generate-sitemap.js",
    "build": "npm run generate-sitemap && vite build",
    "preview": "vite preview"
  }
}
```

#### 3.1.6 Create Robots.txt

Create `public/robots.txt`:

```txt
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://yourdomain.com/sitemap.xml

# Disallow admin/private routes
Disallow: /admin/
Disallow: /api/
Disallow: /private/

# Crawl-delay (optional, respectful crawling)
Crawl-delay: 1
```

---

### Phase 2: VPS Prerender Service

#### 3.2.1 Prerender Server (Node.js + Express)

Create `prerender/server.js` on VPS:

```js
import express from 'express';
import { chromium } from 'playwright';
import Redis from 'redis';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

// Optional: Redis for caching
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
await redis.connect().catch(() => console.log('Redis not available, running without cache'));

// Browsers user-agents to prerender for
const BOT_PATTERNS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
];

// Cache TTL configuration
const CACHE_TTL = {
  default: 3600,        // 1 hour
  static: 86400,        // 24 hours for static routes
  dynamic: 1800,        // 30 minutes for dynamic routes
};

function getCacheKey(url) {
  return crypto.createHash('sha256').update(url).digest('hex');
}

function getTTLForRoute(url) {
  // Static routes get longer TTL
  if (url.match(/^\/(about|contact|blog)$/)) {
    return CACHE_TTL.static;
  }
  return CACHE_TTL.default;
}

// Render page with Playwright
async function renderPage(url) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    // Set viewport for consistency
    await page.setViewport({ width: 1200, height: 800 });

    // Wait for network idle or timeout
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for specific content if needed
    // await page.waitForSelector('#main-content', { timeout: 5000 }).catch(() => {});

    // Get rendered HTML
    const html = await page.content();

    return html;
  } finally {
    await browser.close();
  }
}

app.get('*', async (req, res) => {
  const originalUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  console.log(`Prerendering: ${originalUrl}`);

  try {
    // Check cache first
    const cacheKey = getCacheKey(originalUrl);
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(`Cache hit: ${originalUrl}`);
      res.set('X-Prerender-Cache', 'HIT');
      return res.send(cached);
    }

    console.log(`Cache miss, rendering: ${originalUrl}`);
    res.set('X-Prerender-Cache', 'MISS');

    // Render the page
    const html = await renderPage(originalUrl);

    // Cache the result
    const ttl = getTTLForRoute(req.path);
    await redis.setEx(cacheKey, ttl, html);

    res.send(html);
  } catch (error) {
    console.error(`Prerender failed for ${originalUrl}:`, error.message);

    // On error, return a minimal HTML with meta tags
    // This prevents complete SEO failure
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Temporary Unavailable</title>
          <meta name="robots" content="noindex">
        </head>
        <body>
          <h1>Service temporarily unavailable</h1>
          <script>window.location.href = '${originalUrl}';</script>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Prerender server running on port ${PORT}`);
});
```

#### 3.2.2 Prerender Service Package.json

`prerender/package.json`:

```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "playwright": "^1.40.0",
    "redis": "^4.6.0"
  }
}
```

---

### Phase 3: Nginx Configuration

#### 3.3.1 Main Nginx Config

`/etc/nginx/nginx.conf`:

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # Include site configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

#### 3.3.2 Site Configuration with Bot Routing

`/etc/nginx/sites-available/your-site`:

```nginx
# Map user agents to bot status
map $http_user_agent $is_bot {
    default 0;
    ~*Googlebot 1;
    ~*google-structured-data-testing-tool 1;
    ~*Bingbot 1;
    ~*Slurp 1;
    ~*DuckDuckBot 1;
    ~*Baiduspider 1;
    ~*YandexBot 1;
    ~*facebookexternalhit 1;
    ~*TwitterBot 1;
    ~*LinkedInBot 1;
    ~*WhatsApp 1;
    ~*TelegramBot 1;
    ~*AppleBot 1;
    ~*SemrushBot 1;
    ~*AhrefsBot 1;
    ~*MJ12bot 1;
    ~*SeznamBot 1;
}

# Upstream for prerender service
upstream prerender {
    server localhost:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Root directory for SPA files
    root /var/www/your-site;
    index index.html;

    # Static files with aggressive caching
    location ~* \.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Sitemap and robots.txt
    location = /sitemap.xml {
        expires 1h;
        add_header Cache-Control "public";
    }

    location = /robots.txt {
        expires 1d;
        add_header Cache-Control "public";
    }

    # Bot routing - send to prerender service
    location / {
        # Check if user is a bot
        if ($is_bot = 1) {
            proxy_pass http://prerender;
            break;
        }

        # Regular users get SPA
        try_files $uri $uri/ /index.html;
    }

    # Proxy settings for prerender
    location /prerender/ {
        internal;
        proxy_pass http://prerender;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Cache prerendered responses
        proxy_cache prerender_cache;
        proxy_cache_valid 200 1h;
        proxy_cache_key "$scheme$request_uri";
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

#### 3.3.3 Nginx Cache Configuration

`/etc/nginx/conf.d/cache.conf`:

```nginx
# Prerender cache
proxy_cache_path /var/cache/nginx/prerender
    levels=1:2
    keys_zone=prerender_cache:10m
    max_size=1g
    inactive=1h
    use_temp_path=off;
```

---

### Phase 4: Cloudflare Configuration (Optional but Recommended)

#### 3.4.1 Cache Rules

| Rule | Action | TTL |
|------|--------|-----|
| `*sitemap.xml` | Cache | 1 hour |
| `*robots.txt` | Cache | 1 day |
| `*.js`, `*.css`, `*.png`, `*.jpg`, etc. | Cache | 1 year |
| HTML pages (bot requests) | Bypass cache | - |

#### 3.4.2 Page Rules

| Pattern | Settings |
|---------|----------|
| `*yourdomain.com/admin/*` | Bypass cache, Security level: High |
| `*yourdomain.com/api/*` | Bypass cache |

#### 3.4.3 Bot Fight Mode

Enable **Bot Fight Mode** in Cloudflare dashboard:
- Challenges verified bots
- Blocks malicious bots
- Allows Google/Bing legitimate crawlers

---

## 4. SEO Best Practices & Google Compliance

### 4.1 Cloaking Prevention (Critical)

**DO:**
- Serve the same core content to bots and users
- Ensure prerendered HTML matches hydrated React output
- Use proper `meta robots` tags instead of hiding content

**DON'T:**
- Show different content to bots vs users (cloaking = penalty)
- Block CSS/JS from Googlebot (modern rendering needs it)
- Use `display: none` to hide keyword-stuffed content
- Redirect bots differently than users

**Verification:**
```bash
# Compare bot vs user response
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1)" https://yourdomain.com/page
curl -A "Mozilla/5.0 (Macintosh; Intel Mac OS X)" https://yourdomain.com/page
```

### 4.2 Googlebot Guidelines

| Aspect | Recommendation |
|--------|----------------|
| **Render budget** | Prerender only routes that need indexing |
| **Crawl rate** | Use `Crawl-delay` in robots.txt if needed |
| **Resources** | Allow Googlebot to access CSS/JS/images |
| **Structured data** | Include in prerendered HTML, not just JS |
| **Mobile-first** | Ensure prerender uses mobile viewport |
| **Core Web Vitals** | LCP < 2.5s, FID < 100ms, CLS < 0.1 |

### 4.3 Dynamic Routes at Scale

**Strategy 1: Selective Prerendering**
- Only prerender pages with backlinks or traffic
- Use `X-Robots-Tag` HTTP header for non-indexed pages

**Strategy 2: Pagination**
```html
<!-- Include pagination meta tags -->
<link rel="next" href="/products?page=2" />
<link rel="prev" href="/products?page=1" />
```

**Strategy 3: Lazy Sitemap Generation**
```bash
# Cron job to regenerate sitemap
0 */6 * * * cd /var/www/your-site && npm run generate-sitemap
```

**Strategy 4: Route Categorization**
```js
// Only prerender indexable routes
const PRERENDER_ROUTES = {
  static: ['/', '/about', '/contact'],
  dynamic: {
    products: '/products/:id',
    blog: '/blog/:slug',
  },
  exclude: ['/admin/*', '/user/*', '/cart'],
};
```

---

## 5. Performance Considerations

### 5.1 Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4s | > 4s |
| **FID** (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **TTFB** (Time to First Byte) | < 800ms | 800ms - 1800ms | > 1800ms |

### 5.2 Optimization Strategies

**HTML Size Reduction:**
```html
<!-- Inline critical CSS, defer non-critical -->
<style>
  /* Critical above-the-fold styles */
</style>
<link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

**JavaScript Loading:**
```html
<!-- Defer non-critical JS -->
<script defer src="/main.js"></script>
<script defer src="/analytics.js"></script>

<!-- Preload important resources -->
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
```

**Image Optimization:**
```html
<!-- Use modern formats -->
<picture>
  <source srcset="/image.webp" type="image/webp">
  <source srcset="/image.jpg" type="image/jpeg">
  <img src="/image.jpg" alt="..." loading="lazy" width="800" height="600">
</picture>
```

### 5.3 Cache TTL Recommendations

| Content Type | CDN Cache | Browser Cache | Prerender Cache |
|--------------|-----------|---------------|-----------------|
| HTML (pages) | 1-24 hours | 1 hour | 1-24 hours |
| JS/CSS | 1 year | 1 year | N/A |
| Images | 1 year | 1 month | N/A |
| API data | No cache | No cache | N/A |
| Sitemap | 1 hour | 1 hour | N/A |
| Robots.txt | 1 day | 1 day | N/A |

---

## 6. Production Launch Checklist

### Pre-Launch

- [ ] **Meta tags implemented on all pages**
  - [ ] Title tags (50-60 chars)
  - [ ] Meta descriptions (150-160 chars)
  - [ ] OG tags for social sharing
  - [ ] Canonical URLs set
  - [ ] Structured data (JSON-LD)

- [ ] **Sitemap & Robots.txt**
  - [ ] sitemap.xml accessible at `/sitemap.xml`
  - [ ] robots.txt accessible at `/robots.txt`
  - [ ] All important URLs in sitemap
  - [ ] Sitemap submitted to Google Search Console
  - [ ] Sitemap submitted to Bing Webmaster Tools

- [ ] **Prerender Service**
  - [ ] Playwright installed on VPS
  - [ ] Redis cache configured (optional)
  - [ ] Service running with PM2/systemd
  - [ ] Auto-restart on failure configured

- [ ] **Nginx Configuration**
  - [ ] SSL certificates installed (Let's Encrypt)
  - [ ] Bot detection working
  - [ ] Static files cached properly
  - [ ] Gzip compression enabled
  - [ ] Security headers configured

### Testing

- [ ] **Bot Response Testing**
  ```bash
  # Test as Googlebot
  curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
    -I https://yourdomain.com/page

  # Verify HTML is prerendered (not empty/minimal)
  curl -A "Googlebot" https://yourdomain.com/page | grep "<title>"
  ```

- [ ] **Content Consistency Check**
  ```bash
  # Compare bot vs user HTML (should be similar)
  curl -A "Googlebot" https://yourdomain.com > bot.html
  curl -A "Mozilla" https://yourdomain.com > user.html
  diff bot.html user.html
  ```

- [ ] **Structured Data Validation**
  - [ ] Test with [Google Rich Results Test](https://search.google.com/test/rich-results)
  - [ ] Test with [Schema Markup Validator](https://validator.schema.org/)

- [ ] **Mobile-Friendly Test**
  - [ ] Test with [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

- [ ] **Core Web Vitals**
  - [ ] Run Lighthouse audit
  - [ ] Check PageSpeed Insights
  - [ ] Verify all metrics in "Good" range

- [ ] **SSL & Security**
  - [ ] SSL Labs test (A grade)
  - [ ] Security headers test
  - [ ] No mixed content warnings

### Post-Launch Monitoring

- [ ] **Google Search Console**
  - [ ] Property added and verified
  - [ ] Coverage report monitored
  - [ ] Enhancement reports checked
  - [ ] Manual actions monitored

- [ ] **Analytics**
  - [ ] Google Analytics installed
  - [ ] Search Console linked
  - [ ] Conversion tracking set up

- [ ] **Performance Monitoring**
  - [ ] Uptime monitoring (UptimeRobot, Pingdom)
  - [ ] Error tracking (Sentry)
  - [ ] Core Web Vitals monitoring

- [ ] **VPS Monitoring**
  - [ ] CPU, Memory, Disk space alerts
  - [ ] Prerender service health checks
  - [ ] Nginx access/error logs monitoring

### Ongoing Maintenance

| Task | Frequency |
|------|-----------|
| Sitemap regeneration | Daily/Weekly (cron) |
| SSL certificate renewal | Auto (Let's Encrypt) |
| Cache clearing | As needed |
| Playwright updates | Monthly |
| Dependency updates | Monthly |
| SEO audit | Quarterly |
| Core Web Vitals check | Monthly |

---

## 7. Example: Dynamic Route Handling

```jsx
// src/pages/ProductPage.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SEO from '../components/SEO';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(setProduct);
  }, [slug]);

  if (!product) return <div>Loading...</div>;

  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        ogImage={product.image}
        canonical={`https://yourdomain.com/products/${slug}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
          },
        }}
      />
      <article id="main-content">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        {/* ... */}
      </article>
    </>
  );
}
```

---

## 8. Troubleshooting Guide

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Pages not indexed** | 0 pages in Search Console | Check robots.txt, verify canonicals, submit sitemap |
| **Prerender timeout** | 504 errors | Increase Playwright timeout, optimize page load |
| **Cache not working** | Slow bot responses | Check Redis connection, verify cache keys |
| **Cloaking warning** | Google penalty | Ensure bot and user HTML content matches |
| **High TTFB** | Poor Core Web Vitals | Add CDN, optimize prerender service, use caching |
| **Missing meta tags** | Poor social previews | Verify react-helmet-async setup, check hydration |

---

## Summary

This architecture provides:

1. **Stable, long-term solution** - No framework migrations needed
2. **Hybrid rendering** - Static SSG + dynamic prerendering
3. **Google-compliant** - No cloaking, proper HTML for bots
4. **Scalable** - Redis cache, CDN support, selective prerendering
5. **Performance-focused** - Core Web Vitals optimized

**Tech Stack:**
- Frontend: React + Vite (unchanged)
- Meta tags: react-helmet-async
- Build-time: vite-plugin-prerender
- Runtime: Node.js + Express + Playwright
- Cache: Redis + Nginx + optional Cloudflare
- Server: Any VPS (DigitalOcean, Linode, Hetzner, etc.)
