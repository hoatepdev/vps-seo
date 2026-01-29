import SEO from '../components/SEO';
import { StructuredData } from '../components/SEO';

export default function About() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About VPS-SEO Demo',
    description: 'Learn about our VPS-based SEO solution for React applications',
  };

  return (
    <>
      <SEO
        title="About Us"
        description="Learn about VPS-SEO Demo - A modern approach to SEO for React single-page applications"
        canonical="https://yourdomain.com/about"
        structuredData={structuredData}
      />
      <div className="container">
        <h1>About VPS-SEO Demo</h1>
        <p className="mt-2">
          This project demonstrates a production-ready SEO architecture for React + Vite applications
          that doesn't require migrating to Next.js or other frequently-changing frameworks.
        </p>

        <h2 className="mt-4">Our Mission</h2>
        <p className="mt-2">
          We believe that developers should have stable, long-term solutions for SEO that don't
          require constant framework migrations. Our VPS-based prerendering approach provides
          excellent search engine visibility while keeping your existing React stack.
        </p>

        <h2 className="mt-4">How It Works</h2>
        <ul className="mt-2" style={{ lineHeight: '2' }}>
          <li><strong>Static routes</strong> - Prerendered at build time using Vite-SSG</li>
          <li><strong>Dynamic routes</strong> - Prerendered at runtime using Playwright on VPS</li>
          <li><strong>Bot detection</strong> - Nginx routes search engine bots to prerendered HTML</li>
          <li><strong>Regular users</strong> - Get the full SPA experience with client-side routing</li>
        </ul>

        <h2 className="mt-4">Why This Approach?</h2>
        <div className="grid mt-2">
          <div className="card">
            <div className="card-content">
              <h3>Stability</h3>
              <p>No framework migrations. Use the same React + Vite stack for years.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <h3>Control</h3>
              <p>Full control over your infrastructure. No vendor lock-in.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <h3>Performance</h3>
              <p>Excellent Core Web Vitals with smart caching strategies.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
