'use client';

import { useState } from 'react';
import ProductImage from './ProductImage';
import { cn } from '@/lib/utils/cn';

export default function ProductGallery({ images, name }) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
    if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-3">
      <div className="surface relative aspect-square overflow-hidden bg-gradient-to-b from-ink-700/50 to-ink-850">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div className="relative h-full w-full p-6 sm:p-10">
          <ProductImage image={current} alt={current?.alt || name} sizes="(min-width:1024px) 50vw, 100vw" fill priority />
        </div>
        {images.length > 1 && (
          <p className="absolute bottom-3 right-3 rounded-md bg-ink-950/70 px-2 py-1 text-xs text-mist-300" aria-live="polite">
            {index + 1} / {images.length}
          </p>
        )}
      </div>
      {images.length > 1 && (
        <div role="tablist" aria-label="Product images" className="scrollbar-none flex gap-2 overflow-x-auto" onKeyDown={onKeyDown}>
          {images.map((img, i) => (
            <button
              key={img.publicId || img.url}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show image ${i + 1}`}
              tabIndex={i === index ? 0 : -1}
              onClick={() => setIndex(i)}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-ink-800 p-1.5 transition',
                i === index ? 'border-blue-500' : 'border-line hover:border-mist-500',
              )}
            >
              <span className="relative block h-full w-full">
                <ProductImage image={img} alt="" sizes="80px" fill />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
