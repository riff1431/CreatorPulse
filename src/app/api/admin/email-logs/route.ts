import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DEMO_LOGS_EXPORT } from '@/lib/email/delivery-log-store';

// GET — paginated delivery logs with optional filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
    const status = searchParams.get('status') ?? 'all';
    const providerId = searchParams.get('providerId') ?? 'all';
    const search = searchParams.get('search') ?? '';

    const supabase = await createServerSupabaseClient();

    if (supabase) {
      let query = supabase
        .from('email_delivery_logs')
        .select('*', { count: 'exact' })
        .order('sent_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (status !== 'all') query = query.eq('status', status);
      if (providerId !== 'all') query = query.eq('provider_id', providerId);
      if (search) {
        query = query.or(
          `recipient_email.ilike.%${search}%,subject.ilike.%${search}%,template_slug.ilike.%${search}%`
        );
      }

      const { data, error, count } = await query;

      if (!error && data) {
        return NextResponse.json({
          success: true,
          logs: data,
          total: count ?? 0,
          page,
          pageSize,
        });
      }
    }

    // Fallback: return demo logs
    return NextResponse.json({
      success: true,
      logs: DEMO_LOGS_EXPORT,
      total: DEMO_LOGS_EXPORT.length,
      page: 1,
      pageSize: 20,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
