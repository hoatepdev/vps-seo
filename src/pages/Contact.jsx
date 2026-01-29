import SEO from '../components/SEO';
import { StructuredData } from '../components/SEO';

export default function Contact() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Us - VPS-SEO Demo',
    description: 'Get in touch with our team for questions about VPS-based SEO solutions',
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with our team for questions, support, or inquiries about VPS-based SEO solutions"
        canonical="https://yourdomain.com/contact"
        structuredData={structuredData}
      />
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1>Contact Us</h1>
        <p className="mt-2">
          Have questions about VPS-based SEO? We're here to help!
        </p>

        <form className="card mt-3" style={{ padding: '2rem' }}>
          <div className="mb-3">
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="5"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button type="submit" className="btn">
            Send Message
          </button>
        </form>

        <div className="mt-4">
          <h2>Other Ways to Reach Us</h2>
          <p className="mt-2">
            <strong>Email:</strong> support@yourdomain.com<br />
            <strong>Twitter:</strong> @yourhandle<br />
            <strong>GitHub:</strong> github.com/yourhandle
          </p>
        </div>
      </div>
    </>
  );
}
