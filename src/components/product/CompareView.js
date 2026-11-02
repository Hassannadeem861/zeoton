'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, X } from 'lucide-react';
import { useLookupProductsQuery } from '@/store/api/shopApi';
import { clearCompare, toggleCompare } from '@/store/slices/listsSlice';
import EmptyState from '@/components/ui/EmptyState';
import ProductImage from './ProductImage';
import Price from './Price';
import { QuickAddButton } from './ProductActions';
import DemoBadge from './DemoBadge';

export default function CompareView() {
  const dispatch = useDispatch();
  const hydrated = useSelector((s) => s.ui.hydrated);
  const ids = useSelector((s) => s.lists.compare);
  const { data, isLoading } = useLookupProductsQuery(ids, { skip: !hydrated || ids.length === 0 });

  if (!hydrated || isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-mist-400" aria-label="Loading comparison" />
      </div>
    );
  }
  const products = [...(data || [])].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  if (!products.length) {
    return (
      <EmptyState
        title="Nothing to compare yet"
        description="Use the compare button on product cards to add up to 4 products."
        actionHref="/products"
        actionLabel="Browse products"
      />
    );
  }

  const specLabels = [...new Set(products.flatMap((p) => p.specs.map((s) => s.label)))];
  const specOf = (p, label) => p.specs.find((s) => s.label === label)?.value || '—';

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" className="btn-ghost btn-sm" onClick={() => dispatch(clearCompare())}>
          Clear all
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line" data-lenis-prevent>
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Product comparison</caption>
          <thead>
            <tr className="border-b border-line align-top">
              <th scope="col" className="w-40 bg-ink-850 p-4 text-left text-mist-400">Product</th>
              {products.map((p) => (
                <th key={p.id} scope="col" className="p-4 text-left font-normal">
                  <div className="relative">
                    <button type="button" onClick={() => dispatch(toggleCompare(p.id))} className="icon-btn absolute -right-2 -top-2 h-8 w-8" aria-label={`Remove ${p.name} from comparison`}>
                      <X className="h-4 w-4" />
                    </button>
                    <div className="relative mb-3 aspect-square w-28 overflow-hidden rounded-xl bg-ink-800 p-2">
                      <ProductImage image={p.image} alt={p.name} sizes="112px" fill />
                    </div>
                    {p.isDemo && <DemoBadge className="mb-1.5" />}
                    <Link href={`/product/${p.slug}`} className="block font-medium text-mist-50 hover:text-blue-300">
                      {p.name}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <th scope="row" className="bg-ink-850 p-4 text-left font-medium text-mist-400">Price</th>
              {products.map((p) => (
                <td key={p.id} className="p-4"><Price unitPrice={p.unitPrice} price={p.price} salePrice={p.salePrice} fromPrice={p.fromPrice} /></td>
              ))}
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="bg-ink-850 p-4 text-left font-medium text-mist-400">Brand</th>
              {products.map((p) => <td key={p.id} className="p-4 text-mist-200">{p.brand || '—'}</td>)}
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="bg-ink-850 p-4 text-left font-medium text-mist-400">Availability</th>
              {products.map((p) => (
                <td key={p.id} className={`p-4 ${p.inStock ? 'text-success' : 'text-danger'}`}>{p.inStock ? 'In stock' : 'Out of stock'}</td>
              ))}
            </tr>
            {specLabels.map((label) => (
              <tr key={label} className="border-b border-line">
                <th scope="row" className="bg-ink-850 p-4 text-left font-medium text-mist-400">{label}</th>
                {products.map((p) => <td key={p.id} className="p-4 text-mist-200">{specOf(p, label)}</td>)}
              </tr>
            ))}
            <tr>
              <th scope="row" className="bg-ink-850 p-4" />
              {products.map((p) => <td key={p.id} className="p-4"><QuickAddButton product={p} /></td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
