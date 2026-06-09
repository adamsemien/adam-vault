import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CORS_HEADERS, corsOptions } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
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

    // Soft delete - set revoked=true
    const { error } = await supabase
      .from('project_tokens')
      .update({ revoked: true })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ revoked: true }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('DELETE /api/tokens/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to revoke token' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
