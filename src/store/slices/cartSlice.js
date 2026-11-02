import { createSlice } from '@reduxjs/toolkit';

// Cart holds only identities and quantities. Prices/stock always come from the
// server (/api/checkout/quote), so stale client prices can never reach an order.
const MAX_QTY = 20;
const keyOf = (i) => `${i.productId}:${i.variantId || ''}`;

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], couponCode: '' },
  reducers: {
    hydrateCart: (state, { payload }) => {
      state.items = Array.isArray(payload?.items) ? payload.items.slice(0, 50) : [];
      state.couponCode = payload?.couponCode || '';
    },
    addToCart: (state, { payload }) => {
      const { productId, variantId = null, quantity = 1 } = payload;
      const existing = state.items.find((i) => keyOf(i) === keyOf({ productId, variantId }));
      if (existing) existing.quantity = Math.min(MAX_QTY, existing.quantity + quantity);
      else state.items.push({ productId, variantId, quantity: Math.min(MAX_QTY, quantity) });
    },
    setQuantity: (state, { payload }) => {
      const item = state.items.find((i) => keyOf(i) === keyOf(payload));
      if (item) item.quantity = Math.max(1, Math.min(MAX_QTY, payload.quantity));
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter((i) => keyOf(i) !== keyOf(payload));
    },
    setCouponCode: (state, { payload }) => {
      state.couponCode = (payload || '').trim().toUpperCase();
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = '';
    },
  },
});

export const { hydrateCart, addToCart, setQuantity, removeFromCart, setCouponCode, clearCart } = cartSlice.actions;
export const selectCartItems = (s) => s.cart.items;
export const selectCartCount = (s) => s.cart.items.reduce((n, i) => n + i.quantity, 0);
export default cartSlice.reducer;
