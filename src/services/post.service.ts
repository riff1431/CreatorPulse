import { Post, MOCK_POSTS, UserRole } from '@/lib/supabase/store';

export class PostService {
  static getFeedPosts(tab: 'for_you' | 'following' | 'subscribed' = 'for_you', userRole?: UserRole): Post[] {
    let posts = [...MOCK_POSTS];

    if (tab === 'subscribed') {
      posts = posts.filter((p) => p.visibility === 'subscribers' || p.visibility === 'vip_only' || p.visibility === 'members_only');
    } else if (tab === 'following') {
      posts = posts.filter((_, idx) => idx % 2 === 0);
    }

    return posts.map((post) => {
      if (userRole === 'admin' || userRole === 'super_admin') {
        // Admins can see all content
        return { ...post, visibility: 'public' as const };
      }
      return post;
    });
  }

  static createPost(data: Partial<Post>, authorId: string): Post {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId,
      authorName: data.authorName || 'Creator',
      authorUsername: data.authorUsername || 'creator',
      authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorVerified: Boolean(data.authorVerified),
      authorCategory: data.authorCategory || 'General',
      title: data.title || '',
      content: data.content || '',
      mediaUrl: data.mediaUrl,
      postType: data.postType || 'text',
      visibility: data.visibility || 'public',
      unlockPrice: data.unlockPrice,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      isLiked: false,
      isSaved: false,
      createdAt: new Date().toISOString(),
    };
    return newPost;
  }
}
