import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt } from '@/lib/crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const encryptionKey = process.env.VAULT_ENCRYPTION_KEY;
  if (!encryptionKey) {
    return NextResponse.json(
      { error: 'Encryption key not configured' },
      { status: 500 }
    );
  }

  try {
    const id = (await Promise.resolve(params)).id;
    const { new_value } = await req.json();

    if (!new_value) {
      return NextResponse.json(
        { error: 'new_value is required' },
        { status: 400 }
      );
    }

    // Get current secret
    const { data: current, error: getError } = await supabase
      .from('secrets')
      .select('encrypted_value, iv')
      .eq('id', id)
      .single();

    if (getError || !current) {
      return NextResponse.json(
        { error: 'Secret not found' },
        { status: 404 }
      );
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

    return NextResponse.json({ secret: data?.[0] });
  } catch (error) {
    console.error('POST /api/secrets/[id]/rotate:', error);
    return NextResponse.json(
      { error: 'Failed to rotate secret' },
      { status: 500 }
    );
  }
}
