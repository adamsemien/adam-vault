import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = (await Promise.resolve(params)).id;

    // Check auth - dashboard session only
    const hasSession = req.cookies.get('sb-auth-token');
    if (!hasSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Soft delete - set revoked=true
    const { error } = await supabase
      .from('project_tokens')
      .update({ revoked: true })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ revoked: true });
  } catch (error) {
    console.error('DELETE /api/tokens/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to revoke token' },
      { status: 500 }
    );
  }
}
