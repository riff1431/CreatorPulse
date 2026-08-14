import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const METADATA_PATH = path.join(UPLOADS_DIR, 'metadata.json');
const ALLOWED_FOLDERS = ['avatars', 'covers', 'posts', 'reels', 'stories', 'messages', 'themes', 'plugins', 'documents'];

const MOCK_INITIAL_FILES = [
  {
    id: 'file-1',
    name: 'avatar-elena.jpg',
    originalName: 'elena_profile.jpg',
    folder: 'avatars',
    driver: 'local',
    path: 'avatars/avatar-elena.jpg',
    url: '/uploads/avatars/avatar-elena.jpg',
    sizeBytes: 245760,
    mimeType: 'image/jpeg',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    uploadedBy: { id: 'admin-1', name: 'Elena Rostova', username: 'elena', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    isLinked: true
  },
  {
    id: 'file-2',
    name: 'cover-sarah-gradient.webp',
    originalName: 'banner_header.webp',
    folder: 'covers',
    driver: 'local',
    path: 'covers/cover-sarah-gradient.webp',
    url: '/uploads/covers/cover-sarah-gradient.webp',
    sizeBytes: 1048576,
    mimeType: 'image/webp',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    uploadedBy: { id: 'admin-2', name: 'Sarah Jenkins', username: 'sarahdesign', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    isLinked: true
  },
  {
    id: 'file-3',
    name: 'post-ui-figma-mastery.png',
    originalName: 'figma_preview.png',
    folder: 'posts',
    driver: 'local',
    path: 'posts/post-ui-figma-mastery.png',
    url: '/uploads/posts/post-ui-figma-mastery.png',
    sizeBytes: 3145728,
    mimeType: 'image/png',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    uploadedBy: { id: 'admin-2', name: 'Sarah Jenkins', username: 'sarahdesign', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    isLinked: false
  }
];

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function loadLocalMetadata() {
  ensureDirectoryExists(UPLOADS_DIR);
  if (!fs.existsSync(METADATA_PATH)) {
    fs.writeFileSync(METADATA_PATH, JSON.stringify(MOCK_INITIAL_FILES, null, 2));
    return MOCK_INITIAL_FILES;
  }
  try {
    const data = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
    if (!Array.isArray(data)) {
      return MOCK_INITIAL_FILES;
    }
    return data;
  } catch {
    return MOCK_INITIAL_FILES;
  }
}

function saveLocalMetadata(data: any[]) {
  ensureDirectoryExists(UPLOADS_DIR);
  fs.writeFileSync(METADATA_PATH, JSON.stringify(data, null, 2));
}

// Scans physical directory recursively and synchronizes metadata
function syncPhysicalAndMetadata() {
  const metadata = loadLocalMetadata();
  const physicalFiles: { name: string; folder: string; sizeBytes: number; path: string }[] = [];

  for (const folder of ALLOWED_FOLDERS) {
    const folderPath = path.join(UPLOADS_DIR, folder);
    ensureDirectoryExists(folderPath);

    const files = fs.readdirSync(folderPath).filter((f) => !f.startsWith('.'));
    for (const f of files) {
      const filePath = path.join(folderPath, f);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        physicalFiles.push({
          name: f,
          folder,
          sizeBytes: stat.size,
          path: `${folder}/${f}`
        });
      }
    }
  }

  // Filter out metadata entries whose physical files are missing (unless they are mock images with remote URLs)
  let updatedMeta = metadata.filter((m) => {
    if (m.driver !== 'local') return true;
    if (m.url.startsWith('http') || m.url.startsWith('https://')) return true; // mock assets
    return physicalFiles.some((pf) => pf.path === m.path);
  });

  // Add metadata entries for physical files that aren't logged
  for (const pf of physicalFiles) {
    const exists = updatedMeta.some((m) => m.path === pf.path);
    if (!exists) {
      const mimeMap: Record<string, string> = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        mp4: 'video/mp4',
        zip: 'application/zip',
        pdf: 'application/pdf'
      };
      const ext = pf.name.split('.').pop()?.toLowerCase() || '';
      const mimeType = mimeMap[ext] || 'application/octet-stream';

      updatedMeta.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: pf.name,
        originalName: pf.name,
        folder: pf.folder,
        driver: 'local',
        path: pf.path,
        url: `/uploads/${pf.path}`,
        sizeBytes: pf.sizeBytes,
        mimeType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedBy: { id: 'system', name: 'System Admin', username: 'admin', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
        isLinked: false
      });
    }
  }

  saveLocalMetadata(updatedMeta);
  return updatedMeta;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const driver = searchParams.get('driver') || 'local';

    const supabase = await createServerSupabaseClient();

    if (driver === 'supabase' && supabase) {
      // Fetch from Supabase Table
      const { data: dbAssets, error: dbError } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) {
        console.warn('Failed to query media_assets table, attempting storage list fallback:', dbError.message);
      } else if (dbAssets) {
        const formatted = dbAssets.map((asset: any) => ({
          id: asset.id,
          name: asset.filename,
          originalName: asset.original_name,
          folder: asset.folder,
          driver: 'supabase',
          path: asset.path,
          url: asset.url,
          sizeBytes: Number(asset.size_bytes),
          mimeType: asset.mime_type,
          createdAt: asset.created_at,
          updatedAt: asset.updated_at,
          uploadedBy: { id: asset.uploaded_by || 'system', name: 'System Admin', username: 'admin', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
          isLinked: asset.is_linked,
          linkedEntity: asset.is_linked ? {
            type: asset.linked_entity_type,
            id: asset.linked_entity_id,
            title: asset.linked_entity_title
          } : undefined
        }));
        return NextResponse.json({ success: true, files: formatted });
      }

      // Fallback: list from storage buckets
      try {
        const allFiles: any[] = [];
        const bucketName = 'creatorpulse-media';

        for (const folder of ALLOWED_FOLDERS) {
          const { data, error } = await supabase.storage.from(bucketName).list(folder);
          if (!error && data) {
            data.forEach((obj: any) => {
              if (obj.name !== '.emptyFolderPlaceholder') {
                const filePath = `${folder}/${obj.name}`;
                const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

                allFiles.push({
                  id: obj.id || `sup_${folder}_${obj.name}`,
                  name: obj.name,
                  originalName: obj.name,
                  folder,
                  driver: 'supabase',
                  path: filePath,
                  url: publicUrlData.publicUrl,
                  sizeBytes: obj.metadata?.size || 0,
                  mimeType: obj.metadata?.mimetype || 'application/octet-stream',
                  createdAt: obj.created_at || new Date().toISOString(),
                  updatedAt: obj.updated_at || new Date().toISOString(),
                  uploadedBy: { id: 'system', name: 'System Admin', username: 'admin', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
                  isLinked: false
                });
              }
            });
          }
        }
        return NextResponse.json({ success: true, files: allFiles });
      } catch (listErr) {
        console.error('Supabase Storage listing failed completely:', listErr);
      }
    }

    // Default: Local Storage Driver (Self-healing Filesystem scan)
    const localFiles = syncPhysicalAndMetadata();
    return NextResponse.json({ success: true, files: localFiles });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json({ success: false, error: 'No IDs provided for deletion' }, { status: 400 });
    }

    const ids = idsParam.split(',');
    const supabase = await createServerSupabaseClient();

    // 1. Delete from Supabase
    if (supabase) {
      // Find files to retrieve their paths in the bucket
      const { data: assets } = await supabase
        .from('media_assets')
        .select('id, path, driver')
        .in('id', ids);

      if (assets && assets.length > 0) {
        const bucketName = 'creatorpulse-media';
        const supabasePaths = assets
          .filter((a) => a.driver === 'supabase')
          .map((a) => a.path);

        if (supabasePaths.length > 0) {
          const { error: storageErr } = await supabase.storage
            .from(bucketName)
            .remove(supabasePaths);
          if (storageErr) console.error('Supabase bucket delete failed:', storageErr.message);
        }

        // Delete database rows
        const { error: dbErr } = await supabase
          .from('media_assets')
          .delete()
          .in('id', ids);
        if (dbErr) console.error('Supabase DB delete failed:', dbErr.message);
      }
    }

    // 2. Delete from Local Filesystem
    const localMeta = loadLocalMetadata();
    const itemsToDelete = localMeta.filter((m) => ids.includes(m.id));

    for (const item of itemsToDelete) {
      if (item.driver === 'local') {
        const physicalPath = path.join(UPLOADS_DIR, item.path);
        try {
          if (fs.existsSync(physicalPath)) {
            fs.unlinkSync(physicalPath);
          }
        } catch (e) {
          console.error(`Failed to delete physical file: ${physicalPath}`, e);
        }
      }
    }

    // Save updated local metadata
    const updatedMeta = localMeta.filter((m) => !ids.includes(m.id));
    saveLocalMetadata(updatedMeta);

    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST endpoint for Rename and Move actions
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, newName, newFolder } = body;

    if (!id || !newName) {
      return NextResponse.json({ success: false, error: 'Missing required parameters (id, newName)' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // 1. Rename in Supabase
    if (supabase) {
      const { data: asset } = await supabase
        .from('media_assets')
        .select('*')
        .eq('id', id)
        .single();

      if (asset && asset.driver === 'supabase') {
        const bucketName = 'creatorpulse-media';
        const folder = newFolder || asset.folder;
        const newPath = `${folder}/${folder}_${Date.now()}_${newName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Move the file in the bucket
        const { error: moveErr } = await supabase.storage
          .from(bucketName)
          .move(asset.path, newPath);

        if (moveErr) {
          throw new Error(`Failed to move file in bucket: ${moveErr.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(newPath);

        // Update database table row
        const { error: updateErr } = await supabase
          .from('media_assets')
          .update({
            filename: newName,
            folder,
            path: newPath,
            url: publicUrlData.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (updateErr) {
          throw new Error(`Failed to update DB metadata: ${updateErr.message}`);
        }

        return NextResponse.json({ success: true });
      }
    }

    // 2. Rename on Local Filesystem
    const localMeta = loadLocalMetadata();
    const itemIdx = localMeta.findIndex((m) => m.id === id);

    if (itemIdx === -1) {
      return NextResponse.json({ success: false, error: 'File metadata not found' }, { status: 404 });
    }

    const item = localMeta[itemIdx];
    if (item.driver === 'local') {
      const targetFolder = newFolder || item.folder;
      const sanitizedName = newName.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      const oldPhysicalPath = path.join(UPLOADS_DIR, item.path);
      const newPath = `${targetFolder}/${sanitizedName}`;
      const newPhysicalPath = path.join(UPLOADS_DIR, newPath);

      // Verify folders exist
      ensureDirectoryExists(path.join(UPLOADS_DIR, targetFolder));

      try {
        if (fs.existsSync(oldPhysicalPath)) {
          fs.renameSync(oldPhysicalPath, newPhysicalPath);
        }
      } catch (err) {
        throw new Error(`Failed to rename file on disk: ${err instanceof Error ? err.message : String(err)}`);
      }

      // Update metadata entry
      localMeta[itemIdx] = {
        ...item,
        name: sanitizedName,
        folder: targetFolder,
        path: newPath,
        url: `/uploads/${newPath}`,
        updatedAt: new Date().toISOString()
      };

      saveLocalMetadata(localMeta);
      return NextResponse.json({ success: true, file: localMeta[itemIdx] });
    }

    return NextResponse.json({ success: false, error: 'Renaming not supported for this driver configuration' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
