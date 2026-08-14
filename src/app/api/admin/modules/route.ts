import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { INITIAL_FEATURE_MODULES } from '@/lib/modules/feature-module-context';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, modules: INITIAL_FEATURE_MODULES });
    }

    const { data, error } = await supabase.from('feature_modules').select('*');

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, modules: INITIAL_FEATURE_MODULES });
    }

    const formatted = data.map((m) => {
      const matchInitial = INITIAL_FEATURE_MODULES.find((i) => i.id === m.id);
      return {
        id: m.id,
        name: m.name || (matchInitial ? matchInitial.name : m.id),
        description: m.description || (matchInitial ? matchInitial.description : ''),
        isEnabled: m.is_enabled,
        dependencies: m.dependencies || (matchInitial ? matchInitial.dependencies : []),
        settings: m.settings || (matchInitial ? matchInitial.settings : {}),
        icon: matchInitial ? matchInitial.icon : 'Puzzle',
      };
    });

    return NextResponse.json({ success: true, modules: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: true, modules: INITIAL_FEATURE_MODULES });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { modules } = body;
    const supabase = await createServerSupabaseClient();

    if (supabase && Array.isArray(modules)) {
      const rows = modules.map((m: any) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        is_enabled: m.isEnabled,
        dependencies: m.dependencies || [],
        settings: m.settings || {},
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('feature_modules').upsert(rows);
    }

    return NextResponse.json({ success: true, modules });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
