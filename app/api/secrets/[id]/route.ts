import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/crypto';
import { requireAuth, tagsMatch } from '@/lib/auth';
import { CORS_HEADERS, corsOptions } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check auth
    const auth = await requireAuth(req);
    if (!auth.isSession && !auth.isToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
    }

    const encryptionKey = process.env.VAULT_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return NextResponse.json(
        { error: 'Encryption key not configured' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    // Get secret
    const { data, error } = await supabase
      .from('secrets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Secret not found' }, { status: 404, headers: CORS_HEADERS });
    }

    // If token-based, check tag match
    if (auth.isToken) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        
        // Get token details
        const { data: tokenData } = await supabase
          .from('project_tokens')
          .select('allowed_tags')
          .eq('revoked', false)
          .single();

        if (!tokenData || !tagsMatch(tokenData.allowed_tags || [], data.project_tags || [])) {
          return NextResponse.json(
            { error: 'Forbidden: tag mismatch' },
            { status: 403, headers: CORS_HEADERS }
          );
        }
      }
    }

    // Decrypt value
    const value = decrypt(data.encrypted_value, data.iv, encryptionKey);

    // Write audit log
    await supabase.from('audit_log').insert({
      secret_id: id,
      action: 'viewed',
      token_name: auth.tokenName || null,
    });

    return NextResponse.json({
      id: data.id,
      name: data.name,
      service: data.service,
      value,
      description: data.description,
      project_tags: data.project_tags,
      last_rotated: data.last_rotated,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('GET /api/secrets/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch secret' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PUT(
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

    const body = await req.json();
    const { name, service, value, description, project_tags, needs_rotation } = body;

    // Get current secret
    const { data: current, error: getError } = await supabase
      .from('secrets')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !current) {
      return NextResponse.json({ error: 'Secret not found' }, { status: 404, headers: CORS_HEADERS });
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (service !== undefined) updates.service = service;
    if (description !== undefined) updates.description = description;
    if (project_tags !== undefined) updates.project_tags = project_tags;
    if (needs_rotation !== undefined) updates.needs_rotation = needs_rotation;

    // If value is being updated, encrypt it and store old value
    if (value !== undefined) {
      const { ciphertext, iv } = encrypt(value, encryptionKey);
      updates.previous_encrypted_value = current.encrypted_value;
      updates.previous_iv = current.iv;
      updates.encrypted_value = ciphertext;
      updates.iv = iv;
    }

    // Update secret
    const { data, error } = await supabase
      .from('secrets')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    const updated = data?.[0];

    // Write audit log
    await supabase.from('audit_log').insert({
      secret_id: id,
      action: 'updated',
      token_name: null,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      service: updated.service,
      description: updated.description,
      project_tags: updated.project_tags,
      needs_rotation: updated.needs_rotation,
      last_rotated: updated.last_rotated,
      updated_at: updated.updated_at,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('PUT /api/secrets/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update secret' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(
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

    // Write audit log BEFORE deleting (soft record)
    await supabase.from('audit_log').insert({
      secret_id: id,
      action: 'deleted',
      token_name: null,
    });

    // Hard delete secret (cascade deletes audit_log due to ON DELETE CASCADE)
    const { error } = await supabase
      .from('secrets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ deleted: true }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('DELETE /api/secrets/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete secret' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
