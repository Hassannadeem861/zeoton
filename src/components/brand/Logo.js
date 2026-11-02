import Image from 'next/image';
import Link from 'next/link';
import BrandMark from './BrandMark';
import { cn } from '@/lib/utils/cn';

export default function Logo({ className, href = '/', priority = false }) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-2.5 text-mist-50', className)} aria-label="ZEOTON home">
      <BrandMark className="h-7 w-auto transition-transform duration-300 group-hover:-translate-y-0.5" />
      <Image
        src="/brand/zeoton-wordmark-light.webp"
        alt=""
        width={551}
        height={58}
        priority={priority}
        className="hidden h-[15px] w-auto sm:block"
      />
    </Link>
  );
}
