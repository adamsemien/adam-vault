import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get total secret count
    const { data: secrets, error: secretsError } = await supabase
      .from('secrets')
      .select('id, name, needs_rotation, last_rotated', { count: 'exact' });

    if (secretsError) throw secretsError;

    const key_count = secrets?.length || 0;

    // Get secrets that need rotation
    const needsRotation = secrets
      ?.filter((s) => s.needs_rotation)
      ?.map((s) => s.name) || [];

    // Get last rotated timestamps
    const lastRotated: Record<string, string> = {};
    secrets?.forEach((secret) => {
      if (secret.last_rotated) {
        lastRotated[secret.name] = secret.last_rotated;
      }
    });

    return NextResponse.json({
      status: 'ok',
      key_count,
      needs_rotation: needsRotation,
      last_rotated: lastRotated,
    });
  } catch (error) {
    console.error('GET /api/health:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch health status' },
      { status: 500 }
    );
  }
}
