/**
 * Sitemap Generator
 * Generates both static and dynamic sitemaps for your React SPA
 *
 * Usage:
 *   node scripts/generate-sitemap.js
 *
 * Add to package.json:
 *   "scripts": {
 *     "generate-sitemap": "node scripts/generate-sitemap.js"
 *   }
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// CONFIGURATION
// ============================================================================

const SITE_URL = 'https://yourdomain.com';

// Static routes (always included in sitemap)
const STATIC_ROUTES = [
  { path: '', changefreq: 'daily', priority: 1.0 },
  { path: '/about', changefreq: 'monthly', priority: 0.8 },
  { path: '/contact', changefreq: 'monthly', priority: 0.6 },
  { path: '/products', changefreq: 'weekly', priority: 0.9 },
  { path: '/blog', changefreq: 'weekly', priority: 0.8 },
];

// API endpoints for dynamic routes
const API_ENDPOINTS = {
  products: 'https://api.yourdomain.com/products',
  blog: 'https://api.yourdomain.com/blog/posts',
  // Add more endpoints as needed
};

// Routes to exclude from sitemap
const EXCLUDE_ROUTES = [
  '/admin',
  '/api',
  '/auth',
  '/user',
  '/cart',
  '/checkout',
];

// ============================================================================
// DYNAMIC ROUTE GENERATORS
// ============================================================================

/**
 * Fetch product routes from API
 */
async function getProductRoutes() {
  try {
    const response = await fetch(API_ENDPOINTS.products);
    if (!response.ok) return [];

    const products = await response.json();
    return products.map((product) => ({
      path: `/products/${product.slug}`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: product.updatedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch product routes:', error.message);
    return [];
  }
}

/**
 * Fetch blog post routes from API
 */
async function getBlogRoutes() {
  try {
    const response = await fetch(API_ENDPOINTS.blog);
    if (!response.ok) return [];

    const posts = await response.json();
    return posts.map((post) => ({
      path: `/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: post.publishedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch blog routes:', error.message);
    return [];
  }
}

/**
 * Fetch category routes from API
 */
async function getCategoryRoutes() {
  try {
    const response = await fetch('https://api.yourdomain.com/categories');
    if (!response.ok) return [];

    const categories = await response.json();
    return categories.map((category) => ({
      path: `/category/${category.slug}`,
      changefreq: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Failed to fetch category routes:', error.message);
    return [];
  }
}

// ============================================================================
// SITEMAP GENERATION
// ============================================================================

/**
 * Format date for sitemap
 */
function formatDate(date) {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Generate URL element for sitemap
 */
function generateUrlElement(route) {
  const url = SITE_URL + route.path;
  const lastmod = route.lastmod || formatDate(new Date());
  const changefreq = route.changefreq || 'weekly';
  const priority = route.priority || 0.5;

  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Generate full sitemap XML
 */
function generateSitemapXML(routes) {
  const urlElements = routes.map(generateUrlElement).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlElements}
</urlset>`;
}

/**
 * Generate sitemap index (for multiple sitemaps)
 */
function generateSitemapIndex(sitemaps) {
  const sitemapElements = sitemaps
    .map(
      (sm) => `  <sitemap>
    <loc>${SITE_URL}/sitemaps/${sm.name}</loc>
    <lastmod>${sm.lastmod}</lastmod>
  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🗺️  Generating sitemap...\n');

  // Fetch all dynamic routes
  const [productRoutes, blogRoutes, categoryRoutes] = await Promise.all([
    getProductRoutes(),
    getBlogRoutes(),
    getCategoryRoutes(),
  ]);

  // Combine all routes
  const allRoutes = [...STATIC_ROUTES, ...productRoutes, ...blogRoutes, ...categoryRoutes];

  // Filter out excluded routes
  const filteredRoutes = allRoutes.filter(
    (route) => !EXCLUDE_ROUTES.some((exclude) => route.path.startsWith(exclude))
  );

  console.log(`   Static routes: ${STATIC_ROUTES.length}`);
  console.log(`   Product routes: ${productRoutes.length}`);
  console.log(`   Blog routes: ${blogRoutes.length}`);
  console.log(`   Category routes: ${categoryRoutes.length}`);
  console.log(`   Total routes: ${filteredRoutes.length}\n`);

  // Generate sitemap XML
  const xml = generateSitemapXML(filteredRoutes);

  // Ensure public directory exists
  const publicDir = path.resolve(__dirname, '../public');
  await fs.mkdir(publicDir, { recursive: true });

  // Write sitemap
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  await fs.writeFile(sitemapPath, xml);

  console.log(`✅ Sitemap generated: ${sitemapPath}`);
  console.log(`   Access at: ${SITE_URL}/sitemap.xml\n`);

  // Optionally generate sitemap index for large sites
  if (filteredRoutes.length > 1000) {
    console.log('⚠️  Consider splitting into multiple sitemaps (limit: 50,000 URLs per sitemap)');
  }
}

main().catch(console.error);
