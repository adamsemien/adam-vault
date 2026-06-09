import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/crypto';
import { requireAuth, tagsMatch } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check auth
    const auth = await requireAuth(req);
    if (!auth.isSession && !auth.isToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const encryptionKey = process.env.VAULT_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return NextResponse.json(
        { error: 'Encryption key not configured' },
        { status: 500 }
      );
    }

    let query = supabase
      .from('secrets')
      .select('id, name, service, description, project_tags, needs_rotation, last_rotated')
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // If token-based, filter by allowed tags
    if (auth.isToken) {
      // Get token details to filter
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        
        const { data: tokenData } = await supabase
          .from('project_tokens')
          .select('allowed_tags')
          .eq('revoked', false);

        // Filter secrets where at least one tag matches
        const filtered = data?.filter((secret) => {
          if (!tokenData) return false;
          const allowedTags = tokenData[0]?.allowed_tags || [];
          return tagsMatch(allowedTags, secret.project_tags || []);
        });

        return NextResponse.json({ secrets: filtered || [] });
      }
    }

    return NextResponse.json({ secrets: data || [] });
  } catch (error) {
    console.error('GET /api/secrets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch secrets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check auth - dashboard session only
    const hasSession = req.cookies.get('sb-auth-token');
    if (!hasSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const encryptionKey = process.env.VAULT_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return NextResponse.json(
        { error: 'Encryption key not configured' },
        { status: 500 }
      );
    }

    const { name, service, value, description, project_tags } = await req.json();

    // Validation
    if (!name || !service || !value) {
      return NextResponse.json(
        { error: 'Missing required fields: name, service, value' },
        { status: 400 }
      );
    }

    if (!/^[A-Z_]+$/.test(name)) {
      return NextResponse.json(
        { error: 'Name must be uppercase with underscores only' },
        { status: 400 }
      );
    }

    // Encrypt value
    const { ciphertext, iv } = encrypt(value, encryptionKey);

    // Insert secret
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

    const secret = data?.[0];

    // Write audit log
    if (secret) {
      await supabase.from('audit_log').insert({
        secret_id: secret.id,
        action: 'created',
        token_name: null,
      });
    }

    return NextResponse.json(
      {
        id: secret.id,
        name: secret.name,
        service: secret.service,
        description: secret.description,
        project_tags: secret.project_tags,
        created_at: secret.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/secrets:', error);
    return NextResponse.json(
      { error: 'Failed to create secret' },
      { status: 500 }
    );
  }
}
