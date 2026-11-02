import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { mainNav } from '@/config/site';
import SearchBox from './SearchBox';
import HeaderActions from './HeaderActions';
import MobileMenu from './MobileMenu';

export default function Navbar({ categories }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-900/75 backdrop-blur-xl supports-[backdrop-filter]:bg-ink-900/60">
      <div className="container-z flex h-16 items-center gap-3 lg:gap-6">
        <MobileMenu categories={categories} />
        <Logo priority />

        <nav aria-label="Main" className="ml-2 hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-mist-300 transition hover:bg-white/5 hover:text-mist-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-sm md:block">
          <SearchBox />
        </div>
        <HeaderActions />
      </div>

      {categories.length > 0 && (
        <nav aria-label="Categories" className="hidden border-t border-white/5 lg:block">
          <ul className="container-z scrollbar-none flex h-10 items-center gap-6 overflow-x-auto text-[0.8rem] text-mist-400">
            {categories.map((c) => (
              <li key={c.slug} className="shrink-0">
                <Link href={`/category/${c.slug}`} className="transition hover:text-blue-300">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="container-z pb-3 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
