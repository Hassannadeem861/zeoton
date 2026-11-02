import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { getSettings } from '@/server/services/settingsService';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 600;

export const metadata = buildMetadata({
  title: 'Frequently Asked Questions',
  description: 'Answers about ordering from ZEOTON: Cash on Delivery, delivery across Pakistan, order tracking and accounts.',
  path: '/faq',
});

export default async function FaqPage() {
  const faq = await getSettings('faq');
  return (
    <>
      <PageHeader title="Frequently asked questions" breadcrumbs={[{ name: 'FAQ' }]} />
      <div className="container-z max-w-3xl py-10">
        <div className="space-y-3">
          {faq.items.map((item, i) => (
            <details key={i} className="group surface open:border-blue-500/40" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium text-mist-50 [&::-webkit-details-marker]:hidden">
                <h2 className="font-sans text-base font-medium">{item.question}</h2>
                <ChevronDown className="h-5 w-5 shrink-0 text-mist-400 transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-mist-300">{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 text-sm text-mist-400">
          Still have a question? <Link href="/contact" className="text-blue-300 hover:underline">Contact ZEOTON</Link>.
        </p>
      </div>
    </>
  );
}
