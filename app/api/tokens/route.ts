import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { CORS_HEADERS, corsOptions } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(req: NextRequest) {
  try {
    // Check auth - dashboard session only
    const hasSession = req.cookies.get('sb-auth-token');
    if (!hasSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
    }

    const { name, allowed_tags } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Generate token: 36 random bytes in hex = avt_ prefix (4 chars) + 36 hex chars = 40 total
    const randomBytes = crypto.randomBytes(18).toString('hex');
    const token = `avt_${randomBytes}`;
    
    // Hash with bcrypt
    const token_hash = await bcrypt.hash(token, 10);
    const token_prefix = token.slice(0, 12); // "avt_" + first 8 chars

    // Insert token
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

    const tokenRecord = data?.[0];

    return NextResponse.json(
      {
        id: tokenRecord.id,
        name: tokenRecord.name,
        token_prefix: tokenRecord.token_prefix,
        allowed_tags: tokenRecord.allowed_tags,
        token: token, // Only returned once at creation
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('POST /api/tokens:', error);
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check auth - dashboard session only
    const hasSession = req.cookies.get('sb-auth-token');
    if (!hasSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
    }

    const { data, error } = await supabase
      .from('project_tokens')
      .select('id, name, token_prefix, allowed_tags, last_used, revoked, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ tokens: data || [] }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('GET /api/tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
