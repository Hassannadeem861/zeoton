'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/animations/gsap';
import { registerLenis } from '@/lib/scroll/scrollLock';

let activeLenis = null;

/**
 * Smooth wheel scrolling for the storefront (desktop, fine pointer only).
 * - Disabled for prefers-reduced-motion and touch/coarse pointers: native scrolling is kept.
 * - The Lenis instance is created and wired to GSAP's ticker in the same effect, so it is
 *   always driven (an un-driven Lenis swallows wheel events and the page cannot scroll).
 * - The React tree never changes when Lenis turns on/off (no remount of the page).
 */
export default function LenisProvider({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)');
    let teardown = null;

    const start = () => {
      const lenis = new Lenis({ autoRaf: false, lerp: 0.12, smoothWheel: true, anchors: true });
      const raf = (time) => lenis.raf(time * 1000);
      const onScroll = () => ScrollTrigger.update();
      lenis.on('scroll', onScroll);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      activeLenis = lenis;
      registerLenis(lenis);
      return () => {
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.off('scroll', onScroll);
        lenis.destroy();
        activeLenis = null;
        registerLenis(null);
      };
    };

    const sync = () => {
      const shouldRun = !reduce.matches && !coarse.matches;
      if (shouldRun && !teardown) teardown = start();
      if (!shouldRun && teardown) {
        teardown();
        teardown = null;
      }
    };

    sync();
    reduce.addEventListener('change', sync);
    coarse.addEventListener('change', sync);
    return () => {
      reduce.removeEventListener('change', sync);
      coarse.removeEventListener('change', sync);
      teardown?.();
    };
  }, []);

  // After client navigation, drop any in-flight smooth scroll and adopt the position
  // Next.js set (top of the new page), so Lenis never drags the old target along.
  useEffect(() => {
    const lenis = activeLenis;
    if (!lenis) return undefined;
    const id = requestAnimationFrame(() => {
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      lenis.resize();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return children;
}
