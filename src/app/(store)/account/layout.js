import AccountNav from '@/components/account/AccountNav';
import { requireUser } from '@/server/auth/dal';

export const metadata = { title: { default: 'My account', template: '%s | My account | ZEOTON' }, robots: { index: false, follow: false } };

export default async function AccountLayout({ children }) {
  const user = await requireUser('/account');
  return (
    <div className="container-z py-10">
      <div className="mb-8">
        <p className="eyebrow eyebrow-left">My account</p>
        <h1 className="mt-3 text-3xl font-bold">Hi, {user.name.split(' ')[0]}</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountNav isAdmin={user.role === 'admin'} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
