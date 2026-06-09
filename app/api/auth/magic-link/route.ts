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

    if (email !== ALLOWED_EMAIL) {
      return NextResponse.json(
        { error: `Only ${ALLOWED_EMAIL} is allowed` },
        { status: 403 }
      );
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.error('Supabase magic link error:', error);
      return NextResponse.json(
        { error: error.message ?? 'Failed to send magic link' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('POST /api/auth/magic-link:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
