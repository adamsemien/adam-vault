import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check auth
    const auth = await requireAuth(req);
    if (!auth.isSession && !auth.isToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Write audit log
    await supabase.from('audit_log').insert({
      secret_id: id,
      action: 'viewed',
      token_name: auth.tokenName || null,
    });

    return NextResponse.json({ logged: true });
  } catch (error) {
    console.error('POST /api/secrets/[id]/log-view:', error);
    return NextResponse.json(
      { error: 'Failed to log view' },
      { status: 500 }
    );
  }
}
