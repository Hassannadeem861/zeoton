import { FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Amber (not brand blue) so demo content is never mistaken for a real promotion.
export default function DemoBadge({ className, size = 'sm' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-warning/50 bg-warning/15 font-bold uppercase tracking-[0.12em] text-warning',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      <FlaskConical className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      Demo product
    </span>
  );
}

export function DemoNotice({ className }) {
  return (
    <div role="note" className={cn('mb-5 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-mist-200', className)}>
      <DemoBadge size="md" />
      <p className="mt-2 leading-relaxed">
        This is a <strong className="text-mist-50">demo product</strong> shown for design review. The name, brand, price, specifications, images and stock are
        placeholders — not real ZEOTON inventory or prices.
      </p>
    </div>
  );
}

export function DemoCartNotice() {
  return (
    <p role="note" className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs leading-relaxed text-warning">
      Your cart contains demo products. Orders with demo products are test orders only and will not be fulfilled.
    </p>
  );
}
