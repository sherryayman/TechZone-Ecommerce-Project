import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiPackage, FiTruck, FiShield } from 'react-icons/fi';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectedImg(0);
    setQty(1);
    api
      .get(`/products/${id}`)
      .then((res) => { if (!cancelled) setProduct(res.data); })
      .catch(() => { if (!cancelled) navigate('/products'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
    toast.success('تم إضافة المنتج للسلة!');
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, qty);
    navigate('/payment');
  };

  const handleReview = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('اكتب تعليقك');
      return;
    }
    setReviewLoading(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewText });
      toast.success('تم إضافة تقييمك');
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
      setReviewText('');
      setReviewRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setReviewLoading(false);
    }
  };

  const StarRating = ({ rating, size = '1rem' }) => (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            color: s <= rating ? 'var(--gold)' : 'var(--text-muted)',
            fontSize: size,
          }}
        >★</span>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }
  if (!product) return null;

  const images = product.images?.length ? product.images : [product.image];
  const price = Number(product.price) || 0;
  const original = Number(product.originalPrice) || 0;
  const discount = original > price ? Math.round(((original - price) / original) * 100) : 0;
  const rating = Number(product.rating) || 0;
  const numReviews = Number(product.numReviews) || 0;

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', animation: 'fadeInUp 0.5s ease' }}>
      <div className="container" style={{ padding: 0 }}>
        <div style={styles.breadcrumb}>
          <span onClick={() => navigate('/')} style={styles.breadLink}>الرئيسية</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span onClick={() => navigate('/products')} style={styles.breadLink}>المنتجات</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--accent)' }}>{product.name}</span>
        </div>

        <div style={styles.mainGrid}>
          <div>
            <div style={styles.mainImageWrapper}>
              <img src={images[selectedImg]} alt={product.name} style={styles.mainImage} />
              {discount > 0 && <span style={styles.discountBadge}>-{discount}%</span>}
            </div>
            {images.length > 1 && (
              <div style={styles.thumbnails}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    style={{
                      ...styles.thumb,
                      borderColor: selectedImg === i ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span style={styles.category}>{product.category} · {product.brand}</span>
            <h1 style={styles.productName}>{product.name}</h1>

            <div style={styles.ratingRow}>
              <StarRating rating={Math.round(rating)} size="1.2rem" />
              <span style={styles.ratingNum}>{rating.toFixed(1)}</span>
              <span style={styles.reviewCount}>({numReviews} تقييم)</span>
            </div>

            <div style={styles.priceBlock}>
              <span style={styles.price}>{price.toLocaleString()}</span>
              <span style={styles.currency}> جنيه مصري</span>
              {discount > 0 && (
                <span style={styles.oldPrice}>{original.toLocaleString()} ج.م</span>
              )}
            </div>

            <p style={styles.description}>{product.description}</p>

            <div style={styles.stockInfo}>
              <FiPackage style={{ color: product.stock > 0 ? 'var(--success)' : 'var(--danger)' }} />
              <span
                style={{
                  color: product.stock > 0 ? 'var(--success)' : 'var(--danger)',
                  fontWeight: '600',
                }}
              >
                {product.stock > 0 ? `متوفر (${product.stock} قطعة)` : 'نفذ من المخزون'}
              </span>
            </div>

            {product.stock > 0 && (
              <div style={styles.actions}>
                <div style={styles.qtyBlock}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={styles.qtyBtn}
                  >-</button>
                  <span style={styles.qtyNum}>{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    style={styles.qtyBtn}
                  >+</button>
                </div>
                <button onClick={handleAddToCart} style={styles.addToCartBtn}>
                  <FiShoppingCart /> أضف للسلة
                </button>
                <button onClick={handleBuyNow} style={styles.buyNowBtn}>
                  اشتري الآن
                </button>
              </div>
            )}

            <div style={styles.perks}>
              {[
                { icon: <FiTruck />, text: 'شحن مجاني للطلبات فوق 5000 ج.م' },
                { icon: <FiShield />, text: 'ضمان المصنع الأصلي' },
                { icon: <FiPackage />, text: 'استبدال وإرجاع خلال 14 يوم' },
              ].map((p, i) => (
                <div key={i} style={styles.perkItem}>
                  <span style={{ color: 'var(--accent)' }}>{p.icon}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.tabs}>
          <div style={styles.tabHeaders}>
            {['specs', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...styles.tabBtn,
                  borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {tab === 'specs' ? 'المواصفات' : `التقييمات (${numReviews})`}
              </button>
            ))}
          </div>

          {activeTab === 'specs' &&
            product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div style={styles.specsGrid}>
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} style={styles.specItem}>
                    <span style={styles.specKey}>{key}</span>
                    <span style={styles.specVal}>{val}</span>
                  </div>
                ))}
              </div>
            )}

          {activeTab === 'reviews' && (
            <div>
              {user && (
                <div style={styles.addReview}>
                  <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>أضف تقييمك</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setReviewRating(s)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.5rem',
                          color: s <= reviewRating ? 'var(--gold)' : 'var(--text-muted)',
                        }}
                        aria-label={`${s} نجوم`}
                      >★</button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="اكتب رأيك في المنتج..."
                    className="form-input"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                  />
                  <button
                    onClick={handleReview}
                    disabled={reviewLoading}
                    style={styles.submitReviewBtn}
                  >
                    {reviewLoading ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(product.reviews || []).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                    لا توجد تقييمات بعد. كن أول من يقيّم!
                  </p>
                ) : (
                  product.reviews.map((r, i) => (
                    <div key={r._id || i} style={styles.reviewCard}>
                      <div style={styles.reviewHeader}>
                        <div style={styles.reviewAvatar}>{r.name?.[0] || '?'}</div>
                        <div>
                          <div style={{ fontWeight: '700' }}>{r.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(r.createdAt).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                        <StarRating rating={r.rating} />
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '10px', lineHeight: '1.6' }}>
                        {r.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '32px',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    flexWrap: 'wrap',
  },
  breadLink: { color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '48px',
    marginBottom: '60px',
  },
  mainImageWrapper: {
    position: 'relative',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    marginBottom: '16px',
    height: '450px',
  },
  mainImage: { width: '100%', height: '100%', objectFit: 'cover' },
  discountBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'var(--danger)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '20px',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  thumbnails: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  thumb: {
    width: '80px',
    height: '80px',
    borderRadius: '10px',
    border: '2px solid',
    overflow: 'hidden',
    cursor: 'pointer',
    background: 'var(--bg-secondary)',
    transition: 'border-color 0.2s',
    padding: 0,
  },
  category: {
    fontSize: '0.8rem',
    color: 'var(--accent)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  productName: { fontSize: '1.8rem', fontWeight: '900', margin: '10px 0 16px', lineHeight: '1.3' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  ratingNum: { fontWeight: '700', fontSize: '1.1rem', color: 'var(--gold)' },
  reviewCount: { fontSize: '0.85rem', color: 'var(--text-muted)' },
  priceBlock: { marginBottom: '20px' },
  price: { fontSize: '2.2rem', fontWeight: '900', color: 'var(--accent)' },
  currency: { fontSize: '1rem', color: 'var(--text-secondary)' },
  oldPrice: {
    display: 'block',
    fontSize: '1rem',
    color: 'var(--text-muted)',
    textDecoration: 'line-through',
    marginTop: '4px',
  },
  description: {
    color: 'var(--text-secondary)',
    lineHeight: '1.8',
    marginBottom: '20px',
    fontSize: '0.95rem',
  },
  stockInfo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '24px' },
  qtyBlock: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: '40px',
    height: '44px',
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  qtyNum: { padding: '0 16px', fontWeight: '700', fontSize: '1rem', minWidth: '50px', textAlign: 'center' },
  addToCartBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--accent)',
    borderRadius: 'var(--radius)',
    color: 'var(--accent)',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-main)',
    transition: 'all 0.3s',
  },
  buyNowBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-main)',
    transition: 'all 0.3s',
  },
  perks: {
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  perkItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  tabs: { marginTop: '40px' },
  tabHeaders: {
    display: 'flex',
    gap: '0',
    borderBottom: '1px solid var(--border)',
    marginBottom: '32px',
  },
  tabBtn: {
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.2s',
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '12px',
  },
  specItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
  },
  specKey: { color: 'var(--text-muted)', fontSize: '0.9rem' },
  specVal: { fontWeight: '600', fontSize: '0.9rem' },
  addReview: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    marginBottom: '24px',
  },
  submitReviewBtn: {
    marginTop: '12px',
    padding: '10px 24px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
  },
  reviewCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px',
  },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: '12px' },
  reviewAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    color: 'white',
  },
};
