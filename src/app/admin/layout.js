import { AntdRegistry } from '@ant-design/nextjs-registry';
import AdminThemeProvider from '@/components/admin/AdminThemeProvider';

export const metadata = {
  title: { default: 'Admin', template: '%s | ZEOTON Admin' },
  robots: { index: false, follow: false },
};

// Ant Design is loaded only under /admin, keeping the storefront bundle light.
export default function AdminRootLayout({ children }) {
  return (
    <AntdRegistry>
      <AdminThemeProvider>{children}</AdminThemeProvider>
    </AntdRegistry>
  );
}
