/**
 * SEO Component - Meta tag management for React
 * Usage:
 *   <SEO
 *     title="Page Title"
 *     description="Page description for search engines"
 *     ogImage="/og-image.jpg"
 *     canonical="https://yourdomain.com/page"
 *   />
 */

import { Helmet } from 'react-helmet-async';

// Default site-wide meta configuration
const SITE_CONFIG = {
  name: 'Your Site Name',
  description: 'Your site description goes here',
  url: 'https://yourdomain.com',
  ogImage: '/og-default.jpg',
  twitterHandle: '@yourhandle',
  siteType: 'website',
};

export default function SEO({
  title,
  description = SITE_CONFIG.description,
  ogImage = SITE_CONFIG.ogImage,
  ogType = SITE_CONFIG.siteType,
  twitterCard = 'summary_large_image',
  canonical = '',
  noindex = false,
  nofollow = false,
  structuredData = null,
  alternate = null, // { lang: 'en-US', url: '...' }
}) {
  // Build full title
  const fullTitle = title
    ? `${title} | ${SITE_CONFIG.name}`
    : SITE_CONFIG.name;

  // Build canonical URL
  const canonicalUrl = canonical || `${SITE_CONFIG.url}${window.location.pathname}`;

  // Build robots meta
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  if (robotsContent.length === 0) robotsContent.push('index', 'follow');

  return (
    <Helmet>
      {/* Page Title */}
      <title>{fullTitle}</title>

      {/* Description */}
      <meta name="description" content={description} />

      {/* Robots */}
      <meta name="robots" content={robotsContent.join(', ')} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Alternate language links */}
      {alternate && (
        <link rel="alternate" hreflang={alternate.lang} href={alternate.url} />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${SITE_CONFIG.url}${ogImage}`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      {SITE_CONFIG.twitterHandle && (
        <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      )}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_CONFIG.url}${ogImage}`} />

      {/* Additional meta tags */}
      <meta name="theme-color" content="#000000" />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

/**
 * Helper for structured data templates
 */
export const StructuredData = {
  // Organization schema
  organization: ({
    name,
    url,
    logo,
    description,
    socialLinks = [],
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs: socialLinks,
  }),

  // Article/Blog schema
  article: ({
    headline,
    image,
    datePublished,
    dateModified,
    authorName,
    publisherName,
    publisherLogo,
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    image: [image],
    datePublished,
    dateModified,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo,
      },
    },
  }),

  // Product schema
  product: ({
    name,
    image,
    description,
    brand,
    price,
    priceCurrency,
    availability = 'InStock',
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image,
    description,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency,
      availability: `https://schema.org/${availability}`,
    },
  }),

  // Breadcrumb schema
  breadcrumb: (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  // LocalBusiness schema
  localBusiness: ({
    name,
    image,
    address,
    telephone,
    priceRange,
    openingHours,
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    image,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.zip,
      addressCountry: address.country,
    },
    telephone,
    priceRange,
    openingHours,
  }),
};
