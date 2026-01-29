import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { StructuredData } from '../components/SEO';

// Sample product data (in production, fetch from API)
const products = [
  {
    id: 1,
    slug: 'seo-audit-tool',
    name: 'SEO Audit Tool',
    description: 'Comprehensive SEO analysis for your website',
    price: 99,
    image: 'https://via.placeholder.com/400x200/2563eb/ffffff?text=SEO+Audit+Tool',
  },
  {
    id: 2,
    slug: 'rank-tracker',
    name: 'Rank Tracker',
    description: 'Track your search engine rankings over time',
    price: 79,
    image: 'https://via.placeholder.com/400x200/7c3aed/ffffff?text=Rank+Tracker',
  },
  {
    id: 3,
    slug: 'backlink-monitor',
    name: 'Backlink Monitor',
    description: 'Monitor and analyze your backlink profile',
    price: 89,
    image: 'https://via.placeholder.com/400x200/059669/ffffff?text=Backlink+Monitor',
  },
  {
    id: 4,
    slug: 'keyword-research',
    name: 'Keyword Research',
    description: 'Discover high-value keywords for your niche',
    price: 69,
    image: 'https://via.placeholder.com/400x200/dc2626/ffffff?text=Keyword+Research',
  },
];

export default function Products() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Products - VPS-SEO Demo',
    description: 'Browse our collection of SEO tools',
  };

  return (
    <>
      <SEO
        title="Products"
        description="Browse our collection of SEO tools and services to improve your website's search engine visibility"
        canonical="https://yourdomain.com/products"
        structuredData={structuredData}
      />
      <div className="container">
        <h1>Our Products</h1>
        <p className="mt-2">
          Professional SEO tools to help your website rank higher in search engines.
        </p>

        <div className="grid mt-3">
          {products.map((product) => (
            <div className="card" key={product.id}>
              <img src={product.image} alt={product.name} />
              <div className="card-content">
                <h3>{product.name}</h3>
                <p className="mt-1">{product.description}</p>
                <p className="mt-2">
                  <strong>${product.price}/month</strong>
                </p>
                <Link to={`/products/${product.slug}`}>Learn More →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export { products };
