import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ALLOWED_EMAILS = ['adamsemien@gmail.com', 'rraadamm@gmail.com'];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email is allowed
    if (!ALLOWED_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: 'Email not authorized' },
        { status: 403 }
      );
    }

    // Sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error('Supabase auth error:', error);
      return NextResponse.json(
        { error: error?.message ?? 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Build redirect response and set session cookie
    const response = NextResponse.json({ ok: true }, { status: 200 });

    response.cookies.set('sb-auth-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
