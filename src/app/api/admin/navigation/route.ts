import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DEFAULT_NAV_ITEMS } from '@/lib/navigation/navigation-context';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, items: DEFAULT_NAV_ITEMS });
    }

    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, items: DEFAULT_NAV_ITEMS });
    }

    const formatted = data.map((item) => ({
      id: item.id,
      location: item.location,
      title: item.title,
      url: item.url,
      icon: item.icon,
      target: item.target,
      parentId: item.parent_id,
      orderIndex: item.order_index,
      allowedRoles: item.allowed_roles || ['all'],
      isEnabled: item.is_enabled,
    }));

    return NextResponse.json({ success: true, items: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: true, items: DEFAULT_NAV_ITEMS });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;
    const supabase = await createServerSupabaseClient();

    if (supabase && Array.isArray(items)) {
      const rows = items.map((item: any) => ({
        id: item.id.includes('-') && item.id.length === 36 ? item.id : undefined,
        location: item.location,
        title: item.title,
        url: item.url,
        icon: item.icon || null,
        target: item.target || '_self',
        parent_id: item.parentId || null,
        order_index: item.orderIndex || 0,
        allowed_roles: item.allowedRoles || ['all'],
        is_enabled: item.isEnabled !== false,
      })).filter((r) => r.id);

      if (rows.length > 0) {
        await supabase.from('navigation_items').upsert(rows);
      }
    }

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
