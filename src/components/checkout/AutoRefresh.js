'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Re-renders the server page periodically (and when the tab regains focus) to pick up status changes.
export default function AutoRefresh({ seconds = 15 }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    const onFocus = () => router.refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [router, seconds]);
  return null;
}
