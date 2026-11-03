import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import WishlistSync from '@/components/account/WishlistSync';
import JsonLd from '@/components/seo/JsonLd';
import LenisProvider from '@/providers/LenisProvider';
import { listActiveCategories } from '@/server/services/categoryService';
import { getSettings } from '@/server/services/settingsService';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';

export default async function StoreLayout({ children }) {
  const [categories, content, seo] = await Promise.all([
    listActiveCategories(),
    getSettings('content'),
    getSettings('seo'),
  ]);
  const navCategories = categories.filter((c) => !c.parent).map(({ name, slug }) => ({ name, slug }));

  return (
    <LenisProvider>
      <JsonLd data={[organizationJsonLd(seo.socialLinks), websiteJsonLd()]} />
      {content.announcement.enabled && content.announcement.text && <AnnouncementBar {...content.announcement} />}
      <Navbar categories={navCategories} />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer categories={navCategories} socialLinks={seo.socialLinks} />
      <CartDrawer />
      <WhatsAppButton />
      <WishlistSync />
    </LenisProvider>
  );
}
