import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ALLOWED_EMAIL = 'adamsemien@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email is allowed
    if (email !== ALLOWED_EMAIL) {
      return NextResponse.json(
        { error: `Only ${ALLOWED_EMAIL} is allowed` },
        { status: 403 }
      );
    }

    // Send magic link via Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return NextResponse.json(
        { error: 'Failed to send magic link' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Magic link sent to email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
