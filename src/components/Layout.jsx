import { Link, useLocation } from 'react-router-dom';
import SEO from './SEO';

export default function Layout({ children }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      <SEO />
      <header>
        <div className="container">
          <Link to="/" className="logo">VPS-SEO Demo</Link>
          <nav>
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/about" className={isActive('/about')}>About</Link>
            <Link to="/products" className={isActive('/products')}>Products</Link>
            <Link to="/blog" className={isActive('/blog')}>Blog</Link>
            <Link to="/contact" className={isActive('/contact')}>Contact</Link>
          </nav>
        </div>
      </header>
      <main id="main-content">
        {children}
      </main>
      <footer>
        <div className="container">
          <p>&copy; 2024 VPS-SEO Demo. Built with React + Vite.</p>
        </div>
      </footer>
    </>
  );
}
