import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SectionHeading({ eyebrow, title, description, href, linkLabel = 'View all', as: H = 'h2' }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow eyebrow-left mb-3">{eyebrow}</p>}
        <H className="text-2xl font-semibold sm:text-3xl">{title}</H>
        {description && <p className="mt-2 text-sm text-mist-400 sm:text-base">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-medium text-blue-300 hover:text-blue-200">
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
