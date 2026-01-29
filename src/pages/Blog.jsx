import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

// Sample blog posts (in production, fetch from API)
const blogPosts = [
  {
    id: 1,
    slug: 'seo-for-react-spa',
    title: 'SEO for React SPA: Complete Guide',
    excerpt: 'Learn how to make your React single-page application SEO-friendly without Next.js',
    date: '2024-01-15',
    author: 'SEO Expert',
    image: 'https://via.placeholder.com/400x200/2563eb/ffffff?text=SEO+for+React',
  },
  {
    id: 2,
    slug: 'vps-prerendering-architecture',
    title: 'VPS Prerendering Architecture Explained',
    excerpt: 'Deep dive into our VPS-based prerendering solution for modern web applications',
    date: '2024-01-10',
    author: 'DevOps Engineer',
    image: 'https://via.placeholder.com/400x200/7c3aed/ffffff?text=VPS+Architecture',
  },
  {
    id: 3,
    slug: 'core-web-vitals-optimization',
    title: 'Optimizing Core Web Vitals',
    excerpt: 'Practical tips to improve LCP, FID, and CLS for better search rankings',
    date: '2024-01-05',
    author: 'Performance Expert',
    image: 'https://via.placeholder.com/400x200/059669/ffffff?text=Core+Web+Vitals',
  },
];

export default function Blog() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'VPS-SEO Blog',
    description: 'Tips and tutorials for SEO and web development',
  };

  return (
    <>
      <SEO
        title="Blog"
        description="Latest articles about SEO, web development, and performance optimization"
        canonical="https://yourdomain.com/blog"
        structuredData={structuredData}
      />
      <div className="container">
        <h1>Blog</h1>
        <p className="mt-2">
          Latest insights on SEO, web development, and performance optimization.
        </p>

        <div className="grid mt-3">
          {blogPosts.map((post) => (
            <article className="card" key={post.id}>
              <img src={post.image} alt={post.title} />
              <div className="card-content">
                <p className="text-sm" style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  {post.date} • By {post.author}
                </p>
                <h3 className="mt-1">{post.title}</h3>
                <p className="mt-1">{post.excerpt}</p>
                <Link to={`/blog/${post.slug}`} className="mt-2">Read More →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

export { blogPosts };
