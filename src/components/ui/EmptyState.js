import Link from 'next/link';
import BrandMark from '@/components/brand/BrandMark';

export default function EmptyState({ title, description, actionHref, actionLabel, children }) {
  return (
    <div className="surface flex flex-col items-center px-6 py-16 text-center">
      <BrandMark className="mb-6 h-12 w-auto text-ink-600" />
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm text-mist-400">{description}</p>}
      {actionHref && (
        <Link href={actionHref} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
      {children}
    </div>
  );
}
