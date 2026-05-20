import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX,
  FiSearch, FiZap, FiSettings,
} from 'react-icons/fi';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  
  useEffect(() => {
    if (!dropdownOpen) return;
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [dropdownOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.container}>
          <Link to="/" style={styles.logo}>
            <FiZap style={{ color: 'var(--accent)', fontSize: '1.4rem' }} />
            <span style={styles.logoText}>TechZone</span>
          </Link>

          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchBtn} aria-label="بحث">
              <FiSearch />
            </button>
          </form>

          <div style={styles.links}>
            <Link to="/products" style={styles.link}>المنتجات</Link>
            <Link to="/products?category=iPhone" style={styles.link}>آيفون</Link>
            <Link to="/products?category=iPad" style={styles.link}>آيباد</Link>
            <Link to="/products?category=MacBook" style={styles.link}>ماك بوك</Link>
          </div>

          <div style={styles.actions}>
            <button
              onClick={() => setCartOpen(true)}
              style={styles.iconBtn}
              aria-label="السلة"
            >
              <FiShoppingCart />
              {itemCount > 0 && <span style={styles.badge}>{itemCount}</span>}
            </button>

            {user ? (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  style={{ ...styles.iconBtn, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <div style={styles.avatar}>{user.name?.[0] || '?'}</div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                </button>
                {dropdownOpen && (
                  <div style={styles.dropdown}>
                    {user.role === 'admin' && (
                      <Link to="/admin" style={styles.dropItem} onClick={() => setDropdownOpen(false)}>
                        <FiSettings /> لوحة التحكم
                      </Link>
                    )}
                    <Link to="/orders" style={styles.dropItem} onClick={() => setDropdownOpen(false)}>
                      <FiShoppingCart /> طلباتي
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        ...styles.dropItem,
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        textAlign: 'right',
                        color: 'var(--danger)',
                      }}
                    >
                      <FiLogOut /> تسجيل خروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" style={styles.loginBtn}>
                <FiUser /> دخول
              </Link>
            )}
          </div>
        </div>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(5, 10, 20, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
    padding: '0 24px',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.3rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  searchForm: { flex: 1, maxWidth: '400px', display: 'flex', position: 'relative' },
  searchInput: {
    width: '100%',
    padding: '9px 16px',
    paddingLeft: '44px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '30px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.3s',
  },
  searchBtn: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  links: { display: 'flex', gap: '24px', flexShrink: 0 },
  link: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'color 0.2s',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  actions: { display: 'flex', alignItems: 'center', gap: '12px', marginRight: 'auto' },
  iconBtn: {
    position: 'relative',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '9px 12px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    background: 'var(--accent)',
    color: 'var(--bg-primary)',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '0.7rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    borderRadius: '10px',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'all 0.3s',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
    color: 'white',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '0',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    minWidth: '180px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow)',
    zIndex: 200,
  },
  dropItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'background 0.2s',
    cursor: 'pointer',
  },
};
