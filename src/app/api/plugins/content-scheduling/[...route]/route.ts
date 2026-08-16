import { NextResponse } from 'next/server';
import { SchedulingService } from '@plugins/content-scheduling/services/scheduling-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { route } = await params;
    const subRoute = (route || []).join('/');

    if (subRoute === 'items') {
      const { searchParams } = new URL(request.url);
      const creatorId = searchParams.get('creatorId') || undefined;
      const status = searchParams.get('status') || undefined;
      const items = SchedulingService.getScheduledContent(creatorId, status);
      return NextResponse.json({ success: true, count: items.length, data: items });
    }

    if (subRoute === 'stats') {
      const stats = SchedulingService.getWorkerStatus();
      return NextResponse.json({ success: true, data: stats });
    }

    if (subRoute === 'logs') {
      const logs = SchedulingService.getLogs();
      return NextResponse.json({ success: true, count: logs.length, data: logs });
    }

    return NextResponse.json({
      success: true,
      message: `Content Scheduling plugin API gateway listening`,
      route: subRoute,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API /api/plugins/content-scheduling] GET Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'API request failed' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { route } = await params;
    const subRoute = (route || []).join('/');

    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    if (subRoute === 'items') {
      if (!body.content || !body.scheduledAt) {
        return NextResponse.json(
          { success: false, error: 'Required fields missing: content, scheduledAt' },
          { status: 400 }
        );
      }
      const newItem = SchedulingService.scheduleContent(body);
      return NextResponse.json({ success: true, data: newItem });
    }

    if (subRoute === 'cron') {
      const result = SchedulingService.runWorkerCronCheck();
      return NextResponse.json({
        success: true,
        message: 'Worker cron check completed successfully',
        result
      });
    }

    if (subRoute.endsWith('/publish-now')) {
      const id = subRoute.split('/')[1];
      const res = SchedulingService.forcePublishNow(id);
      return NextResponse.json(res);
    }

    if (subRoute.endsWith('/retry')) {
      const id = subRoute.split('/')[1];
      const res = SchedulingService.retryFailedJob(id);
      return NextResponse.json(res);
    }

    return NextResponse.json({
      success: true,
      message: `Processed POST request to /api/plugins/content-scheduling/${subRoute}`,
      receivedPayload: body
    });
  } catch (error: any) {
    console.error('[API /api/plugins/content-scheduling] POST Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'POST request failed' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { route } = await params;
    const subRoute = (route || []).join('/');

    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const id = subRoute.split('/')[1] || body.id;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
    }

    const updated = SchedulingService.updateScheduledContent(id, body);
    return NextResponse.json({ success: Boolean(updated), data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { route } = await params;
    const subRoute = (route || []).join('/');

    const id = subRoute.split('/')[1];
    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
    }

    const success = SchedulingService.deleteScheduledContent(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
