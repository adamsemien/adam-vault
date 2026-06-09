import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { CORS_HEADERS, corsOptions } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(req: NextRequest) {
  try {
    // Check auth
    const auth = await requireAuth(req);
    if (!auth.isSession && !auth.isToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
    }

    // Get last 50 audit log entries
    const { data, error } = await supabase
      .from('audit_log')
      .select('id, secret_id, action, token_name, timestamp, note')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ logs: data || [] }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('GET /api/audit-log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
