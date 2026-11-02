import { Inter, Sora } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import StoreProvider from '@/store/StoreProvider';
import { siteConfig } from '@/config/site';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap', weight: ['500', '600', '700'] });

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} | Gaming Accessories in Pakistan`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { siteName: siteConfig.name, locale: siteConfig.locale, type: 'website', images: [siteConfig.ogImage] },
  twitter: { card: 'summary_large_image' },
};

export const viewport = {
  themeColor: '#070a12',
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-PK" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-blue-500 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <NextTopLoader color="#0A6FFD" height={2} showSpinner={false} shadow="0 0 10px #0A6FFD,0 0 5px #0A6FFD" />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
