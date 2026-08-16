import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SmtpProvider, DEFAULT_SMTP_PROVIDERS } from '@/lib/email/smtp-store';

// GET — list all SMTP providers (passwords masked)
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      const masked = DEFAULT_SMTP_PROVIDERS.map(maskPassword);
      return NextResponse.json({ success: true, providers: masked });
    }

    const { data, error } = await supabase
      .from('smtp_providers')
      .select('*')
      .order('priority', { ascending: true });

    if (error || !data) {
      return NextResponse.json({ success: true, providers: DEFAULT_SMTP_PROVIDERS.map(maskPassword) });
    }

    const providers: SmtpProvider[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      provider: row.provider,
      host: row.host,
      port: row.port,
      encryption: row.encryption,
      username: row.username,
      password: maskPasswordString(row.password),
      apiKey: maskPasswordString(row.api_key ?? ''),
      apiRegion: row.api_region ?? '',
      fromName: row.from_name,
      fromEmail: row.from_email,
      replyTo: row.reply_to ?? '',
      isActive: row.is_active,
      isFallback: row.is_fallback,
      priority: row.priority,
      lastTestedAt: row.last_tested_at,
      lastTestStatus: row.last_test_status,
      lastTestMessage: row.last_test_message,
      lastTestLatencyMs: row.last_test_latency_ms,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ success: true, providers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST — create a new SMTP provider
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createServerSupabaseClient();

    if (supabase) {
      const { data, error } = await supabase
        .from('smtp_providers')
        .insert({
          name: body.name,
          provider: body.provider,
          host: body.host,
          port: body.port,
          encryption: body.encryption,
          username: body.username,
          password: body.password,
          api_key: body.apiKey || null,
          api_region: body.apiRegion || null,
          from_name: body.fromName,
          from_email: body.fromEmail,
          reply_to: body.replyTo || null,
          is_active: body.isActive ?? false,
          is_fallback: body.isFallback ?? false,
          priority: body.priority ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, provider: data });
    }

    // Fallback: return echoed body
    return NextResponse.json({ success: true, provider: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT — update an existing SMTP provider
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing provider id' }, { status: 400 });

    const supabase = await createServerSupabaseClient();

    if (supabase) {
      const patch: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) patch.name = updates.name;
      if (updates.provider !== undefined) patch.provider = updates.provider;
      if (updates.host !== undefined) patch.host = updates.host;
      if (updates.port !== undefined) patch.port = updates.port;
      if (updates.encryption !== undefined) patch.encryption = updates.encryption;
      if (updates.username !== undefined) patch.username = updates.username;
      if (updates.password !== undefined && !isMasked(updates.password)) patch.password = updates.password;
      if (updates.apiKey !== undefined && !isMasked(updates.apiKey)) patch.api_key = updates.apiKey;
      if (updates.apiRegion !== undefined) patch.api_region = updates.apiRegion;
      if (updates.fromName !== undefined) patch.from_name = updates.fromName;
      if (updates.fromEmail !== undefined) patch.from_email = updates.fromEmail;
      if (updates.replyTo !== undefined) patch.reply_to = updates.replyTo || null;
      if (updates.isActive !== undefined) patch.is_active = updates.isActive;
      if (updates.isFallback !== undefined) patch.is_fallback = updates.isFallback;
      if (updates.priority !== undefined) patch.priority = updates.priority;

      const { error } = await supabase.from('smtp_providers').update(patch).eq('id', id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE — remove a provider
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('smtp_providers').delete().eq('id', id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function maskPasswordString(val: string): string {
  if (!val) return '';
  return '•'.repeat(Math.min(val.length, 16));
}

function isMasked(val: string): boolean {
  return val.startsWith('•');
}

function maskPassword(p: SmtpProvider): SmtpProvider {
  return {
    ...p,
    password: maskPasswordString(p.password),
    apiKey: maskPasswordString(p.apiKey),
  };
}
