import { isSupabaseConfigured, getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface StoryViewer {
  viewerId: string;
  viewerName: string;
  viewerUsername: string;
  viewerAvatar: string;
  createdAt: string;
}

export interface StoryReaction {
  id: string;
  storyId: string;
  userId: string;
  username: string;
  emoji: string;
  createdAt: string;
}

export interface StoryReply {
  id: string;
  storyId: string;
  userId: string;
  username: string;
  avatarUrl: string;
  content: string;
  createdAt: string;
}

export interface PluginStory {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  mediaUrl: string; // URL for image/video or empty for text-only
  caption?: string;
  storyType: 'image' | 'video' | 'text';
  textBgGradient?: string; // e.g. "from-[#EC4899] to-[#F43F5E]"
  visibility: 'public' | 'members_only';
  createdAt: string; // ISO string
  expiresAt: string; // ISO string
  views?: StoryViewer[];
  reactions?: StoryReaction[];
  replies?: StoryReply[];
}

const STORAGE_KEY = 'creatorpulse_stories_db';
const NOTIFICATION_KEY = 'creatorpulse_user_notifications';

// Initial Mock Seed Data mapped to active creators
const INITIAL_STORIES: PluginStory[] = [
  {
    id: 'story-seed-1',
    creatorId: 'user-creator-1',
    creatorName: 'Sarah Jenkins',
    creatorUsername: 'sarahdesign',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
    caption: 'Workspace preview! Recording today’s design masterclass 🎨',
    storyType: 'image',
    visibility: 'public',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    expiresAt: new Date(Date.now() + 21 * 3600 * 1000).toISOString(), // 21 hours left
    views: [
      { viewerId: 'user-member', viewerName: 'Alex Vance', viewerUsername: 'alexvance', viewerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString() }
    ],
    reactions: [
      { id: 'react-1', storyId: 'story-seed-1', userId: 'user-member', username: 'alexvance', emoji: '🔥', createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString() }
    ],
    replies: [
      { id: 'reply-1', storyId: 'story-seed-1', userId: 'user-member', username: 'alexvance', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', content: 'Can’t wait for the course to launch!', createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString() }
    ]
  },
  {
    id: 'story-seed-2',
    creatorId: 'user-creator-2',
    creatorName: 'Marcus Vance',
    creatorUsername: 'marcuscode',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    mediaUrl: '',
    caption: 'Live Q&A starting in 30 minutes! Drop your tech career questions below 💻🔥',
    storyType: 'text',
    textBgGradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', // Indigo to purple
    visibility: 'members_only',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), // 6 hours ago
    expiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(), // 18 hours left
    views: [],
    reactions: [],
    replies: []
  },
  {
    id: 'story-seed-3',
    creatorId: 'user-creator-1',
    creatorName: 'Sarah Jenkins',
    creatorUsername: 'sarahdesign',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    mediaUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600',
    caption: 'Late night sketching session... logo design ideas ✍️',
    storyType: 'image',
    visibility: 'members_only',
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
    views: [],
    reactions: [],
    replies: []
  }
];

export const StoriesService = {
  // Helper to read local DB
  getLocalDB(): PluginStory[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STORIES));
        return INITIAL_STORIES;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('[StoriesService] Read error:', e);
      return INITIAL_STORIES;
    }
  },

  // Helper to save local DB
  saveLocalDB(data: PluginStory[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Dispatch custom event to notify components reactively
      window.dispatchEvent(new CustomEvent('creatorpulse_stories_updated'));
    } catch (e) {
      console.error('[StoriesService] Write error:', e);
    }
  },

  // Add notification to localStorage
  addNotification(userId: string, notification: { title: string; message: string; type: string }) {
    if (typeof window === 'undefined') return;
    try {
      const existing = localStorage.getItem(NOTIFICATION_KEY);
      const list = existing ? JSON.parse(existing) : [];
      const newNotif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: notification.title,
        message: notification.message,
        time: 'Just now',
        isRead: false,
        type: notification.type
      };
      localStorage.setItem(NOTIFICATION_KEY, JSON.stringify([newNotif, ...list]));
      window.dispatchEvent(new CustomEvent('creatorpulse_notifications_updated'));
    } catch (e) {
      console.error('[StoriesService] Failed to record notification:', e);
    }
  },

  // Fetch all active, non-expired stories
  async getStories(currentUserId?: string): Promise<PluginStory[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        // Query active stories (expires_at > NOW())
        const { data: storiesData, error } = await supabase
          .from('stories')
          .select(`
            id, creator_id, media_url, caption, visibility, created_at, expires_at,
            profiles:creator_id (full_name, username, avatar_url, role, is_verified)
          `)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[StoriesService] Supabase select error:', error);
          return [];
        }

        const mapped: PluginStory[] = [];
        for (const story of (storiesData || [])) {
          // Fetch reactions and replies from extension tables if they exist
          const { data: reactions } = await supabase
            .from('story_reactions')
            .select('*')
            .eq('story_id', story.id);
          const { data: replies } = await supabase
            .from('story_replies')
            .select('*')
            .eq('story_id', story.id);
          const { data: views } = await supabase
            .from('story_views')
            .select('*')
            .eq('story_id', story.id);

          const prof = Array.isArray(story.profiles) ? story.profiles[0] : story.profiles;
          const storyType = story.media_url ? (story.media_url.includes('video') ? 'video' : 'image') : 'text';

          mapped.push({
            id: story.id,
            creatorId: story.creator_id,
            creatorName: prof?.full_name || 'Creator',
            creatorUsername: prof?.username || 'creator',
            creatorAvatar: prof?.avatar_url || '',
            mediaUrl: story.media_url || '',
            caption: story.caption || '',
            storyType: storyType as any,
            visibility: story.visibility || 'public',
            createdAt: story.created_at,
            expiresAt: story.expires_at,
            views: (views || []).map((v: any) => ({
              viewerId: v.viewer_id,
              viewerName: 'Platform Subscriber',
              viewerUsername: 'subscriber',
              viewerAvatar: '',
              createdAt: v.created_at
            })),
            reactions: (reactions || []).map((r: any) => ({
              id: r.id,
              storyId: r.story_id,
              userId: r.user_id,
              username: r.username || 'member',
              emoji: r.emoji,
              createdAt: r.created_at
            })),
            replies: (replies || []).map((rep: any) => ({
              id: rep.id,
              storyId: rep.story_id,
              userId: rep.user_id,
              username: rep.username || 'member',
              avatarUrl: rep.avatar_url || '',
              content: rep.content,
              createdAt: rep.created_at
            }))
          });
        }
        return mapped;
      }
    }

    // Fallback Local Storage Mode
    const db = this.getLocalDB();
    const now = new Date().getTime();
    
    // Auto purge expired in fetch to keep client clean
    const active = db.filter(s => new Date(s.expiresAt).getTime() > now);
    if (active.length !== db.length) {
      this.saveLocalDB(active);
    }
    
    return active;
  },

  // Get active and expired stories for a specific creator
  async getCreatorStories(creatorId: string): Promise<PluginStory[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            id, creator_id, media_url, caption, visibility, created_at, expires_at,
            profiles:creator_id (full_name, username, avatar_url)
          `)
          .eq('creator_id', creatorId)
          .order('created_at', { ascending: false });

        if (error) return [];
        return (data || []).map((story: any) => {
          const prof = Array.isArray(story.profiles) ? story.profiles[0] : story.profiles;
          return {
            id: story.id,
            creatorId: story.creator_id,
            creatorName: prof?.full_name || '',
            creatorUsername: prof?.username || '',
            creatorAvatar: prof?.avatar_url || '',
            mediaUrl: story.media_url || '',
            caption: story.caption || '',
            storyType: story.media_url ? 'image' : 'text',
            visibility: story.visibility,
            createdAt: story.created_at,
            expiresAt: story.expires_at
          };
        });
      }
    }

    // Local Storage Mode
    const db = this.getLocalDB();
    return db.filter(s => s.creatorId === creatorId);
  },

  // Create a new story
  async createStory(story: Omit<PluginStory, 'id' | 'createdAt' | 'expiresAt' | 'views' | 'reactions' | 'replies'>, maxDurationHours: number = 24): Promise<PluginStory> {
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + maxDurationHours * 3600 * 1000).toISOString();
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('stories')
          .insert({
            creator_id: story.creatorId,
            media_url: story.mediaUrl,
            caption: story.caption,
            visibility: story.visibility,
            expires_at: expiresAt
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to insert story to Supabase: ${error.message}`);
        }

        // Notify followers
        this.addNotification('followers', {
          title: 'New Creator Story',
          message: `${story.creatorName} (@${story.creatorUsername}) posted a new story!`,
          type: 'sparkles'
        });

        return {
          ...story,
          id: data.id,
          createdAt: data.created_at,
          expiresAt: data.expires_at,
          views: [],
          reactions: [],
          replies: []
        };
      }
    }

    // Local Storage Mode
    const newStory: PluginStory = {
      ...story,
      id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt,
      expiresAt,
      views: [],
      reactions: [],
      replies: []
    };

    const db = this.getLocalDB();
    this.saveLocalDB([newStory, ...db]);

    // Send notifications to simulated subscribers
    this.addNotification('user-member', {
      title: 'New Creator Story',
      message: `${story.creatorName} (@${story.creatorUsername}) shared a new story. View it now!`,
      type: 'sparkles'
    });

    return newStory;
  },

  // Delete a story
  async deleteStory(storyId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase
          .from('stories')
          .delete()
          .eq('id', storyId);

        return !error;
      }
    }

    // Local Storage Mode
    const db = this.getLocalDB();
    const filtered = db.filter(s => s.id !== storyId);
    this.saveLocalDB(filtered);
    return true;
  },

  // Register a seen story
  async markAsSeen(storyId: string, viewer: { id: string; fullName: string; username: string; avatarUrl: string }): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase
          .from('story_views')
          .upsert({ story_id: storyId, viewer_id: viewer.id }, { onConflict: 'story_id,viewer_id' });
        return;
      }
    }

    // Local Storage Mode
    const db = this.getLocalDB();
    const updated = db.map(s => {
      if (s.id === storyId) {
        const views = s.views || [];
        if (!views.some(v => v.viewerId === viewer.id)) {
          return {
            ...s,
            views: [...views, {
              viewerId: viewer.id,
              viewerName: viewer.fullName,
              viewerUsername: viewer.username,
              viewerAvatar: viewer.avatarUrl,
              createdAt: new Date().toISOString()
            }]
          };
        }
      }
      return s;
    });
    this.saveLocalDB(updated);
  },

  // Add Quick reaction
  async addReaction(storyId: string, user: { id: string; username: string; fullName: string }, emoji: string): Promise<void> {
    const reactionId = `react-${Date.now()}`;
    const createdAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: user.id,
            emoji
          });
        
        return;
      }
    }

    // Local Storage Mode
    const db = this.getLocalDB();
    const targetStory = db.find(s => s.id === storyId);
    if (!targetStory) return;

    const updated = db.map(s => {
      if (s.id === storyId) {
        const reactions = s.reactions || [];
        return {
          ...s,
          reactions: [...reactions, {
            id: reactionId,
            storyId,
            userId: user.id,
            username: user.username,
            emoji,
            createdAt
          }]
        };
      }
      return s;
    });
    this.saveLocalDB(updated);

    // Notify creator
    this.addNotification(targetStory.creatorId, {
      title: 'Story Reaction Received',
      message: `@${user.username} reacted with ${emoji} to your story.`,
      type: 'like'
    });
  },

  // Add text reply to story
  async addReply(storyId: string, user: { id: string; username: string; fullName: string; avatarUrl: string }, content: string): Promise<void> {
    const replyId = `reply-${Date.now()}`;
    const createdAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase
          .from('story_replies')
          .insert({
            story_id: storyId,
            user_id: user.id,
            content
          });
        return;
      }
    }

    // Local Storage Mode
    const db = this.getLocalDB();
    const targetStory = db.find(s => s.id === storyId);
    if (!targetStory) return;

    const updated = db.map(s => {
      if (s.id === storyId) {
        const replies = s.replies || [];
        return {
          ...s,
          replies: [...replies, {
            id: replyId,
            storyId,
            userId: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            content,
            createdAt
          }]
        };
      }
      return s;
    });
    this.saveLocalDB(updated);

    // Notify creator
    this.addNotification(targetStory.creatorId, {
      title: 'Story Reply Received',
      message: `@${user.username} replied to your story: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
      type: 'subscriber'
    });
  },

  // Run cleanup job manually/scheduled
  async cleanupExpiredStories(): Promise<{ purgedCount: number }> {
    const now = new Date().getTime();
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { count, error } = await supabase
          .from('stories')
          .delete({ count: 'exact' })
          .lt('expires_at', new Date().toISOString());

        if (error) return { purgedCount: 0 };
        return { purgedCount: count || 0 };
      }
    }

    // Local Storage Mode
    const db = this.getLocalDB();
    const active = db.filter(s => new Date(s.expiresAt).getTime() > now);
    const purgedCount = db.length - active.length;
    this.saveLocalDB(active);
    return { purgedCount };
  }
};
