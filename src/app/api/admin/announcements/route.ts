import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { INITIAL_ANNOUNCEMENTS, INITIAL_TEMPLATES } from '@/lib/notifications/announcement-context';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        announcements: INITIAL_ANNOUNCEMENTS,
        templates: INITIAL_TEMPLATES,
      });
    }

    const { data: ancData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    const { data: tplData } = await supabase.from('notification_templates').select('*');

    const announcements = ancData && ancData.length > 0 ? ancData.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      targetRole: a.target_role,
      placement: a.placement,
      status: a.status,
      publishedAt: a.published_at,
      expiresAt: a.expires_at,
      ctaText: a.cta_text,
      ctaLink: a.cta_link,
      isDismissible: a.is_dismissible,
      createdAt: a.created_at,
    })) : INITIAL_ANNOUNCEMENTS;

    const templates = tplData && tplData.length > 0 ? tplData.map((t) => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      body: t.body,
      variables: t.variables,
      isEnabled: t.is_enabled,
    })) : INITIAL_TEMPLATES;

    return NextResponse.json({ success: true, announcements, templates });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      announcements: INITIAL_ANNOUNCEMENTS,
      templates: INITIAL_TEMPLATES,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { announcements, templates } = body;
    const supabase = await createServerSupabaseClient();

    if (supabase) {
      if (Array.isArray(announcements)) {
        const rows = announcements.map((a: any) => ({
          id: a.id.includes('-') && a.id.length === 36 ? a.id : undefined,
          title: a.title,
          content: a.content,
          target_role: a.targetRole,
          placement: a.placement,
          status: a.status,
          published_at: a.publishedAt,
          expires_at: a.expiresAt,
          cta_text: a.ctaText,
          cta_link: a.ctaLink,
          is_dismissible: a.isDismissible,
        })).filter((r) => r.id);

        if (rows.length > 0) {
          await supabase.from('announcements').upsert(rows);
        }
      }

      if (Array.isArray(templates)) {
        const tplRows = templates.map((t: any) => ({
          id: t.id,
          name: t.name,
          subject: t.subject,
          body: t.body,
          variables: t.variables,
          is_enabled: t.isEnabled,
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('notification_templates').upsert(tplRows);
      }
    }

    return NextResponse.json({ success: true, announcements, templates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
