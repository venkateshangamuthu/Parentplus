import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartPulse, Menu, X, LogOut, User, LayoutDashboard, CalendarPlus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`nav-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="logo">
          <HeartPulse size={26} style={{ color: 'var(--primary)' }} />
          <span>ParentPlus</span>
        </Link>
        
        <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <LayoutDashboard size={16} />
                  Dashboard
                </span>
              </Link>
              {user.role === 'parent' && (
                <Link to="/booking" className={`nav-link ${isActive('/booking')}`}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CalendarPlus size={16} />
                    Book Caretaker
                  </span>
                </Link>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1rem', marginLeft: '0.5rem' }} className="auth-profile-nav">
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '28px', height: '28px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.8rem', fontWeight: 700, paddingLeft: '8px' }}>
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="user-name-label">{user.name}</span>
                </span>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-ghost" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="auth-buttons-nav">
              <Link to="/login" className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>Sign Up</Link>
            </div>
          )}
        </nav>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      
      {/* Mobile custom styles check */}
      <style>{`
        @media (max-width: 768px) {
          .auth-profile-nav {
            border-left: none !important;
            padding-left: 0 !important;
            margin-left: 0 !important;
            flex-direction: column;
            align-items: stretch !important;
            gap: 1rem !important;
          }
          .auth-buttons-nav {
            flex-direction: column;
            align-items: stretch !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
