import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const METADATA_PATH = path.join(UPLOADS_DIR, 'metadata.json');
const ALLOWED_FOLDERS = ['avatars', 'covers', 'posts', 'reels', 'stories', 'messages', 'themes', 'plugins', 'documents'];

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function loadLocalMetadata() {
  ensureDirectoryExists(UPLOADS_DIR);
  if (!fs.existsSync(METADATA_PATH)) {
    fs.writeFileSync(METADATA_PATH, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function saveLocalMetadata(data: any[]) {
  ensureDirectoryExists(UPLOADS_DIR);
  fs.writeFileSync(METADATA_PATH, JSON.stringify(data, null, 2));
}

// Function to resolve current uploader info from session
async function getUploaderInfo(supabase: any) {
  const defaultUser = {
    id: 'system-admin-id',
    name: 'System Admin',
    username: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  };

  if (!supabase) return defaultUser;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return defaultUser;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', user.id)
      .single();

    if (profile) {
      return {
        id: profile.id,
        name: profile.full_name,
        username: profile.username,
        avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      };
    }
  } catch (e) {
    console.error('Error fetching uploader profile', e);
  }

  return defaultUser;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'documents';
    const clientDriver = (formData.get('driver') as string) || 'local';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided in request' }, { status: 400 });
    }

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ success: false, error: `Invalid folder category "${folder}"` }, { status: 400 });
    }

    // Initialize Supabase if configured
    const supabase = await createServerSupabaseClient();
    const uploader = await getUploaderInfo(supabase);

    const timestamp = Date.now();
    const cleanFileName = `${folder}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let publicUrl = '';
    const filePath = `${folder}/${cleanFileName}`;

    if (clientDriver === 'supabase' && supabase) {
      // 1. Upload to Supabase Storage Bucket
      const bucketName = 'creatorpulse-media';
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw new Error(`Supabase Storage upload error: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      publicUrl = publicUrlData.publicUrl;

      // 2. Track in media_assets database table
      try {
        const { error: dbError } = await supabase.from('media_assets').insert({
          filename: cleanFileName,
          original_name: file.name,
          folder,
          driver: 'supabase',
          path: filePath,
          url: publicUrl,
          size_bytes: file.size,
          mime_type: file.type || 'application/octet-stream',
          uploaded_by: uploader.id,
          is_linked: false
        });

        if (dbError) {
          console.warn('DB Tracking insert failed, storing metadata locally:', dbError.message);
        }
      } catch (dbErr) {
        console.error('Failed to insert into media_assets table', dbErr);
      }
    } else {
      // Local storage driver fallback
      const targetDir = path.join(UPLOADS_DIR, folder);
      ensureDirectoryExists(targetDir);

      const targetPath = path.join(targetDir, cleanFileName);
      fs.writeFileSync(targetPath, buffer);

      publicUrl = `/uploads/${folder}/${cleanFileName}`;

      // Update local metadata.json
      const localMetadata = loadLocalMetadata();
      const newMeta = {
        id: `file_${timestamp}_${Math.random().toString(36).substr(2, 6)}`,
        name: cleanFileName,
        originalName: file.name,
        folder,
        driver: 'local',
        path: filePath,
        url: publicUrl,
        sizeBytes: file.size,
        mimeType: file.type || 'application/octet-stream',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedBy: uploader,
        isLinked: false
      };
      localMetadata.unshift(newMeta);
      saveLocalMetadata(localMetadata);
    }

    return NextResponse.json({
      success: true,
      file: {
        id: `file_${timestamp}`,
        name: cleanFileName,
        originalName: file.name,
        folder,
        driver: clientDriver,
        path: filePath,
        url: publicUrl,
        sizeBytes: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedBy: uploader,
        createdAt: new Date().toISOString(),
        isLinked: false
      }
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
