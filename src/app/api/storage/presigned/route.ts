import { NextRequest, NextResponse } from 'next/server';
import { StorageDriverManager } from '@/lib/storage/driver-manager';
import { StorageCategoryFolder, StorageDriverType, STORAGE_FOLDERS } from '@/lib/storage/storage-types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      filename,
      folder = 'documents',
      mimeType = 'application/octet-stream',
      isPrivate = false,
      driver,
    } = body;

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Missing "filename" in presigned URL request' },
        { status: 400 }
      );
    }

    const validatedFolder: StorageCategoryFolder = STORAGE_FOLDERS.includes(folder as StorageCategoryFolder)
      ? (folder as StorageCategoryFolder)
      : 'documents';

    const manager = StorageDriverManager.getInstance();
    const result = await manager.getPresignedUploadUrl(
      filename,
      validatedFolder,
      mimeType,
      Boolean(isPrivate),
      driver as StorageDriverType | undefined
    );

    return NextResponse.json({
      success: true,
      ...result,
      expiresInSeconds: 900,
    });
  } catch (error: any) {
    console.error('Presigned upload generation failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate presigned upload URL' },
      { status: 500 }
    );
  }
}
