import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { FiArrowLeft, FiZap, FiShield, FiTruck, FiHeadphones } from 'react-icons/fi';

const CATEGORIES = [
  { name: 'iPhone', icon: '📱', color: '#00d4ff' },
  { name: 'iPad', icon: '⬛', color: '#7b2fff' },
  { name: 'MacBook', icon: '💻', color: '#ffd700' },
  { name: 'Android', icon: '🤖', color: '#00e676' },
  { name: 'Tablet', icon: '📲', color: '#ff6b6b' },
  { name: 'Accessories', icon: '🎧', color: '#ff9f43' },
  { name: 'Laptop', icon: '🖥️', color: '#ee5a24' },
  { name: 'Smartwatch', icon: '⌚', color: '#a29bfe' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/products/featured')
      .then((res) => { if (!cancelled) setFeatured(res.data); })
      .catch(() => { if (!cancelled) setFeatured([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <div style={styles.heroLabel}>
            <FiZap /> أحدث التقنيات
          </div>
          <h1 style={styles.heroTitle}>
            اكتشف عالم<br />
            <span style={styles.heroGradient}>الإلكترونيات</span>
          </h1>
          <p style={styles.heroSubtitle}>
            أحدث الأجهزة الإلكترونية بأفضل الأسعار<br />
            شحن سريع · ضمان أصلي · دعم على مدار الساعة
          </p>
          <div style={styles.heroBtns}>
            <Link to="/products" style={styles.heroBtn}>
              تسوق الآن <FiArrowLeft />
            </Link>
            <Link to="/products?category=iPhone" style={styles.heroBtnOutline}>
              آيفون 15 الجديد
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <div className="container">
          <div style={styles.featuresGrid}>
            {[
              { icon: <FiTruck />, title: 'شحن مجاني', desc: 'على الطلبات فوق 5000 ج.م' },
              { icon: <FiShield />, title: 'ضمان أصلي', desc: 'ضمان المصنع الكامل' },
              { icon: <FiZap />, title: 'توصيل سريع', desc: 'خلال 24-48 ساعة' },
              { icon: <FiHeadphones />, title: 'دعم فني', desc: '24/7 لخدمتك' },
            ].map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <div>
                  <div style={styles.featureTitle}>{f.title}</div>
                  <div style={styles.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <h2 className="section-title">تسوق حسب <span>الفئة</span></h2>
          <p className="section-subtitle">اختر الفئة المفضلة لديك</p>
          <div style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                style={styles.catCard}
              >
                <span style={styles.catIcon}>{cat.icon}</span>
                <span style={{ ...styles.catName, color: cat.color }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Featured Products */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            <div>
              <h2 className="section-title">المنتجات <span>المميزة</span></h2>
              <p className="section-subtitle">أفضل اختياراتنا لك</p>
            </div>
            <Link to="/products" style={styles.seeAll}>
              عرض الكل <FiArrowLeft />
            </Link>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '380px' }} />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              لا توجد منتجات مميزة حالياً
            </p>
          ) : (
            <div className="products-grid">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '80px 24px',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse at 60% 50%, rgba(0,212,255,0.08) 0%, transparent 60%),
      radial-gradient(ellipse at 90% 80%, rgba(123,47,255,0.08) 0%, transparent 50%)
    `,
  },
  heroContent: { maxWidth: '1400px', margin: '0 auto', width: '100%', flex: 1, zIndex: 1 },
  heroLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(0,212,255,0.1)',
    border: '1px solid var(--accent)',
    borderRadius: '30px',
    padding: '6px 18px',
    color: 'var(--accent)',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '24px',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(2rem, 5vw, 4rem)',
    fontWeight: '900',
    lineHeight: '1.2',
    marginBottom: '20px',
    color: 'var(--text-primary)',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.8',
    marginBottom: '36px',
    maxWidth: '500px',
  },
  heroBtns: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  heroBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '700',
    fontSize: '1rem',
    textDecoration: 'none',
    transition: 'all 0.3s',
  },
  heroBtnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 32px',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '1rem',
    textDecoration: 'none',
    background: 'rgba(255,255,255,0.03)',
    transition: 'all 0.3s',
  },
  features: {
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    padding: '32px 24px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
  },
  featureCard: { display: 'flex', alignItems: 'center', gap: '16px' },
  featureIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(0,212,255,0.1)',
    border: '1px solid var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--accent)',
    fontSize: '1.3rem',
    flexShrink: 0,
  },
  featureTitle: { fontWeight: '700', marginBottom: '4px' },
  featureDesc: { fontSize: '0.85rem', color: 'var(--text-muted)' },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '16px',
  },
  catCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    textDecoration: 'none',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  catIcon: { fontSize: '2rem' },
  catName: { fontWeight: '600', fontSize: '0.9rem' },
  seeAll: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--accent)',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '0.95rem',
    flexShrink: 0,
  },
};
