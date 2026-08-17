import { Post, ShortVideo } from '@/lib/supabase/store';

export interface SavedCollection {
  id: string;
  title: string;
  description?: string;
  color?: string; // Hex or theme color class
  coverUrl?: string;
  isPrivate: boolean; // default true
  icon?: string; // emoji or identifier
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedItem {
  id: string;
  targetId: string;
  itemType: 'post' | 'reel';
  collectionIds: string[];
  savedAt: string;
  post?: Post;
  short?: ShortVideo;
}
