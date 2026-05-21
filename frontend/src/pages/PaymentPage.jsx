import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiCreditCard, FiCheck, FiShoppingBag,
  FiTruck, FiDollarSign,
} from 'react-icons/fi';

const STEPS = [
  { id: 1, label: 'الشحن' },
  { id: 2, label: 'الدفع' },
  { id: 3, label: 'تأكيد' },
];

const fmt = (n) => Number(n || 0).toLocaleString();

export default function PaymentPage() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'مصر',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const shippingPrice = total > 5000 ? 0 : 99;
  const tax = Math.round(total * 0.14);
  const grandTotal = total + shippingPrice + tax;

  const validateShipping = () => {
    const required = ['fullName', 'address', 'city', 'phone'];
    for (const f of required) {
      if (!shipping[f].trim()) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        return false;
      }
    }
    return true;
  };


  const validateCard = () => {
    if (paymentMethod !== 'Card') return true;
    const digits = card.number.replace(/\s/g, '');
    if (digits.length < 13 || digits.length > 19 || !/^\d+$/.test(digits)) {
      toast.error('رقم البطاقة غير صحيح');
      return false;
    }
    if (!card.name.trim()) {
      toast.error('أدخل الاسم على البطاقة');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
      toast.error('تاريخ الانتهاء بصيغة MM/YY');
      return false;
    }
    if (!/^\d{3,4}$/.test(card.cvv)) {
      toast.error('رمز CVV غير صحيح');
      return false;
    }
    return true;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!validateCard()) return;

    setLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({ product: item._id, quantity: item.quantity })),
        shippingAddress: shipping,
        paymentMethod,
      };
      const res = await api.post('/orders', orderData);
      const order = res.data;

      if (paymentMethod === 'Card') {
        await api.put(`/orders/${order._id}/pay`, { id: `CARD-${Date.now()}` });
      }

      setOrderId(order._id);
      clearCart();
      setStep(3);
      toast.success('تم تأكيد طلبك بنجاح!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ في معالجة الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div style={styles.empty}>
        <FiShoppingBag style={{ fontSize: '4rem', color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>سلتك فارغة</p>
        <button onClick={() => navigate('/products')} style={styles.btnPrimary}>تسوق الآن</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', animation: 'fadeInUp 0.5s ease' }}>
      <div className="container" style={{ padding: 0, maxWidth: '900px' }}>
        {/* Stepper */}
        <div style={styles.stepper}>
          {STEPS.map((s, i) => {
            const reached = step >= s.id;
            return (
              <div key={s.id} style={styles.stepItem}>
                <div
                  style={{
                    ...styles.stepCircle,
                    background: reached
                      ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                      : 'var(--bg-card)',
                    color: reached ? 'white' : 'var(--text-muted)',
                    border: reached ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {step > s.id ? <FiCheck /> : s.id}
                </div>
                <span
                  style={{
                    ...styles.stepLabel,
                    color: reached ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      ...styles.stepLine,
                      background: step > s.id ? 'var(--accent)' : 'var(--border)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Shipping */}
        {step === 1 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}><FiTruck /> عنوان الشحن</h2>
            <form onSubmit={handleShippingSubmit}>
              <div style={styles.formGrid}>
                {[
                  { key: 'fullName', label: 'الاسم الكامل *', placeholder: 'أحمد محمد' },
                  { key: 'phone', label: 'رقم الهاتف *', placeholder: '01000000000' },
                  { key: 'address', label: 'العنوان *', placeholder: 'الشارع، رقم المبنى', span: true },
                  { key: 'city', label: 'المدينة *', placeholder: 'القاهرة' },
                  { key: 'postalCode', label: 'الرمز البريدي', placeholder: '11511' },
                  { key: 'country', label: 'الدولة *', placeholder: 'مصر' },
                ].map((f) => (
                  <div key={f.key} style={f.span ? { gridColumn: 'span 2' } : undefined}>
                    <label className="form-label">{f.label}</label>
                    <input
                      className="form-input"
                      value={shipping[f.key]}
                      onChange={(e) => setShipping((s) => ({ ...s, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      required={f.label.includes('*')}
                    />
                  </div>
                ))}
              </div>
              <button type="submit" style={styles.btnPrimary}>
                التالي
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Payment + summary */}
        {step === 2 && (
          <div style={styles.twoCol}>
            <div style={{ ...styles.card, flex: 1 }}>
              <h2 style={styles.cardTitle}><FiCreditCard /> طريقة الدفع</h2>
              <div style={styles.methodList}>
                {[
                  { value: 'Cash on Delivery', icon: <FiDollarSign />, label: 'الدفع عند الاستلام', sub: 'ادفع نقداً عند استلام الطلب' },
                  { value: 'Card', icon: <FiCreditCard />, label: 'بطاقة ائتمانية', sub: 'فيزا، ماستركارد' },
                  { value: 'Vodafone Cash', icon: <FiDollarSign />, label: 'فودافون كاش', sub: 'دفع عبر المحفظة' },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => setPaymentMethod(m.value)}
                    style={{
                      ...styles.methodBtn,
                      borderColor: paymentMethod === m.value ? 'var(--accent)' : 'var(--border)',
                      background: paymentMethod === m.value ? 'rgba(0,212,255,0.05)' : 'var(--bg-secondary)',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', color: 'var(--accent)' }}>{m.icon}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{m.label}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{m.sub}</div>
                    </div>
                  </button>
                ))}
              </div>

              {paymentMethod === 'Card' && (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    className="form-input"
                    placeholder="رقم البطاقة"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: e.target.value })}
                    inputMode="numeric"
                    autoComplete="cc-number"
                  />
                  <input
                    className="form-input"
                    placeholder="الاسم على البطاقة"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    autoComplete="cc-name"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input
                      className="form-input"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                      autoComplete="cc-exp"
                    />
                    <input
                      className="form-input"
                      placeholder="CVV"
                      value={card.cvv}
                      onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setStep(1)} style={styles.btnOutline}>
                  السابق
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  style={{ ...styles.btnPrimary, flex: 1, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب'}
                </button>
              </div>
            </div>

            {/* Summary */}
            <aside style={{ ...styles.card, width: '320px', height: 'fit-content' }}>
              <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>ملخص الطلب</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {cart.map((item) => (
                  <div key={item._id} style={styles.summaryItem}>
                    <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                      {fmt(item.price * item.quantity)} ج.م
                    </span>
                  </div>
                ))}
              </div>
              <div style={styles.summaryDivider} />
              {[
                { label: 'الإجمالي الفرعي', val: fmt(total) },
                { label: 'الشحن', val: shippingPrice === 0 ? 'مجاني' : `${fmt(shippingPrice)} ج.م` },
                { label: 'الضريبة (14%)', val: `${fmt(tax)} ج.م` },
              ].map((row) => (
                <div key={row.label} style={styles.summaryRow}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{row.label}</span>
                  <span style={{ fontWeight: '600' }}>{row.val} {row.val !== 'مجاني' && row.label === 'الإجمالي الفرعي' ? 'ج.م' : ''}</span>
                </div>
              ))}
              <div style={styles.summaryDivider} />
              <div style={styles.totalRow}>
                <span style={{ fontWeight: '700' }}>الإجمالي</span>
                <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent)' }}>
                  {fmt(grandTotal)} ج.م
                </span>
              </div>
            </aside>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div style={{ ...styles.card, textAlign: 'center' }}>
            <div style={styles.successIcon}><FiCheck /></div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '12px' }}>
              تم تأكيد طلبك بنجاح!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
              شكراً لطلبك. سنقوم بإرسال تفاصيل الشحن قريباً.
            </p>
            {orderId && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                رقم الطلب: <span style={{ color: 'var(--accent)', fontWeight: '700' }}>
                  #{orderId.slice(-8).toUpperCase()}
                </span>
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/orders')} style={styles.btnPrimary}>طلباتي</button>
              <button onClick={() => navigate('/products')} style={styles.btnOutline}>متابعة التسوق</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  empty: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  stepper: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative' },
  stepItem: { display: 'flex', alignItems: 'center', flex: 1, position: 'relative' },
  stepCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    transition: 'all 0.3s',
    flexShrink: 0,
  },
  stepLabel: { marginRight: '12px', fontWeight: '600', fontSize: '0.9rem' },
  stepLine: { flex: 1, height: '2px', margin: '0 12px', transition: 'background 0.3s' },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.2rem',
    fontWeight: '700',
    marginBottom: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  },
  twoCol: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  methodList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  methodBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    border: '1px solid',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'right',
    width: '100%',
    fontFamily: 'var(--font-main)',
  },
  btnPrimary: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '1rem',
    fontFamily: 'var(--font-main)',
    transition: 'all 0.3s',
  },
  btnOutline: {
    padding: '12px 28px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-main)',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  summaryDivider: { height: '1px', background: 'var(--border)', margin: '12px 0' },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '8px 0',
  },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'var(--success)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    margin: '0 auto 24px',
  },
};
