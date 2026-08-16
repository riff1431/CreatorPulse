import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DEFAULT_LANGUAGES, DEFAULT_ENGLISH_TRANSLATIONS, DEFAULT_SPANISH_TRANSLATIONS, DEFAULT_ARABIC_TRANSLATIONS } from '@/lib/i18n/i18n-defaults';

const DEFAULT_I18N_CONFIG = {
  defaultLocale: 'en',
  activeLocales: ['en', 'es', 'fr', 'ar'],
  languages: DEFAULT_LANGUAGES,
  translations: {
    en: DEFAULT_ENGLISH_TRANSLATIONS,
    es: DEFAULT_SPANISH_TRANSLATIONS,
    ar: DEFAULT_ARABIC_TRANSLATIONS,
  },
};

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, config: DEFAULT_I18N_CONFIG });
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('i18n_config')
      .eq('id', 1)
      .single();

    if (error || !data || !data.i18n_config) {
      return NextResponse.json({ success: true, config: DEFAULT_I18N_CONFIG });
    }

    return NextResponse.json({
      success: true,
      config: data.i18n_config,
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, config: DEFAULT_I18N_CONFIG });
  }
}

export async function PUT(req: Request) {
  try {
    const configData = await req.json();
    const supabase = await createServerSupabaseClient();

    if (supabase) {
      const { error } = await supabase.from('site_settings').upsert({
        id: 1,
        i18n_config: configData,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Supabase i18n_config update error:', error);
      }
    }

    return NextResponse.json({ success: true, config: configData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
