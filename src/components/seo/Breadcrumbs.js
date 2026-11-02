import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import JsonLd from './JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

/** items: [{ name, href? }] — the last item is the current page. */
export default function Breadcrumbs({ items }) {
  const all = [{ name: 'Home', href: '/' }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs text-mist-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((item, i) => {
            const last = i === all.length - 1;
            return (
              <li key={`${item.name}-${i}`} className="flex items-center gap-1.5">
                {item.href && !last ? (
                  <Link href={item.href} className="transition hover:text-mist-50">
                    {item.name}
                  </Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined} className={last ? 'text-mist-100' : undefined}>
                    {item.name}
                  </span>
                )}
                {!last && <ChevronRight className="h-3 w-3 text-mist-500" aria-hidden />}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  );
}
