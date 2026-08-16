import { NextRequest, NextResponse } from 'next/server';
import { StorageDriverManager } from '@/lib/storage/driver-manager';
import { StorageCategoryFolder, StorageDriverType, STORAGE_FOLDERS } from '@/lib/storage/storage-types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawFolder = (formData.get('folder') as string) || 'documents';
    const preferredDriver = (formData.get('driver') as string) as StorageDriverType | undefined;
    const isPrivate = formData.get('isPrivate') === 'true' || formData.get('isPrivate') === '1';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided in request' }, { status: 400 });
    }

    const folder: StorageCategoryFolder = STORAGE_FOLDERS.includes(rawFolder as StorageCategoryFolder)
      ? (rawFolder as StorageCategoryFolder)
      : 'documents';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/octet-stream';

    const manager = StorageDriverManager.getInstance();
    const { file: storedFile, driver, fallbackUsed } = await manager.upload(
      buffer,
      file.name,
      folder,
      mimeType,
      preferredDriver,
      isPrivate
    );

    return NextResponse.json({
      success: true,
      file: storedFile,
      driver,
      fallbackUsed: Boolean(fallbackUsed),
    });
  } catch (error: any) {
    console.error('Storage upload API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
