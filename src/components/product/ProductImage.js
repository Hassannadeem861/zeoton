'use client';

import Image from 'next/image';
import BrandMark from '@/components/brand/BrandMark';

// Cloudinary does the resizing (c_limit never upscales; f_auto serves AVIF/WebP),
// so Vercel's image-optimization quota is not used for product photos.
function cloudinaryLoader({ src, width, quality }) {
  return src.replace('/upload/', `/upload/f_auto,q_${quality || 'auto'},c_limit,w_${width}/`);
}

export default function ProductImage({ image, alt, sizes, priority = false, fill = false, className = 'object-contain', width, height }) {
  if (!image?.url) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-700 to-ink-850" role="img" aria-label={alt || 'No image available'}>
        <BrandMark className="w-1/3 max-w-16 text-ink-600" />
      </div>
    );
  }
  const isCloudinary = image.url.startsWith('https://res.cloudinary.com/');
  const dims = fill ? { fill: true } : { width: width || image.width || 800, height: height || image.height || 800 };
  return (
    <Image
      src={image.url}
      alt={alt ?? image.alt ?? ''}
      sizes={sizes}
      priority={priority}
      loader={isCloudinary ? cloudinaryLoader : undefined}
      className={className}
      {...dims}
    />
  );
}
