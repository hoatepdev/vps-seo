import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { StructuredData } from '../components/SEO';

export default function Home() {
  const structuredData = StructuredData.organization({
    name: 'VPS-SEO Demo',
    url: 'https://yourdomain.com',
    logo: 'https://yourdomain.com/logo.png',
    description: 'A demonstration of VPS-based SEO for React + Vite applications',
    socialLinks: [
      'https://twitter.com/yourhandle',
      'https://github.com/yourhandle',
    ],
  });

  return (
    <>
      <SEO
        title="Home"
        description="Welcome to VPS-SEO Demo - A production-ready SEO solution for React + Vite SPAs without Next.js"
        canonical="https://yourdomain.com/"
        structuredData={structuredData}
      />
      <section className="hero">
        <div className="container">
          <h1>VPS-Based SEO for React + Vite</h1>
          <p>A production-ready, stable solution without Next.js</p>
        </div>
      </section>

      <section className="container mt-4">
        <h2 className="text-center mb-3">Features</h2>
        <div className="grid">
          <div className="card">
            <div className="card-content">
              <h3>🔍 SEO Optimized</h3>
              <p>Full meta tag support, structured data, and sitemap generation.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <h3>⚡ Fast Performance</h3>
              <p>Static prerendering at build time, dynamic prerendering on VPS.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <h3>🚀 No Framework Lock-in</h3>
              <p>Keep using React + Vite. No Next.js migration needed.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <h3>💰 Cost Effective</h3>
              <p>VPS-based solution for ~$10-30/month. No SaaS fees.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/about" className="btn">Learn More</Link>
          <Link to="/products" className="btn btn-secondary" style={{ marginLeft: '1rem' }}>
            View Products
          </Link>
        </div>
      </section>
    </>
  );
}
