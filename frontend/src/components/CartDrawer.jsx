import { useCart } from '../context/CartContext';
import { FiX, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const fmt = (n) => Number(n || 0).toLocaleString();

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={styles.overlay} />
      <div style={styles.drawer}>
        <div style={styles.header}>
          <h2 style={styles.title}><FiShoppingBag /> سلة التسوق</h2>
          <button onClick={onClose} style={styles.closeBtn} aria-label="إغلاق">
            <FiX />
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={styles.empty}>
            <FiShoppingBag style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>السلة فارغة</p>
          </div>
        ) : (
          <>
            <div style={styles.items}>
              {cart.map((item) => (
                <div key={item._id} style={styles.item}>
                  <img src={item.image} alt={item.name} style={styles.itemImg} />
                  <div style={styles.itemInfo}>
                    <p style={styles.itemName}>{item.name}</p>
                    <p style={styles.itemPrice}>{fmt(item.price)} ج.م</p>
                    <div style={styles.qtyControls}>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        style={styles.qtyBtn}
                        aria-label="تقليل"
                      >-</button>
                      <span style={styles.qty}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        style={styles.qtyBtn}
                        aria-label="زيادة"
                      >+</button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    style={styles.removeBtn}
                    aria-label="حذف"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.footer}>
              <div style={styles.totalRow}>
                <span style={{ color: 'var(--text-secondary)' }}>الإجمالي:</span>
                <span style={styles.totalPrice}>{fmt(total)} ج.م</span>
              </div>
              <Link to="/payment" onClick={onClose} style={styles.checkoutBtn}>
                إتمام الطلب
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 200,
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: 'min(380px, 100vw)',
    background: 'var(--bg-card)',
    borderLeft: '1px solid var(--border)',
    zIndex: 201,
    display: 'flex',
    flexDirection: 'column',
    animation: 'fadeIn 0.25s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    borderBottom: '1px solid var(--border)',
  },
  title: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: '700' },
  closeBtn: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    padding: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    display: 'flex',
  },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  items: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  item: {
    display: 'flex',
    gap: '12px',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius)',
    padding: '12px',
    border: '1px solid var(--border)',
    alignItems: 'center',
  },
  itemImg: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemPrice: { color: 'var(--accent)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px' },
  qtyControls: { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { fontWeight: '600', minWidth: '20px', textAlign: 'center' },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '4px',
  },
  footer: { padding: '20px', borderTop: '1px solid var(--border)' },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    fontSize: '1rem',
  },
  totalPrice: { fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent)' },
  checkoutBtn: {
    display: 'block',
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    borderRadius: 'var(--radius)',
    color: 'white',
    fontWeight: '700',
    fontSize: '1rem',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 0.3s',
  },
};
