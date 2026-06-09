import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and health check
  if (pathname === '/login' || pathname === '/api/health') {
    return NextResponse.next();
  }

  // Allow API calls with Bearer token
  if (pathname.startsWith('/api/') && request.headers.get('authorization')?.startsWith('Bearer ')) {
    return NextResponse.next();
  }

  // Check for Supabase session cookie for protected pages
  if (pathname.startsWith('/vault') || pathname === '/') {
    const hasSession = request.cookies.get('sb-auth-token');

    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/vault/:path*', '/api/:path*', '/'],
};
