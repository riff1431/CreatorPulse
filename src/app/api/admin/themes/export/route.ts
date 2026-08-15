import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const THEMES_DIR = path.join(process.cwd(), 'themes');

/**
 * Helper to recursively add files from a directory into JSZip
 */
async function addDirectoryToZip(zip: JSZip, localFolderPath: string, zipRelativePath: string) {
  const entries = await fs.promises.readdir(localFolderPath, { withFileTypes: true });

  for (const entry of entries) {
    // Ignore macOS metadata and temp files
    if (entry.name === '.DS_Store' || entry.name === '__MACOSX' || entry.name.startsWith('._')) {
      continue;
    }

    const fullPath = path.join(localFolderPath, entry.name);
    const entryZipPath = zipRelativePath ? `${zipRelativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const folderZip = zip.folder(entry.name);
      if (folderZip) {
        await addDirectoryToZip(folderZip, fullPath, '');
      }
    } else if (entry.isFile()) {
      const fileBuffer = await fs.promises.readFile(fullPath);
      zip.file(entry.name, fileBuffer);
    }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get('slug') || searchParams.get('themeId');

    if (!rawSlug) {
      return NextResponse.json({ success: false, error: 'Theme slug or ID is required.' }, { status: 400 });
    }

    // Normalize slug (e.g. 'theme-default-theme' -> 'default-theme', 'theme-starter-theme' -> 'starter-theme')
    const folderCandidates = [
      rawSlug,
      rawSlug.replace(/^theme-/, ''),
      rawSlug === 'theme-starter-template' || rawSlug === 'starter-template' ? 'starter-theme' : rawSlug
    ];

    let targetFolderPath = '';
    let targetFolderName = '';

    for (const cand of folderCandidates) {
      const candidatePath = path.join(THEMES_DIR, cand);
      if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isDirectory()) {
        targetFolderPath = candidatePath;
        targetFolderName = cand;
        break;
      }
    }

    if (!targetFolderPath) {
      return NextResponse.json(
        { success: false, error: `Theme directory "${rawSlug}" not found on disk.` },
        { status: 404 }
      );
    }

    // Read manifest.json for metadata if available
    let version = '1.0.0';
    let themeSlug = targetFolderName;
    const manifestPath = path.join(targetFolderPath, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const raw = await fs.promises.readFile(manifestPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.version) version = parsed.version;
        if (parsed.slug) themeSlug = parsed.slug;
      } catch (e) {}
    }

    const zip = new JSZip();
    await addDirectoryToZip(zip, targetFolderPath, '');

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const fileName = `${themeSlug}-theme-v${version}.zip`;

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': zipBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error: any) {
    console.error('[API /api/admin/themes/export] Error exporting theme ZIP:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to export theme ZIP.' },
      { status: 500 }
    );
  }
}
