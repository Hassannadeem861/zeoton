import NotFoundContent from '@/components/layout/NotFoundContent';

export const metadata = { title: 'Page not found', robots: { index: false } };

// Unmatched URLs render here (outside the store layout), so this page is self-contained.
export default function NotFound() {
  return (
    <main id="main" className="bg-grid min-h-dvh">
      <NotFoundContent />
    </main>
  );
}
