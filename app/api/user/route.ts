import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Check auth - dashboard session only
    const sessionCookie = req.cookies.get('sb-auth-token');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from Supabase auth
    const { data, error } = await supabase.auth.getUser(sessionCookie.value);

    if (error || !data.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at,
    });
  } catch (error) {
    console.error('GET /api/user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
