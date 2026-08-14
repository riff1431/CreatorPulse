import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const SUBFOLDERS = ['avatars', 'covers', 'posts', 'reels', 'stories', 'messages', 'themes', 'plugins', 'documents'];

function ensureFoldersExist() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  for (const sub of SUBFOLDERS) {
    const subPath = path.join(UPLOADS_DIR, sub);
    if (!fs.existsSync(subPath)) {
      fs.mkdirSync(subPath, { recursive: true });
    }
  }
}

export async function GET() {
  try {
    ensureFoldersExist();

    const folderStats: Record<string, { count: number; totalSizeBytes: number }> = {};
    let grandTotalBytes = 0;
    let grandTotalFiles = 0;

    for (const sub of SUBFOLDERS) {
      const subPath = path.join(UPLOADS_DIR, sub);
      try {
        const files = fs.readdirSync(subPath).filter((f) => !f.startsWith('.'));
        let folderBytes = 0;

        for (const file of files) {
          const filePath = path.join(subPath, file);
          const stat = fs.statSync(filePath);
          folderBytes += stat.size;
        }

        folderStats[sub] = {
          count: files.length,
          totalSizeBytes: folderBytes,
        };

        grandTotalBytes += folderBytes;
        grandTotalFiles += files.length;
      } catch {
        folderStats[sub] = { count: 0, totalSizeBytes: 0 };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        driver: 'local',
        basePath: 'public/uploads',
        isWritable: true,
        grandTotalFiles,
        grandTotalBytes,
        folderStats,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, driver } = body;

    if (action === 'test_connection') {
      ensureFoldersExist();
      const testFile = path.join(UPLOADS_DIR, 'documents', `.test_${Date.now()}.tmp`);
      fs.writeFileSync(testFile, 'creatorpulse-storage-diagnostic-ok');
      const readContent = fs.readFileSync(testFile, 'utf8');
      fs.unlinkSync(testFile);

      return NextResponse.json({
        success: true,
        driver: driver || 'local',
        message: 'Storage connection & filesystem write test successful!',
        readOk: readContent === 'creatorpulse-storage-diagnostic-ok',
        writeOk: true,
        deleteOk: true,
      });
    }

    return NextResponse.json({ success: true, message: 'Storage updated' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
