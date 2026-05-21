import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiZap } from 'react-icons/fi';

const FIELDS = [
  { name: 'name', label: 'الاسم الكامل', type: 'text', placeholder: 'أحمد محمد', icon: <FiUser />, autoComplete: 'name' },
  { name: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'example@email.com', icon: <FiMail />, autoComplete: 'email' },
  { name: 'password', label: 'كلمة المرور', type: 'password', placeholder: '••••••••', icon: <FiLock />, autoComplete: 'new-password' },
  { name: 'confirm', label: 'تأكيد كلمة المرور', type: 'password', placeholder: '••••••••', icon: <FiLock />, autoComplete: 'new-password' },
];

const strengthOf = (pw) => {
  if (pw.length === 0) return null;
  if (pw.length < 6) return 'weak';
  if (pw.length < 8) return 'medium';
  return 'strong';
};

const STRENGTH_META = {
  weak: { label: 'ضعيفة', color: 'var(--danger)' },
  medium: { label: 'متوسطة', color: 'var(--warning)' },
  strong: { label: 'قوية', color: 'var(--success)' },
};

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    if (form.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('تم إنشاء الحساب بنجاح!');
      navigate('/', { replace: true });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors?.[0]?.msg || err.response?.data?.message || 'حدث خطأ';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = strengthOf(form.password);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <FiZap style={{ color: 'var(--accent)', fontSize: '2rem' }} />
          <span style={styles.logoText}>TechZone</span>
        </div>
        <h1 style={styles.title}>إنشاء حساب جديد</h1>
        <p style={styles.subtitle}>انضم إلينا وابدأ التسوق</p>

        <form onSubmit={handleSubmit}>
          {FIELDS.map((field) => (
            <div key={field.name} className="form-group">
              <label className="form-label">{field.label}</label>
              <div style={{ position: 'relative' }}>
                <span style={styles.inputIcon}>{field.icon}</span>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  className="form-input"
                  style={{ paddingRight: '44px' }}
                  required
                />
              </div>
              {field.name === 'password' && strength && (
                <div style={styles.strengthRow}>
                  {['weak', 'medium', 'strong'].map((level) => {
                    const reached =
                      (level === 'weak') ||
                      (level === 'medium' && strength !== 'weak') ||
                      (level === 'strong' && strength === 'strong');
                    return (
                      <div
                        key={level}
                        style={{
                          ...styles.strengthBar,
                          background: reached ? STRENGTH_META[strength].color : 'var(--border)',
                        }}
                      />
                    );
                  })}
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: STRENGTH_META[strength].color,
                      minWidth: '50px',
                    }}
                  >
                    {STRENGTH_META[strength].label}
                  </span>
                </div>
              )}
            </div>
          ))}

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>

        <p style={styles.loginLink}>
          لديك حساب بالفعل؟{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>
            سجّل دخولك
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    animation: 'fadeInUp 0.5s ease',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '24px',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  title: { textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' },
  subtitle: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    marginBottom: '32px',
    fontSize: '0.9rem',
  },
  inputIcon: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: 'white',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    transition: 'all 0.3s',
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '20px',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  strengthRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px',
    alignItems: 'center',
  },
  strengthBar: {
    height: '4px',
    flex: 1,
    borderRadius: '2px',
    transition: 'background 0.2s',
  },
};
