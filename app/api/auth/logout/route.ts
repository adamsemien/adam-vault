import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ logged_out: true });

  // Clear auth cookies
  response.cookies.set('sb-auth-token', '', { maxAge: 0, path: '/' });
  response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });

  return response;
}
