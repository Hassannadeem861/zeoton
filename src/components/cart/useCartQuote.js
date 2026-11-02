'use client';

import { useSelector } from 'react-redux';
import { useQuoteCartQuery } from '@/store/api/shopApi';

// Server-priced view of the local cart (prices, stock, coupon, shipping).
export function useCartQuote() {
  const items = useSelector((s) => s.cart.items);
  const couponCode = useSelector((s) => s.cart.couponCode);
  const hydrated = useSelector((s) => s.ui.hydrated);
  const query = useQuoteCartQuery({ items, couponCode }, { skip: !hydrated || items.length === 0 });
  return { items, couponCode, hydrated, ...query };
}
