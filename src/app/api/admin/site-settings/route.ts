import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DEFAULT_SITE_SETTINGS } from '@/lib/settings/site-settings-context';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, settings: DEFAULT_SITE_SETTINGS });
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: true, settings: DEFAULT_SITE_SETTINGS });
    }

    return NextResponse.json({
      success: true,
      settings: {
        site_name: data.site_name,
        tagline: data.tagline,
        logo_url: data.logo_url,
        favicon_url: data.favicon_url,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        contact_address: data.contact_address,
        copyright_text: data.copyright_text,
        social_links: data.social_links || DEFAULT_SITE_SETTINGS.social_links,
        seo_defaults: data.seo_defaults || DEFAULT_SITE_SETTINGS.seo_defaults,
        maintenance_mode: data.maintenance_mode,
        maintenance_title: data.maintenance_title,
        maintenance_message: data.maintenance_message,
        registration_mode: data.registration_mode,
        default_user_role: data.default_user_role,
        require_email_verification: data.require_email_verification,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, settings: DEFAULT_SITE_SETTINGS });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createServerSupabaseClient();

    if (supabase) {
      const { error } = await supabase.from('site_settings').upsert({
        id: 1,
        site_name: body.site_name,
        tagline: body.tagline,
        logo_url: body.logo_url,
        favicon_url: body.favicon_url,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        contact_address: body.contact_address,
        copyright_text: body.copyright_text,
        social_links: body.social_links,
        seo_defaults: body.seo_defaults,
        maintenance_mode: body.maintenance_mode,
        maintenance_title: body.maintenance_title,
        maintenance_message: body.maintenance_message,
        registration_mode: body.registration_mode,
        default_user_role: body.default_user_role,
        require_email_verification: body.require_email_verification,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Supabase site settings update error:', error);
      }
    }

    return NextResponse.json({ success: true, settings: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
