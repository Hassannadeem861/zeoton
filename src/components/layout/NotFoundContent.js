import Link from 'next/link';
import BrandMark from '@/components/brand/BrandMark';

export default function NotFoundContent() {
  return (
    <div className="container-z relative flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" aria-hidden />
      <BrandMark className="relative h-16 w-auto text-mist-50" />
      <p className="relative mt-8 font-display text-6xl font-bold text-gradient">404</p>
      <h1 className="relative mt-4 text-2xl font-semibold">This page is not in our inventory</h1>
      <p className="relative mt-2 max-w-md text-sm text-mist-400">The link may be broken or the page may have moved. Try searching, or head back to the store.</p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Back to home</Link>
        <Link href="/products" className="btn-secondary">Browse products</Link>
      </div>
    </div>
  );
}
