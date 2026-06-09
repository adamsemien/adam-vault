import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  const encryptionKey = process.env.VAULT_ENCRYPTION_KEY;
  if (!encryptionKey) {
    return NextResponse.json(
      { error: 'Encryption key not configured' },
      { status: 500 }
    );
  }

  try {
    const { name, service, value, description, project_tags } = await req.json();

    if (!name || !service || !value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { ciphertext, iv } = encrypt(value, encryptionKey);

    const { data, error } = await supabase
      .from('secrets')
      .insert({
        name,
        service,
        encrypted_value: ciphertext,
        iv,
        description: description || null,
        project_tags: project_tags || [],
        needs_rotation: false,
        last_rotated: null,
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ secret: data?.[0] }, { status: 201 });
  } catch (error) {
    console.error('POST /api/secrets:', error);
    return NextResponse.json(
      { error: 'Failed to create secret' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ secrets: data || [] });
  } catch (error) {
    console.error('GET /api/secrets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch secrets' },
      { status: 500 }
    );
  }
}
