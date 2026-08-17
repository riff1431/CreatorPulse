export type ActivityCategory = 
  | 'profile' 
  | 'post' 
  | 'reel' 
  | 'search' 
  | 'interaction' 
  | 'account';

export interface ActivityLogItem {
  id: string;
  category: ActivityCategory;
  title: string;
  subtitle?: string;
  targetUrl?: string;
  targetId?: string;
  avatarUrl?: string;
  thumbnailUrl?: string;
  actionType?: 'view' | 'like' | 'comment' | 'share' | 'search' | 'follow' | 'subscribe' | 'unlock' | 'login' | 'setting';
  timestamp: string; // ISO string
  metadata?: Record<string, any>;
}
