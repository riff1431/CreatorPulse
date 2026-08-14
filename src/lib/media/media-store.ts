export type MediaType = 'image' | 'video' | 'audio' | 'document';

export type MediaCategory = 'posts' | 'reels' | 'avatars' | 'covers' | 'attachments' | 'unused';

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  category: MediaCategory;
  mimeType: string;
  sizeBytes: number;
  dimensions?: string; // e.g. "1920x1080"
  durationSeconds?: number; // e.g. 45
  uploadedBy: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  uploadedAt: string;
  isLinked: boolean;
  linkedEntity?: {
    type: 'post' | 'reel' | 'profile_avatar' | 'profile_cover' | 'story';
    id: string;
    title: string;
  };
}

const STORAGE_MEDIA_KEY = 'creatorpulse_media_assets';

export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media-1',
    filename: 'hero_design_system_preview.png',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    type: 'image',
    category: 'posts',
    mimeType: 'image/png',
    sizeBytes: 2450000, // 2.45 MB
    dimensions: '1920x1080',
    uploadedBy: { id: '2', name: 'Sarah Jenkins', username: 'sarahdesign', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    uploadedAt: '2026-08-14 19:40:00',
    isLinked: true,
    linkedEntity: { type: 'post', id: 'post-104', title: 'Modern UI/UX Design Token Systems' }
  },
  {
    id: 'media-2',
    filename: 'sarah_avatar_official.jpg',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    type: 'image',
    category: 'avatars',
    mimeType: 'image/jpeg',
    sizeBytes: 420000, // 420 KB
    dimensions: '800x800',
    uploadedBy: { id: '2', name: 'Sarah Jenkins', username: 'sarahdesign', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    uploadedAt: '2026-08-10 12:15:00',
    isLinked: true,
    linkedEntity: { type: 'profile_avatar', id: '2', title: 'Sarah Jenkins Avatar Profile' }
  },
  {
    id: 'media-3',
    filename: 'coding_tutorial_reel_4k.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    type: 'video',
    category: 'reels',
    mimeType: 'video/mp4',
    sizeBytes: 18500000, // 18.5 MB
    dimensions: '1080x1920',
    durationSeconds: 32,
    uploadedBy: { id: '3', name: 'Marcus Vance', username: 'marcuscode', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
    uploadedAt: '2026-08-13 14:00:00',
    isLinked: true,
    linkedEntity: { type: 'reel', id: 'reel-88', title: 'React 19 Server Components Walkthrough' }
  },
  {
    id: 'media-4',
    filename: 'unused_draft_header_banner.webp',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
    type: 'image',
    category: 'unused',
    mimeType: 'image/webp',
    sizeBytes: 3100000, // 3.1 MB
    dimensions: '2560x1440',
    uploadedBy: { id: '1', name: 'Alex Vance', username: 'alexvance', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    uploadedAt: '2026-08-01 11:20:00',
    isLinked: false
  },
  {
    id: 'media-5',
    filename: 'podcast_episode_42_audio.mp3',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    type: 'audio',
    category: 'attachments',
    mimeType: 'audio/mpeg',
    sizeBytes: 12400000, // 12.4 MB
    durationSeconds: 372,
    uploadedBy: { id: '2', name: 'Sarah Jenkins', username: 'sarahdesign', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    uploadedAt: '2026-08-08 09:30:00',
    isLinked: true,
    linkedEntity: { type: 'post', id: 'post-92', title: 'Podcast #42: Design Systems & Monetization' }
  },
  {
    id: 'media-6',
    filename: 'orphaned_temp_export_data.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'document',
    category: 'unused',
    mimeType: 'application/pdf',
    sizeBytes: 5200000, // 5.2 MB
    uploadedBy: { id: '5', name: 'Jordan Lee', username: 'jordanlee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    uploadedAt: '2026-07-28 16:10:00',
    isLinked: false
  }
];

export function getMediaAssets(): MediaAsset[] {
  if (typeof window === 'undefined') return INITIAL_MEDIA_ASSETS;
  try {
    const raw = localStorage.getItem(STORAGE_MEDIA_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_MEDIA_KEY, JSON.stringify(INITIAL_MEDIA_ASSETS));
      return INITIAL_MEDIA_ASSETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_MEDIA_ASSETS;
  }
}

export function saveMediaAssets(assets: MediaAsset[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_MEDIA_KEY, JSON.stringify(assets));
  window.dispatchEvent(new CustomEvent('creatorpulse_media_updated'));
}

export function deleteMediaAssets(ids: string[]): { success: boolean; deletedCount: number } {
  const current = getMediaAssets();
  const updated = current.filter(a => !ids.includes(a.id));
  saveMediaAssets(updated);
  return { success: true, deletedCount: current.length - updated.length };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
