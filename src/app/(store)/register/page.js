import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import AuthShell from '@/components/account/AuthShell';
import { RegisterForm } from '@/components/account/AuthForms';
import { getCurrentUser } from '@/server/auth/dal';

export const metadata = { title: 'Create account', robots: { index: false, follow: true } };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect('/account');
  return (
    <AuthShell title="Create your account" subtitle="Faster checkout, saved addresses and order history.">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
