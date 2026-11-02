import { formatPKR } from '@/lib/utils/format';
import { discountPercent } from '@/lib/utils/pricing';
import { cn } from '@/lib/utils/cn';

export default function Price({ unitPrice, price, salePrice, fromPrice = false, size = 'md', className }) {
  const onSale = salePrice != null && salePrice < price;
  const pct = onSale ? discountPercent(price, salePrice) : 0;
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('font-display font-semibold text-mist-50', size === 'lg' ? 'text-3xl' : 'text-base')}>
        {fromPrice && <span className="mr-1 text-xs font-normal text-mist-400">From</span>}
        {formatPKR(unitPrice)}
      </span>
      {onSale && (
        <>
          <span className={cn('text-mist-500 line-through', size === 'lg' ? 'text-base' : 'text-xs')}>
            <span className="sr-only">Regular price </span>
            {formatPKR(price)}
          </span>
          {pct > 0 && <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-blue-300">-{pct}%</span>}
        </>
      )}
    </div>
  );
}
