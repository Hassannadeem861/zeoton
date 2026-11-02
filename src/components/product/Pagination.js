import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

function pageHref(basePath, searchParams, page) {
  const params = new URLSearchParams(searchParams);
  if (page <= 1) params.delete('page');
  else params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageList(current, total) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

// Crawlable numbered pagination (plain links).
export default function Pagination({ basePath, searchParams = {}, page, totalPages }) {
  if (totalPages <= 1) return null;
  const pages = pageList(page, totalPages);
  const linkCls = 'flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm transition';
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={pageHref(basePath, searchParams, page - 1)} rel="prev" className={cn(linkCls, 'border-line text-mist-300 hover:border-blue-500/50')} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-mist-500">…</span>}
          <Link
            href={pageHref(basePath, searchParams, p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(linkCls, p === page ? 'border-blue-500 bg-blue-500/15 text-mist-50' : 'border-line text-mist-300 hover:border-blue-500/50')}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={pageHref(basePath, searchParams, page + 1)} rel="next" className={cn(linkCls, 'border-line text-mist-300 hover:border-blue-500/50')} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
