'use client';

import { useRef } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from '@/animations/gsap';

// Staggered entrance for hero copy. Text is server-rendered and visible without JS;
// the animation starts from a small offset so LCP text is never hidden for long.
export default function HeroIntro({ children }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('[data-hero]', { y: 18, opacity: 0.001, duration: 0.7, stagger: 0.08, clearProps: 'transform,opacity' });
    },
    { scope: ref },
  );
  return <div ref={ref}>{children}</div>;
}
