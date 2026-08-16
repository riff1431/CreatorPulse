import { NextResponse } from 'next/server';
import { updatePromotion, deletePromotion } from '@/lib/promotions/promotions-service';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updatePromotion(id, body);
    return NextResponse.json({
      success: true,
      promotion: updated,
      message: `Promotion "${updated.code}" updated successfully.`,
    });
  } catch (err: any) {
    console.error('[Promotions Update API] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update promotion' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deletePromotion(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Promotion not found or could not be deleted.' },
        { status: 444 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promotion deleted successfully.',
    });
  } catch (err: any) {
    console.error('[Promotions Delete API] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete promotion' },
      { status: 500 }
    );
  }
}
