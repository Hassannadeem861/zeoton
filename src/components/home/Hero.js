import Link from 'next/link';
import { ArrowRight, Banknote, MapPinned, PackageSearch } from 'lucide-react';
import HeroVisual from './HeroVisual';
import HeroIntro from './HeroIntro';

export default function Hero({ hero }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden />
      <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px]" aria-hidden />
      {/* Diagonal accent from the logo's blue stripe */}
      <div className="absolute -right-24 top-1/3 hidden h-2 w-[520px] -rotate-[38deg] bg-gradient-to-r from-transparent via-blue-500/70 to-transparent lg:block" aria-hidden />

      <div className="container-z relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <HeroIntro>
          {hero.eyebrow && <p data-hero className="eyebrow eyebrow-left mb-5">{hero.eyebrow}</p>}
          <h1 data-hero className="text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            <span className="text-gradient">{hero.title}</span>
          </h1>
          {hero.subtitle && (
            <p data-hero className="mt-6 max-w-xl text-base leading-relaxed text-mist-300 sm:text-lg">
              {hero.subtitle}
            </p>
          )}
          <div data-hero className="mt-9 flex flex-wrap gap-3">
            <Link href={hero.ctaHref || '/products'} className="btn-primary btn-lg">
              {hero.ctaLabel || 'Shop now'} <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link href="/categories" className="btn-secondary btn-lg">
              Browse categories
            </Link>
          </div>
          <ul data-hero className="mt-10 grid max-w-xl grid-cols-1 gap-3 text-sm text-mist-300 sm:grid-cols-3">
            <li className="flex items-center gap-2.5">
              <Banknote className="h-5 w-5 shrink-0 text-blue-400" aria-hidden /> Cash on Delivery
            </li>
            <li className="flex items-center gap-2.5">
              <MapPinned className="h-5 w-5 shrink-0 text-blue-400" aria-hidden /> Delivery across Pakistan
            </li>
            <li className="flex items-center gap-2.5">
              <PackageSearch className="h-5 w-5 shrink-0 text-blue-400" aria-hidden /> Online order tracking
            </li>
          </ul>
        </HeroIntro>
        <HeroVisual />
      </div>
    </section>
  );
}
