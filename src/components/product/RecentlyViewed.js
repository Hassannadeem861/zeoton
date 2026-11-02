'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRecentlyViewed } from '@/store/slices/listsSlice';
import { useLookupProductsQuery } from '@/store/api/shopApi';
import SectionHeading from '@/components/ui/SectionHeading';
import ProductGrid from './ProductGrid';

export function TrackRecentlyViewed({ productId }) {
  const dispatch = useDispatch();
  const hydrated = useSelector((s) => s.ui.hydrated);
  useEffect(() => {
    if (hydrated) dispatch(addRecentlyViewed(productId));
  }, [dispatch, hydrated, productId]);
  return null;
}

export default function RecentlyViewed({ excludeId, title = 'Recently viewed' }) {
  const ids = useSelector((s) => s.lists.recent).filter((id) => id !== excludeId).slice(0, 4);
  const { data } = useLookupProductsQuery(ids, { skip: ids.length === 0 });
  const products = [...(data || [])].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  if (!ids.length || !products.length) return null;
  return (
    <section className="container-z py-12">
      <SectionHeading eyebrow="Your history" title={title} />
      <ProductGrid products={products} />
    </section>
  );
}
