import PageHeader from '@/components/layout/PageHeader';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/config/site';

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'How ZEOTON collects, uses and protects your personal information.',
  path: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader title="Privacy policy" description="Last updated: 2 November 2026" breadcrumbs={[{ name: 'Privacy Policy' }]} />
      <div className="container-z py-10">
        <div className="prose-z">
          <p>This policy explains what personal information ZEOTON collects when you use this website, why we collect it and how you can contact us about it.</p>

          <h2>Information we collect</h2>
          <ul>
            <li><strong>Orders:</strong> your name, mobile number, delivery address, optional email address and order notes, so we can deliver your order and contact you about it.</li>
            <li><strong>Accounts:</strong> if you create an account, your name, email, optional phone number, saved addresses, wishlist and a securely hashed password. We never store your password in readable form.</li>
            <li><strong>Messages:</strong> the details you enter in the contact form.</li>
            <li><strong>On your device:</strong> your cart, wishlist, comparison list and recently viewed products are stored in your browser so they are remembered between visits.</li>
          </ul>

          <h2>Cookies</h2>
          <p>We use one essential cookie to keep you signed in to your account. It is not used for advertising or tracking. If you are not signed in, it is not set.</p>

          <h2>How we use your information</h2>
          <ul>
            <li>To process, deliver and support your orders, including sharing your name, phone number and address with the delivery company handling your order.</li>
            <li>To manage your account and show your order history.</li>
            <li>To reply to your messages.</li>
            <li>To keep the website secure, for example by limiting repeated sign-in attempts.</li>
          </ul>
          <p>We do not sell your personal information.</p>

          <h2>Where your data is stored</h2>
          <p>Website and order data are stored with our hosting and database providers, who process it on our behalf. Product images are stored with an image hosting provider.</p>

          <h2>Your choices</h2>
          <p>
            You can update your profile and addresses from your account at any time. To request a copy of your data or ask us to delete your account, email{' '}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. We may keep order records where needed for accounting or legal reasons.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or {siteConfig.phoneDisplay}.
          </p>
        </div>
      </div>
    </>
  );
}
