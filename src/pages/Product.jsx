import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { StructuredData } from '../components/SEO';
import { products } from './Products';

export default function Product() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const found = products.find((p) => p.slug === slug);
      setProduct(found || null);
      setLoading(false);
    }, 100);
  }, [slug]);

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <SEO title="Product Not Found" noindex />
        <div className="container">
          <h1>Product Not Found</h1>
          <Link to="/products">Back to Products</Link>
        </div>
      </>
    );
  }

  const structuredData = StructuredData.product({
    name: product.name,
    image: product.image,
    description: product.description,
    brand: 'VPS-SEO Demo',
    price: product.price,
    priceCurrency: 'USD',
  });

  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        ogImage={product.image}
        canonical={`https://yourdomain.com/products/${product.slug}`}
        structuredData={structuredData}
      />
      <div className="container">
        <Link to="/products" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          ← Back to Products
        </Link>
        <div className="card" style={{ maxWidth: '600px' }}>
          <img src={product.image} alt={product.name} />
          <div className="card-content">
            <h1>{product.name}</h1>
            <p className="mt-2">{product.description}</p>
            <p className="mt-3">
              <strong>Price: ${product.price}/month</strong>
            </p>
            <button className="btn mt-3">Get Started</button>
          </div>
        </div>

        <h2 className="mt-4">Features</h2>
        <ul className="mt-2">
          <li>Real-time data updates</li>
          <li>Export to CSV and PDF</li>
          <li>Historical data tracking</li>
          <li>Custom reports and dashboards</li>
          <li>API access for developers</li>
        </ul>
      </div>
    </>
  );
}
