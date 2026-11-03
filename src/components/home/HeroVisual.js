'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import BrandMark from '@/components/brand/BrandMark';
import { cn } from '@/lib/utils/cn';

const HeroScene = dynamic(() => import('@/three/HeroScene'), { ssr: false });

function canRun3D() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (!window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return false;
  if (navigator.connection?.saveData) return false;
  if ((navigator.hardwareConcurrency || 4) < 4) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

// Static SVG first (fast LCP, works everywhere); the 3D scene is loaded after the
// page is idle on capable desktops and cross-fades in.
export default function HeroVisual() {
  const [load3D, setLoad3D] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = idle(() => canRun3D() && setLoad3D(true), { timeout: 2500 });
    return () => cancel(id);
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <div className="absolute inset-[12%] rounded-full bg-blue-500/20 blur-3xl" aria-hidden />
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-700',
          ready ? 'opacity-0' : 'opacity-100',
        )}
      >
        <BrandMark className="animate-hero-float w-[62%] text-mist-50 drop-shadow-[0_20px_60px_rgba(10,111,253,0.35)]" />
      </div>
      {load3D && (
        <div className={cn('absolute inset-0 transition-opacity duration-700', ready ? 'opacity-100' : 'opacity-0')}>
          <HeroScene onReady={onReady} />
        </div>
      )}
    </div>
  );
}
