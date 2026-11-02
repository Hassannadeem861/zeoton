'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useSearchSuggestionsQuery } from '@/store/api/shopApi';
import { formatPKR } from '@/lib/utils/format';
import ProductImage from '@/components/product/ProductImage';

function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function SearchBox() {
  const router = useRouter();
  const listId = useId();
  const boxRef = useRef(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const term = useDebounced(q.trim());
  const { data, isFetching } = useSearchSuggestionsQuery(term, { skip: term.length < 2 });

  const products = term.length >= 2 ? data?.products || [] : [];
  const categories = term.length >= 2 ? data?.categories || [] : [];
  const options = [
    ...categories.map((c) => ({ key: `c-${c.slug}`, href: `/category/${c.slug}` })),
    ...products.map((p) => ({ key: `p-${p.id}`, href: `/product/${p.slug}` })),
  ];

  useEffect(() => {
    const onClick = (e) => !boxRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', onClick);
    return () => document.removeEventListener('pointerdown', onClick);
  }, []);

  const go = (href) => {
    setOpen(false);
    setQ('');
    router.push(href);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (active >= 0 && options[active]) return go(options[active].href);
    if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showPanel = open && term.length >= 2;

  return (
    <div ref={boxRef} className="relative">
      <form role="search" onSubmit={onSubmit}>
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search products
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden />
        <input
          id={`${listId}-input`}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search mice, keyboards, headsets…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={active >= 0 && options[active] ? `${listId}-${options[active].key}` : undefined}
          className="h-10 w-full rounded-lg border border-line bg-ink-850/80 pl-9 pr-9 text-sm text-mist-50 placeholder:text-mist-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
        />
        {isFetching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-mist-500" aria-hidden />}
      </form>

      {showPanel && (
        <div className="glass absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl shadow-2xl">
          <ul id={listId} role="listbox" className="max-h-[70vh] overflow-y-auto py-2" data-lenis-prevent>
            {categories.map((c, i) => (
              <li key={c.slug} id={`${listId}-c-${c.slug}`} role="option" aria-selected={active === i}>
                <Link
                  href={`/category/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-2 text-sm hover:bg-white/5 ${active === i ? 'bg-white/5' : ''}`}
                >
                  <span className="text-mist-100">{c.name}</span>
                  <span className="text-xs text-mist-500">Category</span>
                </Link>
              </li>
            ))}
            {products.map((p, j) => {
              const i = categories.length + j;
              return (
                <li key={p.id} id={`${listId}-p-${p.id}`} role="option" aria-selected={active === i}>
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 hover:bg-white/5 ${active === i ? 'bg-white/5' : ''}`}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-ink-700">
                      <ProductImage image={p.image} alt={p.name} sizes="40px" fill />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm text-mist-100">{p.name}</span>
                    {p.isDemo && <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-warning">Demo</span>}
                    <span className="text-xs font-semibold text-blue-300">{formatPKR(p.unitPrice)}</span>
                  </Link>
                </li>
              );
            })}
            {!isFetching && options.length === 0 && (
              <li className="px-4 py-3 text-sm text-mist-400">No matches for “{term}”.</li>
            )}
          </ul>
          <button
            type="button"
            onClick={() => go(`/search?q=${encodeURIComponent(term)}`)}
            className="block w-full border-t border-line px-4 py-2.5 text-left text-xs font-medium text-blue-300 hover:bg-white/5"
          >
            See all results for “{term}”
          </button>
        </div>
      )}
    </div>
  );
}
