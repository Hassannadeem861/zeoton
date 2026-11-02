import Link from 'next/link';
import { Banknote, MapPinned, PackageSearch, Tags } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import RichText from '@/components/ui/RichText';
import { getSettings } from '@/server/services/settingsService';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/config/site';

export const revalidate = 600;

export const metadata = buildMetadata({
  title: 'About ZEOTON',
  description: 'ZEOTON is an online gaming accessories store serving customers across Pakistan, with prices in PKR and Cash on Delivery.',
  path: '/about',
});

const POINTS = [
  { icon: Tags, title: 'Clear product information', text: 'Prices in Pakistani Rupees, real stock status and specifications on every product page.' },
  { icon: Banknote, title: 'Cash on Delivery', text: 'Order online and pay in cash when your order arrives.' },
  { icon: MapPinned, title: 'Nationwide delivery', text: 'We deliver to customers all over Pakistan.' },
  { icon: PackageSearch, title: 'Order tracking', text: 'Follow your order status online with your order number and phone number.' },
];

export default async function AboutPage() {
  const content = await getSettings('content');
  return (
    <>
      <PageHeader title="About ZEOTON" eyebrow="Gaming Accessories" breadcrumbs={[{ name: 'About' }]} />
      <div className="container-z py-10">
        {content.about ? (
          <RichText text={content.about} />
        ) : (
          <div className="prose-z">
            <p>
              ZEOTON is an online store for gaming accessories, serving players across Pakistan. We bring together gaming mice, keyboards, headsets, controllers, mouse pads, chairs and the
              accessories that complete a setup — in one place, with prices in PKR.
            </p>
            <p>
              Our aim is simple: make it easy to compare gear, understand what you are buying, and order with confidence using Cash on Delivery.
            </p>
          </div>
        )}

        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="surface p-5">
              <Icon className="h-6 w-6 text-blue-400" aria-hidden />
              <h2 className="mt-3 font-sans text-base font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-mist-400">{text}</p>
            </li>
          ))}
        </ul>

        <div className="surface mt-10 p-6">
          <h2 className="text-lg font-semibold">Get in touch</h2>
          <p className="mt-2 text-sm text-mist-300">
            Email <a className="text-blue-300 hover:underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or call{' '}
            <a className="text-blue-300 hover:underline" href={`tel:${siteConfig.phone}`}>{siteConfig.phoneDisplay}</a>. You can also{' '}
            <Link href="/contact" className="text-blue-300 hover:underline">send us a message</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
