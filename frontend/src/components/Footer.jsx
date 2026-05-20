import { Link } from 'react-router-dom';
import { FiZap, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid}>
          <div>
            <div style={styles.logo}>
              <FiZap style={{ color: 'var(--accent)', fontSize: '1.3rem' }} />
              <span style={styles.logoText}>TechZone</span>
            </div>
            <p style={styles.desc}>متجرك الأول للإلكترونيات بأعلى جودة وأفضل الأسعار في مصر</p>
            <div style={styles.socials}>
              {['Facebook', 'Instagram', 'Twitter', 'YouTube'].map((s) => (
                <span key={s} style={styles.socialTag}>{s}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={styles.colTitle}>الفئات</h4>
            {['iPhone', 'iPad', 'MacBook', 'Android', 'Tablet', 'Smartwatch'].map((cat) => (
              <Link key={cat} to={`/products?category=${cat}`} style={styles.footerLink}>{cat}</Link>
            ))}
          </div>

          <div>
            <h4 style={styles.colTitle}>روابط سريعة</h4>
            {[
              { to: '/', label: 'الرئيسية' },
              { to: '/products', label: 'جميع المنتجات' },
              { to: '/orders', label: 'طلباتي' },
              { to: '/register', label: 'إنشاء حساب' },
              { to: '/login', label: 'تسجيل دخول' },
            ].map((l) => (
              <Link key={l.to} to={l.to} style={styles.footerLink}>{l.label}</Link>
            ))}
          </div>

          <div>
            <h4 style={styles.colTitle}>تواصل معنا</h4>
            {[
              { icon: <FiPhone />, text: '01000000000' },
              { icon: <FiMail />, text: 'support@techzone.com' },
              { icon: <FiMapPin />, text: 'القاهرة، مصر' },
            ].map((c, i) => (
              <div key={i} style={styles.contactItem}>
                <span style={{ color: 'var(--accent)' }}>{c.icon}</span>
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.bottom}>
          <span>© {new Date().getFullYear()} TechZone — جميع الحقوق محفوظة</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
             دفع آمن |  شحن سريع |  ضمان أصلي
          </span>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', marginTop: '80px' },
  container: { maxWidth: '1400px', margin: '0 auto', padding: '60px 24px 24px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '40px',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.2rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  desc: { color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '16px' },
  socials: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  socialTag: {
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
  },
  colTitle: { fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', fontSize: '0.95rem' },
  footerLink: {
    display: 'block',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    marginBottom: '10px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    marginBottom: '12px',
  },
  bottom: {
    borderTop: '1px solid var(--border)',
    paddingTop: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
};
