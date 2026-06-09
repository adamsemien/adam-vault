import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (pathname === '/login' || pathname === '/api/health') {
    return NextResponse.next();
  }

  // Check for auth token in headers
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  // For protected pages
  if (pathname === '/vault' || pathname === '/') {
    const isLoggedIn = request.cookies.get('auth_token')?.value;
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/vault/:path*', '/api/:path*', '/'],
};
