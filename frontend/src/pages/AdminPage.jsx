import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiPackage, FiShoppingBag, FiUsers, FiDollarSign,
  FiEdit2, FiTrash2, FiPlus, FiX, FiBarChart2,
} from 'react-icons/fi';

const TABS = ['الإحصائيات', 'المنتجات', 'الطلبات', 'المستخدمين'];
const CATEGORIES = ['iPhone', 'iPad', 'MacBook', 'Android', 'Tablet', 'Accessories', 'Laptop', 'Smartwatch'];
const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_LABELS = {
  Pending: 'معلق', Processing: 'قيد المعالجة', Shipped: 'تم الشحن',
  Delivered: 'تم التسليم', Cancelled: 'ملغي',
};
const STATUS_COLORS = {
  Pending: 'var(--warning)', Processing: 'var(--accent)', Shipped: 'var(--accent2)',
  Delivered: 'var(--success)', Cancelled: 'var(--danger)',
};

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'iPhone', brand: '', image: '', stock: '',
  featured: false, isNew: false,
};

const fmt = (n) => Number(n || 0).toLocaleString();

// Safely coerce string -> number; '' or invalid -> 0
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function AdminPage() {
  // Note: AdminRoute already guarantees user.role === 'admin' before mounting this.
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      setLoading(true);
      try {
        const [statsRes, prodsRes, ordersRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/products'),
          api.get('/admin/orders'),
          api.get('/admin/users'),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setProducts(prodsRes.data);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        if (!cancelled) toast.error('خطأ في تحميل البيانات');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, []);

  const openAddModal = () => {
    setEditProduct(null);
    setProductForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditProduct(p);
    setProductForm({
      name: p.name || '',
      description: p.description || '',
      price: String(p.price ?? ''),
      originalPrice: String(p.originalPrice ?? ''),
      category: p.category || 'iPhone',
      brand: p.brand || '',
      image: p.image || '',
      stock: String(p.stock ?? ''),
      featured: !!p.featured,
      isNew: !!p.isNew,
    });
    setModalOpen(true);
  };

  const handleProductSave = async () => {
    // Required-field check before hitting the API
    const required = ['name', 'description', 'brand', 'image'];
    for (const f of required) {
      if (!productForm[f].trim()) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        return;
      }
    }
    if (!productForm.price || num(productForm.price) <= 0) {
      toast.error('السعر مطلوب ويجب أن يكون أكبر من صفر');
      return;
    }
    if (productForm.stock === '' || num(productForm.stock) < 0) {
      toast.error('المخزون يجب أن يكون 0 أو أكثر');
      return;
    }

    setSaving(true);
    try {
      // num() converts '' -> 0 instead of NaN.
      const data = {
        ...productForm,
        price: num(productForm.price),
        stock: num(productForm.stock),
        originalPrice: num(productForm.originalPrice),
      };

      if (editProduct) {
        const res = await api.put(`/admin/products/${editProduct._id}`, data);
        setProducts((ps) => ps.map((p) => (p._id === editProduct._id ? res.data : p)));
        toast.success('تم تحديث المنتج');
      } else {
        const res = await api.post('/admin/products', data);
        setProducts((ps) => [res.data, ...ps]);
        toast.success('تم إضافة المنتج');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((ps) => ps.filter((p) => p._id !== id));
      toast.success('تم حذف المنتج');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((us) => us.filter((u) => u._id !== id));
      toast.success('تم حذف المستخدم');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status });
      setOrders((os) => os.map((o) => (o._id === orderId ? res.data : o)));
      toast.success('تم تحديث الحالة');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', animation: 'fadeInUp 0.5s ease' }}>
      <div className="container" style={{ padding: 0 }}>
        <h1 style={styles.pageTitle}><FiBarChart2 /> لوحة التحكم</h1>

        <div style={styles.tabs}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              style={{
                ...styles.tabBtn,
                color: tab === i ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom:
                  tab === i ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* STATS */}
        {tab === 0 && stats && (
          <>
            <div style={styles.statsGrid}>
              {[
                { label: 'إجمالي المنتجات', val: stats.totalProducts, icon: <FiPackage />, color: 'var(--accent)' },
                { label: 'إجمالي الطلبات', val: stats.totalOrders, icon: <FiShoppingBag />, color: 'var(--accent2)' },
                { label: 'إجمالي المستخدمين', val: stats.totalUsers, icon: <FiUsers />, color: 'var(--success)' },
                { label: 'إجمالي الإيرادات', val: `${fmt(stats.revenue)} ج.م`, icon: <FiDollarSign />, color: 'var(--gold)' },
              ].map((s, i) => (
                <div key={i} style={styles.statCard}>
                  <div style={{ ...styles.statIcon, color: s.color, borderColor: s.color }}>{s.icon}</div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: s.color }}>{s.val}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '32px', ...styles.section }}>
              <h2 style={styles.sectionTitle}>أحدث الطلبات</h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>الرقم</th>
                    <th style={styles.th}>العميل</th>
                    <th style={styles.th}>الإجمالي</th>
                    <th style={styles.th}>الحالة</th>
                    <th style={styles.th}>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.recentOrders || []).map((o) => (
                    <tr key={o._id}>
                      <td style={styles.td}>#{(o._id || '').slice(-6).toUpperCase()}</td>
                      <td style={styles.td}>{o.user?.name || '—'}</td>
                      <td style={styles.td}>{fmt(o.totalPrice)} ج.م</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusPill, color: STATUS_COLORS[o.status], borderColor: STATUS_COLORS[o.status] }}>
                          {STATUS_LABELS[o.status]}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {new Date(o.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* PRODUCTS */}
        {tab === 1 && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>إدارة المنتجات ({products.length})</h2>
              <button onClick={openAddModal} style={styles.addBtn}>
                <FiPlus /> إضافة منتج
              </button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>الصورة</th>
                  <th style={styles.th}>الاسم</th>
                  <th style={styles.th}>الفئة</th>
                  <th style={styles.th}>السعر</th>
                  <th style={styles.th}>المخزون</th>
                  <th style={styles.th}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td style={styles.td}>
                      <img src={p.image} alt={p.name} style={styles.tableImg} />
                    </td>
                    <td style={styles.td}>{p.name}</td>
                    <td style={styles.td}>{p.category}</td>
                    <td style={styles.td}>{fmt(p.price)} ج.م</td>
                    <td style={styles.td}>
                      <span style={{ color: p.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          style={{ ...styles.iconBtn, color: 'var(--accent)' }}
                          aria-label="تعديل"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          style={{ ...styles.iconBtn, color: 'var(--danger)' }}
                          aria-label="حذف"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS */}
        {tab === 2 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>إدارة الطلبات ({orders.length})</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>الرقم</th>
                  <th style={styles.th}>العميل</th>
                  <th style={styles.th}>الإجمالي</th>
                  <th style={styles.th}>الدفع</th>
                  <th style={styles.th}>الحالة</th>
                  <th style={styles.th}>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td style={styles.td}>#{(o._id || '').slice(-6).toUpperCase()}</td>
                    <td style={styles.td}>{o.user?.name || '—'}</td>
                    <td style={styles.td}>{fmt(o.totalPrice)} ج.م</td>
                    <td style={styles.td}>
                      <span style={{ color: o.isPaid ? 'var(--success)' : 'var(--warning)' }}>
                        {o.isPaid ? '✓ مدفوع' : 'في الانتظار'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        style={styles.statusSelect}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.td}>
                      {new Date(o.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* USERS */}
        {tab === 3 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>إدارة المستخدمين ({users.length})</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>الاسم</th>
                  <th style={styles.th}>البريد</th>
                  <th style={styles.th}>الدور</th>
                  <th style={styles.th}>التسجيل</th>
                  <th style={styles.th}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={styles.td}>{u.name}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusPill,
                        color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-secondary)',
                        borderColor: u.role === 'admin' ? 'var(--accent)' : 'var(--border)',
                      }}>
                        {u.role === 'admin' ? 'مدير' : 'مستخدم'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td style={styles.td}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          style={{ ...styles.iconBtn, color: 'var(--danger)' }}
                          aria-label="حذف"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={styles.modalOverlay}>
          <div onClick={(e) => e.stopPropagation()} style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={{ fontWeight: '700' }}>
                {editProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={styles.closeBtn} aria-label="إغلاق">
                <FiX />
              </button>
            </div>

            <div style={styles.modalGrid}>
              {[
                { key: 'name', label: 'الاسم *', type: 'text' },
                { key: 'brand', label: 'الماركة *', type: 'text' },
                { key: 'price', label: 'السعر (ج.م) *', type: 'number' },
                { key: 'originalPrice', label: 'السعر الأصلي', type: 'number' },
                { key: 'stock', label: 'المخزون *', type: 'number' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input
                    type={f.type}
                    value={productForm[f.key]}
                    onChange={(e) =>
                      setProductForm({ ...productForm, [f.key]: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              ))}

              <div>
                <label className="form-label">الفئة *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="form-input"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">رابط الصورة *</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="form-input"
                  placeholder="https://..."
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">الوصف *</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                />
              </div>

              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                />
                منتج مميز
              </label>
              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={productForm.isNew}
                  onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                />
                منتج جديد
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setModalOpen(false)} style={styles.btnOutline}>
                إلغاء
              </button>
              <button
                onClick={handleProductSave}
                disabled={saving}
                style={{ ...styles.btnPrimary, flex: 1, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'جاري الحفظ...' : (editProduct ? 'حفظ التغييرات' : 'إضافة المنتج')}
              </button>
            </div>
          </div>
        </div>
      )}
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
    marginBottom: '24px',
  },
  tabs: {
    display: 'flex',
    gap: '0',
    borderBottom: '1px solid var(--border)',
    marginBottom: '32px',
    overflowX: 'auto',
  },
  tabBtn: {
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  statCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
    border: '1px solid',
    flexShrink: 0,
  },
  section: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    overflow: 'auto',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
  },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
  th: {
    textAlign: 'right',
    padding: '12px',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '12px',
    fontSize: '0.9rem',
    borderBottom: '1px solid var(--border)',
  },
  tableImg: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' },
  iconBtn: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  statusPill: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  statusSelect: {
    padding: '6px 12px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-main)',
    fontSize: '0.85rem',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
    padding: '24px',
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  closeBtn: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
  },
  modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  btnPrimary: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
  },
  btnOutline: {
    padding: '12px 28px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
  },
};
