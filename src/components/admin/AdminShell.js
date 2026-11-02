'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Layout, Menu } from 'antd';
import {
  Boxes, ExternalLink, FolderTree, LayoutDashboard, LogOut, Mail, Package, Settings, ShoppingCart, TicketPercent, UserCog, Users,
} from 'lucide-react';
import BrandMark from '@/components/brand/BrandMark';
import { useLogoutMutation } from '@/store/api/shopApi';

const NAV = [
  { key: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { key: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { key: '/admin/products', label: 'Products', icon: Package },
  { key: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { key: '/admin/categories', label: 'Categories', icon: FolderTree },
  { key: '/admin/customers', label: 'Customers', icon: Users },
  { key: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { key: '/admin/messages', label: 'Messages', icon: Mail },
  { key: '/admin/settings', label: 'Settings & content', icon: Settings },
  { key: '/admin/profile', label: 'My profile', icon: UserCog },
];

export default function AdminShell({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [logout, { isLoading }] = useLogoutMutation();

  const selected = NAV.filter((n) => (n.key === '/admin' ? pathname === '/admin' : pathname.startsWith(n.key))).map((n) => n.key);

  return (
    <Layout className="min-h-dvh">
      <Layout.Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} breakpoint="lg" width={232} theme="dark">
        <Link href="/admin" className="flex h-16 items-center gap-2.5 px-5 text-mist-50">
          <BrandMark className="h-6 w-auto shrink-0" />
          {!collapsed && <span className="font-display text-sm font-semibold tracking-[0.2em]">ADMIN</span>}
        </Link>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selected}
          items={NAV.map(({ key, label, icon: Icon }) => ({ key, icon: <Icon className="h-4 w-4" />, label: <Link href={key}>{label}</Link> }))}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header className="flex items-center justify-end gap-2 border-b border-line !px-4">
          <span className="mr-auto truncate text-sm text-mist-400">Signed in as {user.name}</span>
          <Link href="/" target="_blank">
            <Button type="text" icon={<ExternalLink className="h-4 w-4" />}>View store</Button>
          </Link>
          <Button
            type="text"
            loading={isLoading}
            icon={<LogOut className="h-4 w-4" />}
            onClick={async () => {
              await logout().unwrap().catch(() => {});
              router.replace('/admin/login');
              router.refresh();
            }}
          >
            Sign out
          </Button>
        </Layout.Header>
        <Layout.Content className="p-4 sm:p-6">
          <main id="main" className="mx-auto max-w-7xl">{children}</main>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
