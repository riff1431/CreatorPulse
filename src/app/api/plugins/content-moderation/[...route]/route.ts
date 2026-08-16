import { NextResponse } from 'next/server';
import { handleModerationRequest } from '@plugins/content-moderation/api/moderation-router';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { route } = await params;
    const subRoute = (route || []).join('/');
    return await handleModerationRequest(request, subRoute);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Content Moderation API GET error' },
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
    return await handleModerationRequest(request, subRoute);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Content Moderation API POST error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { route } = await params;
    const subRoute = (route || []).join('/');
    return await handleModerationRequest(request, subRoute);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Content Moderation API DELETE error' },
      { status: 500 }
    );
  }
}
