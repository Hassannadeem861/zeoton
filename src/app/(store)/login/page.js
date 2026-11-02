import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import AuthShell from '@/components/account/AuthShell';
import { LoginForm } from '@/components/account/AuthForms';
import { getCurrentUser } from '@/server/auth/dal';

export const metadata = { title: 'Sign in', robots: { index: false, follow: true } };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === 'admin' ? '/admin' : '/account');
  return (
    <AuthShell title="Sign in" subtitle="Access your orders, saved addresses and wishlist.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
