import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { INITIAL_CMS_PAGES } from '@/lib/cms/cms-context';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, pages: INITIAL_CMS_PAGES });
    }

    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, pages: INITIAL_CMS_PAGES });
    }

    const formatted = data.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      seoTitle: p.seo_title,
      seoDescription: p.seo_description,
      seoKeywords: p.seo_keywords,
      ogImage: p.og_image,
      sections: p.sections || [],
      publishedAt: p.published_at,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return NextResponse.json({ success: true, pages: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: true, pages: INITIAL_CMS_PAGES });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { pages } = body;
    const supabase = await createServerSupabaseClient();

    if (supabase && Array.isArray(pages)) {
      const rows = pages.map((p: any) => ({
        id: p.id.includes('-') && p.id.length === 36 ? p.id : undefined,
        title: p.title,
        slug: p.slug,
        status: p.status,
        seo_title: p.seoTitle,
        seo_description: p.seoDescription,
        seo_keywords: p.seoKeywords,
        og_image: p.ogImage,
        sections: p.sections || [],
        published_at: p.publishedAt,
        updated_at: new Date().toISOString(),
      })).filter((r) => r.id);

      if (rows.length > 0) {
        await supabase.from('cms_pages').upsert(rows);
      }
    }

    return NextResponse.json({ success: true, pages });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
