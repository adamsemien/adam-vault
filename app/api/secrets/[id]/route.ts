import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/crypto';

export async function GET(
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
    
    const { data, error } = await supabase
      .from('secrets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Secret not found' }, { status: 404 });

    const decrypted_value = decrypt(data.encrypted_value, data.iv, encryptionKey);

    return NextResponse.json({
      secret: {
        ...data,
        decrypted_value,
      },
    });
  } catch (error) {
    console.error('GET /api/secrets/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch secret' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = (await Promise.resolve(params)).id;
    
    const { error } = await supabase
      .from('secrets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/secrets/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete secret' },
      { status: 500 }
    );
  }
}
