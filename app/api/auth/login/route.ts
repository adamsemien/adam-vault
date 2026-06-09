import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Generate a simple session token
    const token = crypto.randomBytes(32).toString('hex');

    return NextResponse.json({
      token,
      user: { email },
    });
  } catch (error) {
    console.error('POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
