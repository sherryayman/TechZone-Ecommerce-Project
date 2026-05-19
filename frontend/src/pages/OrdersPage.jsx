import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiPackage, FiShoppingBag, FiCheckCircle, FiClock, FiTruck, FiX } from 'react-icons/fi';

const STATUS_META = {
  Pending: { label: 'قيد الانتظار', color: 'var(--warning)', icon: <FiClock /> },
  Processing: { label: 'قيد التجهيز', color: 'var(--accent)', icon: <FiPackage /> },
  Shipped: { label: 'تم الشحن', color: 'var(--accent2)', icon: <FiTruck /> },
  Delivered: { label: 'تم التوصيل', color: 'var(--success)', icon: <FiCheckCircle /> },
  Cancelled: { label: 'ملغي', color: 'var(--danger)', icon: <FiX /> },
};

const fmt = (n) => Number(n || 0).toLocaleString();

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/orders/myorders')
      .then((res) => { if (!cancelled) setOrders(res.data); })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'تعذر تحميل الطلبات');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  if (error) {
    return (
      <div style={styles.empty}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <Link to="/" style={styles.shopBtn}>العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', animation: 'fadeInUp 0.5s ease' }}>
      <div className="container" style={{ padding: 0 }}>
        <h1 style={styles.pageTitle}><FiShoppingBag /> طلباتي</h1>

        {orders.length === 0 ? (
          <div style={styles.empty}>
            <FiShoppingBag style={{ fontSize: '4rem', color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              لم تقم بأي طلبات بعد
            </p>
            <Link to="/products" style={styles.shopBtn}>تسوق الآن</Link>
          </div>
        ) : (
          <div style={styles.orderList}>
            {orders.map((order) => {
              const meta = STATUS_META[order.status] || STATUS_META.Pending;
              const idTail = (order._id || '').slice(-8).toUpperCase() || '????????';
              return (
                <div key={order._id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <div>
                      <div style={styles.orderNum}>طلب #{idTail}</div>
                      <div style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div style={{ ...styles.statusBadge, color: meta.color, borderColor: meta.color }}>
                      {meta.icon} {meta.label}
                    </div>
                  </div>

                  <div style={styles.itemsList}>
                    {order.items.map((item, i) => (
                      <div key={i} style={styles.itemRow}>
                        <img src={item.image} alt={item.name} style={styles.itemImg} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: '600',
                              fontSize: '0.9rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            الكمية: {item.quantity}
                          </div>
                        </div>
                        <div style={{ fontWeight: '700', color: 'var(--accent)' }}>
                          {fmt(item.price * item.quantity)} ج.م
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={styles.orderFooter}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        طريقة الدفع: <span style={{ color: 'var(--text-primary)' }}>{order.paymentMethod}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        حالة الدفع:{' '}
                        <span style={{ color: order.isPaid ? 'var(--success)' : 'var(--warning)' }}>
                          {order.isPaid ? '✓ مدفوع' : 'في الانتظار'}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>الإجمالي</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--accent)' }}>
                        {fmt(order.totalPrice)} ج.م
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.6rem',
    fontWeight: '800',
    marginBottom: '32px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: '16px',
  },
  shopBtn: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    borderRadius: 'var(--radius)',
    color: 'white',
    fontWeight: '700',
    textDecoration: 'none',
  },
  orderList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  orderCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  orderNum: { fontWeight: '800', fontSize: '1rem' },
  orderDate: { color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  itemsList: { padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  itemImg: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 },
  orderFooter: {
    padding: '20px 24px',
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
};
