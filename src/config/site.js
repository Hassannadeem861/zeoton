export const siteConfig = {
  name: 'ZEOTON',
  tagline: 'Gaming Accessories',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  description:
    'ZEOTON is an online store for gaming accessories in Pakistan: gaming mice, keyboards, headsets, controllers and setup gear, with Cash on Delivery nationwide.',
  email: 'zeoton.online@gmail.com',
  phone: '+923702885718',
  phoneDisplay: '+92 370 2885718',
  country: 'PK',
  currency: 'PKR',
  locale: 'en_PK',
  ogImage: '/og-default.png',
  logo: '/brand/zeoton-logo-light.png',
};

export const mainNav = [
  { label: 'Shop All', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: 'Track Order', href: '/track-order' },
  { label: 'Support', href: '/contact' },
];

export const footerNav = {
  shop: [
    { label: 'All Products', href: '/products' },
    { label: 'Categories', href: '/categories' },
    { label: 'Compare', href: '/compare' },
    { label: 'Wishlist', href: '/wishlist' },
  ],
  help: [
    { label: 'Track Order', href: '/track-order' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Returns & Exchanges', href: '/returns-policy' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ],
  company: [
    { label: 'About ZEOTON', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
};
