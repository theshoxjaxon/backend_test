import { NextResponse } from 'next/server';

// One codebase, two ports: 5175 = students, 7165 = admin.
export function proxy(req) {
  const { pathname } = req.nextUrl;
  const adminPort = (req.headers.get('host') ?? '').endsWith(':7165');
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/api/admin');
  if (adminPort && pathname === '/') return NextResponse.redirect(new URL('/admin', req.url));
  if (adminPort !== isAdminPath && !pathname.startsWith('/_next') && !(adminPort && pathname === '/favicon.ico'))
    return new NextResponse('Not found', { status: 404 });
}
export const config = { matcher: '/((?!_next).*)' };
