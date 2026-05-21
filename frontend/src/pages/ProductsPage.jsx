import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiX } from 'react-icons/fi';

const CATEGORIES = ['All', 'iPhone', 'iPad', 'MacBook', 'Android', 'Tablet', 'Accessories', 'Laptop', 'Smartwatch'];
const SORT_OPTIONS = [
  { value: '', label: 'الأكثر شهرة' },
  { value: 'price_asc', label: 'السعر: من الأقل' },
  { value: 'price_desc', label: 'السعر: من الأعلى' },
  { value: 'rating', label: 'الأعلى تقييماً' },
  { value: 'newest', label: 'الأحدث' },
];

const PRICE_RANGES = [
  { label: 'أقل من 10,000', min: '', max: '10000' },
  { label: '10,000 - 30,000', min: '10000', max: '30000' },
  { label: '30,000 - 60,000', min: '30000', max: '60000' },
  { label: 'أكثر من 60,000', min: '60000', max: '' },
];


export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      category: searchParams.get('category') || 'All',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minRating: searchParams.get('minRating') || '',
      sort: searchParams.get('sort') || '',
      search: searchParams.get('search') || '',
      page: Number(searchParams.get('page')) || 1,
    }),
    [searchParams]
  );

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const update = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) next.delete(k);
      else next.set(k, String(v));
    });
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next, { replace: false });
  };

  const reset = () => setSearchParams({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.minRating) params.set('minRating', filters.minRating);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.search) params.set('search', filters.search);
    params.set('page', filters.page);
    params.set('limit', 12);

    api
      .get(`/products?${params.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
        setTotal(0);
        setPages(1);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters]);

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div className="container" style={{ padding: 0 }}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              {filters.category !== 'All' ? filters.category : 'جميع المنتجات'}
              {filters.search && ` — "${filters.search}"`}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {total} منتج متاح
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value })}
              style={styles.sortSelect}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button onClick={() => setFiltersOpen((v) => !v)} style={styles.filterToggle}>
              <FiFilter /> فلتر
            </button>
          </div>
        </div>

        <div style={styles.layout}>
          {filtersOpen && (
            <aside style={styles.sidebar}>
              <div style={styles.filterSection}>
                <div style={styles.filterSectionHeader}>
                  <span>الفئة</span>
                  <button onClick={reset} style={styles.resetBtn}>
                    <FiX /> إعادة ضبط
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => update({ category: cat === 'All' ? '' : cat })}
                      style={{
                        ...styles.catBtn,
                        background: filters.category === cat ? 'rgba(0,212,255,0.1)' : 'transparent',
                        color: filters.category === cat ? 'var(--accent)' : 'var(--text-secondary)',
                        borderColor: filters.category === cat ? 'var(--accent)' : 'transparent',
                      }}
                    >
                      {cat === 'All' ? 'الكل' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.filterSection}>
                <div style={styles.filterSectionHeader}>السعر</div>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <input
                    type="number"
                    placeholder="من (ج.م)"
                    value={filters.minPrice}
                    onChange={(e) => update({ minPrice: e.target.value })}
                    className="form-input"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  />
                  <input
                    type="number"
                    placeholder="إلى (ج.م)"
                    value={filters.maxPrice}
                    onChange={(e) => update({ maxPrice: e.target.value })}
                    className="form-input"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  />
                  {PRICE_RANGES.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => update({ minPrice: r.min, maxPrice: r.max })}
                      style={styles.rangeBtn}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.filterSection}>
                <div style={styles.filterSectionHeader}>التقييم</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[4, 3, 2, 1].map((star) => (
                    <label
                      key={star}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.minRating === String(star)}
                        onChange={() => update({ minRating: String(star) })}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span style={{ color: 'var(--gold)' }}>
                        {'★'.repeat(star)}{'☆'.repeat(5 - star)}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>فأكثر</span>
                    </label>
                  ))}
                  {filters.minRating && (
                    <button
                      onClick={() => update({ minRating: '' })}
                      style={{ ...styles.rangeBtn, color: 'var(--accent)' }}
                    >
                      مسح فلتر التقييم
                    </button>
                  )}
                </div>
              </div>
            </aside>
          )}

          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.categoryPills}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => update({ category: cat === 'All' ? '' : cat })}
                  style={{
                    ...styles.pill,
                    background:
                      filters.category === cat
                        ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                        : 'var(--bg-card)',
                    color: filters.category === cat ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${filters.category === cat ? 'transparent' : 'var(--border)'}`,
                  }}
                >
                  {cat === 'All' ? 'الكل' : cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="products-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '380px' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={styles.empty}>
                <span style={{ fontSize: '3rem' }}>🔍</span>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    marginTop: '16px',
                    fontSize: '1.1rem',
                  }}
                >
                  لا توجد منتجات تطابق بحثك
                </p>
                <button onClick={reset} style={styles.resetBtnLg}>
                  إعادة ضبط الفلاتر
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>

                {pages > 1 && (
                  <div style={styles.pagination}>
                    {[...Array(pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => update({ page: i + 1 })}
                        style={{
                          ...styles.pageBtn,
                          background: filters.page === i + 1 ? 'var(--accent)' : 'var(--bg-card)',
                          color: filters.page === i + 1 ? 'var(--bg-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: '700', marginBottom: '4px' },
  sortSelect: {
    padding: '9px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    outline: 'none',
    fontSize: '0.9rem',
  },
  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  layout: { display: 'flex', gap: '32px', alignItems: 'flex-start' },
  sidebar: {
    width: '260px',
    flexShrink: 0,
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    position: 'sticky',
    top: '86px',
  },
  filterSection: { padding: '20px', borderBottom: '1px solid var(--border)' },
  filterSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '700',
    marginBottom: '16px',
    fontSize: '0.95rem',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  catBtn: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid transparent',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    textAlign: 'right',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-main)',
  },
  rangeBtn: {
    padding: '7px 12px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-main)',
    textAlign: 'right',
    transition: 'all 0.2s',
  },
  categoryPills: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' },
  pill: {
    padding: '7px 18px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    fontFamily: 'var(--font-main)',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '8px',
  },
  resetBtnLg: {
    marginTop: '16px',
    padding: '10px 24px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: 'var(--bg-primary)',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
  },
  pagination: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' },
  pageBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
};
