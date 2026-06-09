import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { name, allowed_tags } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');
    const token_prefix = token.slice(0, 8);

    const { data, error } = await supabase
      .from('project_tokens')
      .insert({
        name,
        token_hash,
        token_prefix,
        allowed_tags: allowed_tags || [],
        revoked: false,
      })
      .select();

    if (error) throw error;

    return NextResponse.json({
      token,
      tokenData: data?.[0],
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tokens:', error);
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('project_tokens')
      .select('id, name, token_prefix, allowed_tags, last_used, created_at, revoked')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ tokens: data || [] });
  } catch (error) {
    console.error('GET /api/tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
