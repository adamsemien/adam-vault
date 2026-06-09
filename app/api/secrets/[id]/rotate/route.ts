import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt } from '@/lib/crypto';
import { CORS_HEADERS, corsOptions } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check auth - dashboard session only
    const hasSession = req.cookies.get('sb-auth-token');
    if (!hasSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
    }

    const encryptionKey = process.env.VAULT_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return NextResponse.json(
        { error: 'Encryption key not configured' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const { new_value } = await req.json();

    if (!new_value) {
      return NextResponse.json(
        { error: 'new_value is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Get current secret
    const { data: current, error: getError } = await supabase
      .from('secrets')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !current) {
      return NextResponse.json({ error: 'Secret not found' }, { status: 404, headers: CORS_HEADERS });
    }

    // Encrypt new value
    const { ciphertext, iv } = encrypt(new_value, encryptionKey);

    // Update secret, moving current to previous
    const { data, error } = await supabase
      .from('secrets')
      .update({
        previous_encrypted_value: current.encrypted_value,
        previous_iv: current.iv,
        encrypted_value: ciphertext,
        iv,
        needs_rotation: false,
        last_rotated: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    const rotated = data?.[0];

    // Write audit log
    await supabase.from('audit_log').insert({
      secret_id: id,
      action: 'rotated',
      token_name: null,
    });

    return NextResponse.json(
      {
        id: rotated.id,
        name: rotated.name,
        last_rotated: rotated.last_rotated,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('POST /api/secrets/[id]/rotate:', error);
    return NextResponse.json(
      { error: 'Failed to rotate secret' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
