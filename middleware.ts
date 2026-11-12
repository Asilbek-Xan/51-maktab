import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// /admin ichidagi (login'dan tashqari) sahifalarga tokensiz kirishni darhol to'xtatadi.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !req.cookies.get('panel_token')) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*'] };
