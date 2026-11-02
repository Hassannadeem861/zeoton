import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { footerNav, siteConfig } from '@/config/site';

function Column({ title, links }) {
  return (
    <div>
      <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-mist-400">{title}</h2>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-mist-300 transition hover:text-mist-50">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ categories = [], socialLinks = [] }) {
  return (
    <footer className="relative mt-24 border-t border-line bg-ink-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" aria-hidden />
      <div className="container-z grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-mist-400">
            Gaming accessories for players across Pakistan. Cash on Delivery available nationwide.
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-2 text-mist-300 hover:text-mist-50">
                <Mail className="h-4 w-4 text-blue-400" aria-hidden /> {siteConfig.email}
              </a>
            </li>
            <li>
              <a href={`tel:${siteConfig.phone}`} className="inline-flex items-center gap-2 text-mist-300 hover:text-mist-50">
                <Phone className="h-4 w-4 text-blue-400" aria-hidden /> {siteConfig.phoneDisplay}
              </a>
            </li>
          </ul>
          {socialLinks.length > 0 && (
            <ul className="flex flex-wrap gap-3 text-sm">
              {socialLinks.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-mist-400 hover:text-blue-300">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Column title="Shop" links={footerNav.shop} />
        {categories.length > 0 && (
          <Column title="Categories" links={categories.slice(0, 6).map((c) => ({ label: c.name, href: `/category/${c.slug}` }))} />
        )}
        <Column title="Help" links={footerNav.help} />
        <Column title="Company" links={footerNav.company} />
      </div>
      <div className="border-t border-line">
        <div className="container-z flex flex-col items-center justify-between gap-2 py-5 text-xs text-mist-500 sm:flex-row">
          <p>© {new Date().getFullYear()} ZEOTON. All rights reserved.</p>
          <p>Prices in Pakistani Rupees (PKR)</p>
        </div>
      </div>
    </footer>
  );
}
