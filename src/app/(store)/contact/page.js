import { Mail, Phone } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import ContactForm from '@/components/account/ContactForm';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/config/site';

export const metadata = buildMetadata({
  title: 'Contact & Support',
  description: `Contact ZEOTON for product questions and order support. Email ${siteConfig.email} or call ${siteConfig.phoneDisplay}.`,
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact & support" description="Questions about a product or an order? Send us a message or reach us directly." breadcrumbs={[{ name: 'Contact' }]} />
      <div className="container-z grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <ContactForm />
        <aside className="space-y-4">
          <a href={`mailto:${siteConfig.email}`} className="surface flex items-center gap-4 p-5 transition hover:border-blue-500/50">
            <Mail className="h-6 w-6 text-blue-400" aria-hidden />
            <div>
              <p className="text-sm text-mist-400">Email</p>
              <p className="font-medium text-mist-50">{siteConfig.email}</p>
            </div>
          </a>
          <a href={`tel:${siteConfig.phone}`} className="surface flex items-center gap-4 p-5 transition hover:border-blue-500/50">
            <Phone className="h-6 w-6 text-blue-400" aria-hidden />
            <div>
              <p className="text-sm text-mist-400">Phone</p>
              <p className="font-medium text-mist-50">{siteConfig.phoneDisplay}</p>
            </div>
          </a>
          <p className="text-xs text-mist-500">For order questions, please include your order number (e.g. ZT-000123).</p>
        </aside>
      </div>
    </>
  );
}
