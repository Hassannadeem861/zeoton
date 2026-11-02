import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { readSessionUser } from './session';

// Data Access Layer: the single place that decides who the current user is.
// Every protected page, layout and API route goes through these helpers.
export const getCurrentUser = cache(readSessionUser);

export async function requireUser(nextPath = '/account') {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/admin/login');
  return user;
}
