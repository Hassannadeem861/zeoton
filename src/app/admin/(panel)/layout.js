import AdminShell from '@/components/admin/AdminShell';
import { requireAdmin } from '@/server/auth/dal';

// Server-side guard for every admin page (the proxy redirect is only a convenience).
export default async function AdminPanelLayout({ children }) {
  const user = await requireAdmin();
  return <AdminShell user={user}>{children}</AdminShell>;
}
