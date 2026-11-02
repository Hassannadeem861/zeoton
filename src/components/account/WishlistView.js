'use client';

import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { useLookupProductsQuery } from '@/store/api/shopApi';
import ProductGrid from '@/components/product/ProductGrid';
import EmptyState from '@/components/ui/EmptyState';

export default function WishlistView() {
  const hydrated = useSelector((s) => s.ui.hydrated);
  const ids = useSelector((s) => s.lists.wishlist);
  const { data, isLoading } = useLookupProductsQuery(ids, { skip: !hydrated || ids.length === 0 });

  if (!hydrated || isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-mist-400" aria-label="Loading wishlist" />
      </div>
    );
  }
  const products = [...(data || [])].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  if (!ids.length || !products.length) {
    return <EmptyState title="Your wishlist is empty" description="Tap the heart on any product to save it here." actionHref="/products" actionLabel="Browse products" />;
  }
  return <ProductGrid products={products} />;
}
