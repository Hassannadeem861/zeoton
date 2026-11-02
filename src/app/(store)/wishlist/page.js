import PageHeader from '@/components/layout/PageHeader';
import WishlistView from '@/components/account/WishlistView';

export const metadata = { title: 'Wishlist', robots: { index: false, follow: true } };

export default function WishlistPage() {
  return (
    <>
      <PageHeader title="Your wishlist" description="Products you saved for later." breadcrumbs={[{ name: 'Wishlist' }]} />
      <div className="container-z py-10">
        <WishlistView />
      </div>
    </>
  );
}
