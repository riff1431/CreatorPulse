import { ModerationService, ReportService } from '../services/moderation-service';

export const moderationEvents = {
  onPostCreated: async (post: any) => {
    return await ModerationService.scanText(post.content || '');
  },
  onCommentCreated: async (comment: any) => {
    return await ModerationService.scanText(comment.text || '');
  }
};
