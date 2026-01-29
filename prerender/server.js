/**
 * Prerender Service for SEO
 * Runs on VPS and renders React SPA for bots
 *
 * Usage:
 *   npm install
 *   node server.js
 */

import express from 'express';
import { chromium } from 'playwright';
import crypto from 'crypto';

// Optional: Redis for caching
let redis;
try {
  const redisModule = await import('redis');
  redis = redisModule.default.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });
  await redis.connect();
  console.log('✅ Redis connected for caching');
} catch (err) {
  console.log('⚠️  Redis not available, running without cache');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const CONFIG = {
  // Your SPA URL (where to fetch pages from)
  spaUrl: process.env.SPA_URL || 'https://yourdomain.com',

  // Playwright options
  viewport: { width: 1200, height: 800 },
  timeout: 30000,

  // Cache TTL in seconds
  cacheTTL: {
    default: 3600,     // 1 hour
    static: 86400,     // 24 hours
    dynamic: 1800,     // 30 minutes
  },

  // Routes with longer cache (static pages)
  staticRoutes: ['/', '/about', '/contact', '/products'],

  // Routes to skip prerendering
  skipRoutes: ['/api/', '/admin/', '/cdn-cgi/'],
};

// Generate cache key
function getCacheKey(url) {
  return `prerender:${crypto.createHash('sha256').update(url).digest('hex')}`;
}

// Get TTL for route
function getTTLForRoute(pathname) {
  // Check if should skip
  for (const skip of CONFIG.skipRoutes) {
    if (pathname.startsWith(skip)) return null;
  }

  // Static routes get longer TTL
  for (const static of CONFIG.staticRoutes) {
    if (pathname === static || pathname.startsWith(static + '?')) {
      return CONFIG.cacheTTL.static;
    }
  }

  return CONFIG.cacheTTL.default;
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
    await page.setViewport(CONFIG.viewport);

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (compatible; Prerender/+https://github.com/prerender/prerender)'
    );

    // Navigate and wait for network idle
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout,
    });

    // Wait a bit more for dynamic content
    await page.waitForTimeout(1000);

    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
}

// Main route - renders any URL
app.get('*', async (req, res) => {
  // Build the full URL
  const url = CONFIG.spaUrl + req.originalUrl;

  console.log(`[${new Date().toISOString()}] Prerendering: ${url}`);

  // Check if should skip
  const ttl = getTTLForRoute(req.path);
  if (ttl === null) {
    console.log(`  → Skipping prerender for: ${req.path}`);
    return res.status(404).send('Not found');
  }

  try {
    // Check cache
    if (redis) {
      const cacheKey = getCacheKey(url);
      const cached = await redis.get(cacheKey);

      if (cached) {
        console.log(`  → Cache HIT: ${url}`);
        res.set('X-Prerender-Cache', 'HIT');
        res.set('Content-Type', 'text/html; charset=utf-8');
        return res.send(cached);
      }
    }

    console.log(`  → Cache MISS, rendering: ${url}`);
    res.set('X-Prerender-Cache', 'MISS');

    // Render the page
    const html = await renderPage(url);

    // Cache the result
    if (redis) {
      const cacheKey = getCacheKey(url);
      await redis.setEx(cacheKey, ttl, html);
    }

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

  } catch (error) {
    console.error(`  ✗ Error prerendering ${url}:`, error.message);

    // Return minimal HTML with redirect on error
    res.status(500).set('Content-Type', 'text/html; charset=utf-8').send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Redirecting...</title>
        </head>
        <body>
          <script>window.location.href = '${url}';</script>
        </body>
      </html>
    `);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Prerender server running on port ${PORT}`);
  console.log(`   SPA URL: ${CONFIG.spaUrl}`);
  console.log(`   Redis: ${redis ? 'enabled' : 'disabled'}`);
});
