import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/config/site';

export const metadata = buildMetadata({
  title: 'Terms & Conditions',
  description: 'Terms and conditions for shopping at ZEOTON, the online gaming accessories store in Pakistan.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms & conditions" description="Last updated: 2 November 2026" breadcrumbs={[{ name: 'Terms & Conditions' }]} />
      <div className="container-z py-10">
        <div className="prose-z">
          <p>By using this website or placing an order with ZEOTON, you agree to these terms.</p>

          <h2>Orders</h2>
          <ul>
            <li>Placing an order is an offer to buy. We may contact you to confirm your order before dispatch.</li>
            <li>We may cancel an order, for example if an item is unavailable, if there is an obvious pricing error, or if we cannot reach you to confirm delivery details. If this happens we will let you know.</li>
            <li>Please make sure your name, phone number and delivery address are correct. Wrong details can delay or prevent delivery.</li>
          </ul>

          <h2>Prices and payment</h2>
          <ul>
            <li>All prices are in Pakistani Rupees (PKR). The price charged is the price shown when you place your order.</li>
            <li>Payment is currently by Cash on Delivery: you pay the delivery rider when your order arrives.</li>
            <li>Shipping charges are explained in our <Link href="/shipping-policy">Shipping Policy</Link>.</li>
          </ul>

          <h2>Delivery</h2>
          <p>We deliver across Pakistan. See the <Link href="/shipping-policy">Shipping Policy</Link> for details.</p>

          <h2>Returns and exchanges</h2>
          <p>Returns and exchanges are handled under our <Link href="/returns-policy">Returns & Exchanges policy</Link>.</p>

          <h2>Product information</h2>
          <p>We try to describe every product accurately. Product images are for illustration, and colours may look slightly different on different screens.</p>

          <h2>Accounts</h2>
          <p>You are responsible for keeping your password private. Tell us straight away if you think someone else has accessed your account.</p>

          <h2>Acceptable use</h2>
          <p>Do not misuse the website, for example by attempting to access other people’s data, interfering with its security, or placing fraudulent orders.</p>

          <h2>Changes</h2>
          <p>We may update these terms. The version published on this page applies to orders placed after the update.</p>

          <h2>Governing law</h2>
          <p>These terms are governed by the laws of Pakistan.</p>

          <h2>Contact</h2>
          <p>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> · {siteConfig.phoneDisplay}
          </p>
        </div>
      </div>
    </>
  );
}
