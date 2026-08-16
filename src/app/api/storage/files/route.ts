import { NextRequest, NextResponse } from 'next/server';
import { StorageDriverManager } from '@/lib/storage/driver-manager';
import { StorageCategoryFolder, StorageDriverType, STORAGE_FOLDERS } from '@/lib/storage/storage-types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const driverParam = searchParams.get('driver') as StorageDriverType | null;
    const folderParam = searchParams.get('folder') as StorageCategoryFolder | 'all' | null;

    const manager = StorageDriverManager.getInstance();
    const folder = folderParam && folderParam !== 'all' && STORAGE_FOLDERS.includes(folderParam as StorageCategoryFolder)
      ? (folderParam as StorageCategoryFolder)
      : undefined;

    const files = await manager.listFiles(folder, driverParam || undefined);

    return NextResponse.json({
      success: true,
      files,
      count: files.length,
      driver: driverParam || manager.getConfig(false).activeDriver,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list files' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pathsParam = searchParams.get('paths') || searchParams.get('ids');
    const driverParam = searchParams.get('driver') as StorageDriverType | null;

    if (!pathsParam) {
      return NextResponse.json({ success: false, error: 'No paths/ids provided for deletion' }, { status: 400 });
    }

    const paths = pathsParam.split(',').map((p) => decodeURIComponent(p.trim()));
    const manager = StorageDriverManager.getInstance();

    const deleteResult = await manager.deleteMultipleFiles(paths, driverParam || undefined);

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.deleted,
      errors: deleteResult.errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Deletion failed' },
      { status: 500 }
    );
  }
}

// POST or PATCH for Move, Rename, and Copy
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'move', sourcePath, destinationPath, driver } = body;

    if (!sourcePath || !destinationPath) {
      return NextResponse.json(
        { success: false, error: 'Missing sourcePath or destinationPath' },
        { status: 400 }
      );
    }

    const manager = StorageDriverManager.getInstance();

    if (action === 'copy') {
      const result = await manager.copyFile(sourcePath, destinationPath, driver);
      return NextResponse.json({ success: true, result, message: 'File copied successfully' });
    }

    // Default: move / rename
    const result = await manager.moveFile(sourcePath, destinationPath, driver);
    return NextResponse.json({ success: true, result, message: 'File moved/renamed successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'File operation failed' },
      { status: 500 }
    );
  }
}
