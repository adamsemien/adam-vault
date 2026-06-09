import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', req.url));
  }

  try {
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      console.error('Auth exchange error:', error);
      return NextResponse.redirect(new URL('/login?error=invalid_code', req.url));
    }

    // Verify email is allowed
    const email = data.session.user?.email;
    const allowedEmail = 'adamsemien@gmail.com';
    
    if (email !== allowedEmail) {
      // Revoke the session
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL(`/login?error=email_not_allowed`, req.url));
    }

    // Create response that redirects to vault
    const response = NextResponse.redirect(new URL('/vault', req.url));

    // Set the session cookie
    response.cookies.set('sb-auth-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
  }
}
