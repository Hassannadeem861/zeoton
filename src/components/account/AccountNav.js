'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Package, Shield, UserRound } from 'lucide-react';
import { useLogoutMutation } from '@/store/api/shopApi';
import { cn } from '@/lib/utils/cn';

const LINKS = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/profile', label: 'Profile & addresses', icon: UserRound },
];

export default function AccountNav({ isAdmin }) {
  const pathname = usePathname();
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();

  return (
    <nav aria-label="Account" className="flex gap-1 overflow-x-auto lg:flex-col">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === '/account' ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn('flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition', active ? 'bg-blue-500/15 text-mist-50' : 'text-mist-300 hover:bg-white/5')}
          >
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link href="/admin" className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-mist-300 hover:bg-white/5">
          <Shield className="h-4 w-4" aria-hidden /> Admin panel
        </Link>
      )}
      <button
        type="button"
        disabled={isLoading}
        onClick={async () => {
          await logout().unwrap().catch(() => {});
          router.replace('/');
          router.refresh();
        }}
        className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-mist-400 hover:bg-white/5 hover:text-danger"
      >
        <LogOut className="h-4 w-4" aria-hidden /> Sign out
      </button>
    </nav>
  );
}
