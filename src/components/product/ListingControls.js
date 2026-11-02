'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { lockScroll } from '@/lib/scroll/scrollLock';
import { SlidersHorizontal, X } from 'lucide-react';
import { formatPKR } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

// Budget presets reflect real Pakistan search patterns ("… under 2000", "under 5000").
const PRICE_PRESETS = [
  { label: 'Under Rs 2,000', max: 2000 },
  { label: 'Under Rs 5,000', max: 5000 },
  { label: 'Under Rs 10,000', max: 10000 },
  { label: 'Rs 10,000+', min: 10000 },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Best selling' },
  { value: 'name', label: 'Name A–Z' },
];

function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const update = (changes) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([k, v]) => (v === undefined || v === null || v === '' ? next.delete(k) : next.set(k, String(v))));
    next.delete('page');
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  return { params, update, pending };
}

export function SortSelect() {
  const { params, update } = useUrlState();
  return (
    <label className="flex items-center gap-2 text-sm text-mist-400">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={params.get('sort') || 'newest'}
        onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}
        className="field h-10 w-auto py-0 pr-8"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterBody({ facets, update, params }) {
  const selectedBrands = (params.get('brand') || '').split(',').filter(Boolean);
  const [min, setMin] = useState(params.get('min') || '');
  const [max, setMax] = useState(params.get('max') || '');

  const toggleBrand = (b) => {
    const next = selectedBrands.includes(b) ? selectedBrands.filter((x) => x !== b) : [...selectedBrands, b];
    update({ brand: next.join(',') });
  };

  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-mist-100">Price (PKR)</legend>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((p) => {
            const active = (params.get('max') || '') === String(p.max ?? '') && (params.get('min') || '') === String(p.min ?? '');
            return (
              <button
                key={p.label}
                type="button"
                aria-pressed={active}
                onClick={() => update(active ? { min: '', max: '' } : { min: p.min ?? '', max: p.max ?? '' })}
                className={cn('rounded-full border px-3 py-1.5 text-xs transition', active ? 'border-blue-500 bg-blue-500/15 text-blue-200' : 'border-line-strong text-mist-300 hover:border-mist-500')}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update({ min, max });
          }}
        >
          <input aria-label="Minimum price" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} placeholder={facets.minPrice ? String(facets.minPrice) : 'Min'} className="field h-9" />
          <span className="text-mist-500">–</span>
          <input aria-label="Maximum price" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} placeholder={facets.maxPrice ? String(facets.maxPrice) : 'Max'} className="field h-9" />
          <button type="submit" className="btn-secondary btn-sm h-9">Go</button>
        </form>
        {facets.maxPrice > 0 && (
          <p className="mt-2 text-xs text-mist-500">
            Range in this list: {formatPKR(facets.minPrice)} – {formatPKR(facets.maxPrice)}
          </p>
        )}
      </fieldset>

      {facets.brands.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-mist-100">Brand</legend>
          <ul className="space-y-2">
            {facets.brands.map((b) => (
              <li key={b}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-mist-300 hover:text-mist-50">
                  <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} className="h-4 w-4 accent-blue-500" />
                  {b}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <fieldset>
        <legend className="sr-only">Availability</legend>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-mist-300 hover:text-mist-50">
          <input type="checkbox" checked={params.get('stock') === '1'} onChange={(e) => update({ stock: e.target.checked ? '1' : '' })} className="h-4 w-4 accent-blue-500" />
          In stock only
        </label>
      </fieldset>
    </div>
  );
}

export function Filters({ facets }) {
  const { params, update, pending } = useUrlState();
  const [open, setOpen] = useState(false);
  const activeCount = ['min', 'max', 'brand', 'stock'].filter((k) => params.get(k)).length;
  const clear = () => update({ min: '', max: '', brand: '', stock: '' });
  const formKey = `${params.get('min')}-${params.get('max')}`;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const unlockScroll = lockScroll();
    return () => {
      document.removeEventListener('keydown', onKey);
      unlockScroll();
    };
  }, [open]);

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <button type="button" className="btn-secondary h-10" onClick={() => setOpen(true)} aria-expanded={open}>
          <SlidersHorizontal className="h-4 w-4" /> Filters {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>

      <aside className={cn('hidden lg:block', pending && 'opacity-70')} aria-label="Filters">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-mist-400">Filters</h2>
          {activeCount > 0 && (
            <button type="button" onClick={clear} className="text-xs text-blue-300 hover:text-blue-200">
              Clear all
            </button>
          )}
        </div>
        <FilterBody key={formKey} facets={facets} update={update} params={params} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-line bg-ink-850 p-5" data-lenis-prevent>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button type="button" className="icon-btn" aria-label="Close filters" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterBody key={formKey} facets={facets} update={update} params={params} />
            <div className="mt-8 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={clear}>Clear</button>
              <button type="button" className="btn-primary flex-1" onClick={() => setOpen(false)}>Show results</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
