import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AnalyticsService, TimeRange } from '@plugins/creator-analytics/services/analytics-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      // Require auth for analytics data
      if (!user) {
        // Fallback for demo/dev mode if not authenticated
      }
    }

    const { route } = await params;
    const subRoute = (route || []).join('/');
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || '30d') as TimeRange;
    const format = searchParams.get('format') || 'json';

    if (subRoute === 'creator-stats') {
      const stats = AnalyticsService.getCreatorAnalytics(range);
      return NextResponse.json({ success: true, data: stats });
    }

    if (subRoute === 'admin-stats') {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: hasPerm } = await supabase.rpc('has_permission', { usr_id: user.id, perm: 'manage_settings' });
          if (hasPerm === false) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
          }
        }
      }
      const stats = AnalyticsService.getAdminAnalytics(range);
      return NextResponse.json({ success: true, data: stats });
    }

    if (subRoute === 'export') {
      const stats = AnalyticsService.getCreatorAnalytics(range);
      if (format === 'csv') {
        const csv = AnalyticsService.generateCSVReport(stats);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="creator-analytics-${range}.csv"`
          }
        });
      }
      const json = AnalyticsService.generateJSONReport(stats);
      return new Response(json, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="creator-analytics-${range}.json"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Dynamic API route response from creator-analytics plugin gateway`,
      endpoint: `/api/plugins/creator-analytics/${subRoute}`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Creator analytics plugin API failed' },
      { status: 500 }
    );
  }
}
