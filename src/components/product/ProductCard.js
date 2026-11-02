import Link from 'next/link';
import ProductImage from './ProductImage';
import Price from './Price';
import DemoBadge from './DemoBadge';
import { CompareButton, QuickAddButton, WishlistButton } from './ProductActions';

// Works in both Server and Client Components (no hooks; interactive bits are client islands).
export default function ProductCard({ product, priority = false }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-ink-850/70 transition duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-glow">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-ink-700/60 to-ink-850">
        <Link href={`/product/${product.slug}`} tabIndex={-1} aria-hidden className="absolute inset-0 p-5">
          <div className="relative h-full w-full transition duration-500 group-hover:scale-[1.04]">
            <ProductImage image={product.image} alt={product.image?.alt || product.name} sizes="(min-width:1280px) 280px, (min-width:768px) 30vw, 50vw" fill priority={priority} />
          </div>
        </Link>
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5">
          <WishlistButton productId={product.id} className="h-9 w-9" />
          <CompareButton productId={product.id} className="h-9 w-9" />
        </div>
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isDemo && <DemoBadge className="bg-ink-950/85" />}
          {!product.inStock && <span className="rounded-md bg-ink-950/80 px-2 py-1 text-[11px] font-medium text-mist-300">Out of stock</span>}
          {product.inStock && product.salePrice != null && product.salePrice < product.price && (
            <span className="cut-corner bg-blue-500 px-2.5 py-1 text-[11px] font-semibold text-white">Sale</span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.brand && <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-mist-500">{product.brand}</p>}
        <h3 className="line-clamp-2 font-sans text-sm font-medium leading-snug text-mist-100">
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:text-blue-300">
            {product.name}
          </Link>
        </h3>
        <Price unitPrice={product.unitPrice} price={product.price} salePrice={product.salePrice} fromPrice={product.fromPrice} className="mt-auto" />
        <div className="relative z-10 pt-1">
          <QuickAddButton product={product} />
        </div>
      </div>
    </article>
  );
}
