'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import { mainNav } from '@/config/site';
import Logo from '@/components/brand/Logo';
import { lockScroll } from '@/lib/scroll/scrollLock';

export default function MobileMenu({ categories }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Close when navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const unlockScroll = lockScroll();
    panelRef.current?.querySelector('a,button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      unlockScroll();
    };
  }, [open]);

  return (
    <>
      <button type="button" className="icon-btn -ml-2 lg:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </button>
      {/* Portal: the sticky header uses backdrop-filter, which would trap a fixed overlay inside it. */}
      {open && createPortal(
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div ref={panelRef} className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col border-r border-line bg-ink-850" data-lenis-prevent>
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Logo />
              <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2 py-4">
              <ul className="space-y-1">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block rounded-lg px-3 py-2.5 font-medium text-mist-100 hover:bg-white/5">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {categories.length > 0 && (
                <>
                  <p className="eyebrow eyebrow-left mt-6 mb-2 px-3">Categories</p>
                  <ul className="space-y-0.5">
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/category/${c.slug}`} className="block rounded-lg px-3 py-2 text-sm text-mist-300 hover:bg-white/5 hover:text-mist-50">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </nav>
          </div>
        </div>
      , document.body)}
    </>
  );
}
