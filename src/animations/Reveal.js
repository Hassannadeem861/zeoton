'use client';

import { useRef } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from './gsap';

/**
 * Fades/slides children in once when scrolled into view. Animates only opacity and
 * transform (no layout shift). With `stagger`, direct children animate in sequence.
 * Content is visible without JS and with reduced motion.
 */
export default function Reveal({ children, as: Tag = 'div', stagger = 0, y = 24, className, ...rest }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;
      const targets = stagger ? ref.current.children : ref.current;
      gsap.from(targets, {
        opacity: 0,
        y,
        stagger: stagger || 0,
        duration: 0.7,
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
