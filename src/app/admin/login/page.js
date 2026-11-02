import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { getCurrentUser } from '@/server/auth/dal';

export const metadata = { title: 'Sign in' };

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === 'admin') redirect('/admin');
  return <AdminLoginForm />;
}
