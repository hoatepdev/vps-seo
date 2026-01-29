import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { StructuredData } from '../components/SEO';
import { blogPosts } from './Blog';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const found = blogPosts.find((p) => p.slug === slug);
      setPost(found || null);
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

  if (!post) {
    return (
      <>
        <SEO title="Post Not Found" noindex />
        <div className="container">
          <h1>Post Not Found</h1>
          <Link to="/blog">Back to Blog</Link>
        </div>
      </>
    );
  }

  const structuredData = StructuredData.article({
    headline: post.title,
    image: post.image,
    datePublished: post.date,
    dateModified: post.date,
    authorName: post.author,
    publisherName: 'VPS-SEO Demo',
    publisherLogo: 'https://yourdomain.com/logo.png',
  });

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        ogImage={post.image}
        ogType="article"
        canonical={`https://yourdomain.com/blog/${post.slug}`}
        structuredData={structuredData}
      />
      <article className="container" style={{ maxWidth: '800px' }}>
        <Link to="/blog" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          ← Back to Blog
        </Link>

        <img
          src={post.image}
          alt={post.title}
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
        />

        <p className="text-sm" style={{ color: '#64748b', marginTop: '1rem' }}>
          {post.date} • By {post.author}
        </p>

        <h1 style={{ fontSize: '2rem', marginTop: '1rem' }}>{post.title}</h1>

        <div className="mt-3" style={{ lineHeight: '1.8' }}>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

          <h2 className="mt-4">Key Points</h2>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
          eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.</p>

          <h3 className="mt-4">Why This Matters</h3>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
          doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
          veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>

          <h3 className="mt-4">Implementation</h3>
          <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
          sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>

          <h2 className="mt-4">Conclusion</h2>
          <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis
          praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias
          excepturi sint occaecati cupiditate non provident.</p>
        </div>
      </article>
    </>
  );
}
