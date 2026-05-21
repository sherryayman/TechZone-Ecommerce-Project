import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
    }
  }, [cart]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?._id) return;
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      const cap = typeof product.stock === 'number' ? product.stock : Infinity;
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, cap);
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { ...product, quantity: Math.min(quantity, cap) }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setCart((prev) => {
      if (quantity < 1) return prev.filter((item) => item._id !== id);
      return prev.map((item) =>
        item._id === id ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const { total, itemCount } = useMemo(() => {
    let total = 0;
    let itemCount = 0;
    for (const item of cart) {
      total += (Number(item.price) || 0) * item.quantity;
      itemCount += item.quantity;
    }
    return { total, itemCount };
  }, [cart]);

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
