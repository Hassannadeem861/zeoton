import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'zt_session';

// Optimistic redirect only (cookie presence). Real authorization happens on the
// server in every protected layout and API route (src/server/auth/dal.js).
export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (pathname.startsWith('/account')) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
