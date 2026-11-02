import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ProductImage from '@/components/product/ProductImage';
import Reveal from '@/animations/Reveal';
import CategoryIcon from './CategoryIcon';

export default function CategoryGrid({ categories }) {
  if (!categories.length) return null;
  return (
    <Reveal as="ul" stagger={0.06} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {categories.map((c) => (
        <li key={c.slug}>
          <Link
            href={`/category/${c.slug}`}
            className="group relative flex h-full min-h-40 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-ink-800 to-ink-850 p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-glow"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl transition group-hover:bg-blue-500/25" aria-hidden />
            {c.image?.url ? (
              <div className="relative h-16 w-16">
                <ProductImage image={c.image} alt="" sizes="64px" fill />
              </div>
            ) : (
              <CategoryIcon slug={c.slug} className="h-9 w-9 text-blue-400 transition group-hover:scale-110" />
            )}
            <div className="mt-6 flex items-end justify-between gap-2">
              <div>
                <h3 className="font-sans text-base font-semibold text-mist-50">{c.name}</h3>
                <p className="mt-0.5 text-xs text-mist-500">
                  {c.productCount > 0 ? `${c.productCount} ${c.productCount === 1 ? 'product' : 'products'}` : 'Coming soon'}
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-mist-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-300" aria-hidden />
            </div>
          </Link>
        </li>
      ))}
    </Reveal>
  );
}
