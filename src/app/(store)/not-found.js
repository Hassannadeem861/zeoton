import NotFoundContent from '@/components/layout/NotFoundContent';

export const metadata = { title: 'Page not found', robots: { index: false } };

export default function StoreNotFound() {
  return <NotFoundContent />;
}
