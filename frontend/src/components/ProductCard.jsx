import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FALLBACK_IMG = 'https://via.placeholder.com/300x200?text=No+Image';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product);
    toast.success(`تم إضافة ${product.name} للسلة`);
  };

  const price = Number(product.price) || 0;
  const original = Number(product.originalPrice) || 0;
  const discount =
    original > price ? Math.round(((original - price) / original) * 100) : 0;
  const rating = Number(product.rating) || 0;
  const numReviews = Number(product.numReviews) || 0;
  const outOfStock = !product.stock || product.stock <= 0;

  return (
    <Link to={`/products/${product._id}`} style={styles.card}>
      <div style={styles.imageWrapper}>
        <img
          src={product.image}
          alt={product.name}
          style={styles.image}
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <div style={styles.badges}>
          {product.isNew && <span style={{ ...styles.badge, background: 'var(--accent2)' }}>جديد</span>}
          {discount > 0 && <span style={{ ...styles.badge, background: 'var(--danger)' }}>-{discount}%</span>}
          {product.featured && (
            <span style={{ ...styles.badge, background: 'var(--warning)', color: '#000' }}>مميز</span>
          )}
        </div>
        {outOfStock && <div style={styles.outOfStock}>نفذ المخزون</div>}
      </div>

      <div style={styles.info}>
        <span style={styles.category}>{product.category}</span>
        <h3 style={styles.name}>{product.name}</h3>
        <p style={styles.brand}>{product.brand}</p>

        <div style={styles.rating}>
          <FiStar style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
          <span style={styles.ratingVal}>{rating.toFixed(1)}</span>
          <span style={styles.reviews}>({numReviews})</span>
        </div>

        <div style={styles.priceRow}>
          <div>
            <span style={styles.price}>{price.toLocaleString()}</span>
            <span style={styles.currency}> ج.م</span>
            {discount > 0 && (
              <span style={styles.oldPrice}>{original.toLocaleString()} ج.م</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label="أضف للسلة"
            style={{
              ...styles.cartBtn,
              opacity: outOfStock ? 0.5 : 1,
              cursor: outOfStock ? 'not-allowed' : 'pointer',
            }}
          >
            <FiShoppingCart />
          </button>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s ease',
    display: 'block',
    position: 'relative',
  },
  imageWrapper: { position: 'relative', overflow: 'hidden', height: '220px', background: 'var(--bg-secondary)' },
  image: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' },
  badges: { position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', color: 'white' },
  outOfStock: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--danger)',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  info: { padding: '16px' },
  category: {
    fontSize: '0.75rem',
    color: 'var(--accent)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  name: {
    fontSize: '1rem',
    fontWeight: '700',
    margin: '6px 0 4px',
    lineHeight: '1.4',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  brand: { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' },
  rating: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' },
  ratingVal: { fontWeight: '700', fontSize: '0.9rem' },
  reviews: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  priceRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent)' },
  currency: { fontSize: '0.85rem', color: 'var(--text-secondary)' },
  oldPrice: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textDecoration: 'line-through',
    marginRight: '8px',
    display: 'block',
    marginTop: '2px',
  },
  cartBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    border: 'none',
    color: 'white',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
    flexShrink: 0,
  },
};
