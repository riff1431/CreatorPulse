export type ContentType = 'post' | 'reel' | 'story';

export type ScheduleStatus =
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed_retryable'
  | 'failed'
  | 'cancelled';

export interface ScheduledItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  contentType: ContentType;
  title?: string;
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  visibility: 'public' | 'subscribers' | 'vip_only';
  unlockPrice?: number;
  scheduledAt: string; // ISO string in UTC or target timezone representation
  timezone: string;
  status: ScheduleStatus;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleLog {
  id: string;
  scheduledItemId?: string;
  creatorId?: string;
  creatorName?: string;
  contentType?: ContentType;
  action: string;
  status: 'info' | 'success' | 'warning' | 'error';
  message: string;
  errorDetails?: string;
  executedAt: string;
}

export interface WorkerStatus {
  isRunning: boolean;
  lastPulse: string;
  checkIntervalSeconds: number;
  pendingCount: number;
  totalPublished: number;
  totalFailed: number;
  retryQueueCount: number;
}

const STORAGE_KEY_ITEMS = 'cps_plugin_scheduled_items_v1';
const STORAGE_KEY_LOGS = 'cps_plugin_schedule_logs_v1';

// Initial Mock Scheduled Data for demonstration
const INITIAL_MOCK_ITEMS: ScheduledItem[] = [
  {
    id: 'sched-101',
    creatorId: 'c-001',
    creatorName: 'Elena Rostova',
    creatorUsername: 'elena_rostova',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    contentType: 'post',
    title: 'Behind The Scenes: Summer Collection Shoot 📸',
    content: 'Get an exclusive first look at our upcoming summer lookbook! VIP subscribers get 48h early access before public drop.',
    mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    visibility: 'subscribers',
    unlockPrice: 0,
    scheduledAt: new Date(Date.now() + 3600 * 1000 * 4).toISOString(), // 4 hours from now
    timezone: 'America/New_York',
    status: 'scheduled',
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
  {
    id: 'sched-102',
    creatorId: 'c-001',
    creatorName: 'Elena Rostova',
    creatorUsername: 'elena_rostova',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    contentType: 'reel',
    title: '60-Sec Quick Makeup Routine Reel 🎬',
    content: 'Speed run through my signature morning glow routine using 3 organic products! Save & bookmark this for later ✨',
    mediaUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    visibility: 'public',
    unlockPrice: 0,
    scheduledAt: new Date(Date.now() + 3600 * 1000 * 24).toISOString(), // Tomorrow
    timezone: 'Europe/London',
    status: 'scheduled',
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
  },
  {
    id: 'sched-103',
    creatorId: 'c-001',
    creatorName: 'Elena Rostova',
    creatorUsername: 'elena_rostova',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    contentType: 'story',
    title: 'Live Q&A Announcement Story ⏳',
    content: 'Drop your questions below for tonight live stream session at 8 PM EST! See you all live 💬',
    mediaUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
    visibility: 'public',
    unlockPrice: 0,
    scheduledAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // 2 hours ago (Published)
    timezone: 'America/New_York',
    status: 'published',
    publishedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'sched-104',
    creatorId: 'c-002',
    creatorName: 'Marcus Vance',
    creatorUsername: 'marcus_vance',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    contentType: 'post',
    title: 'Crypto Market Analysis & Portfolio Strategy 📈',
    content: 'Full breakdown of Ethereum layer 2 metrics and DeFi yield protocols for Q3 2026.',
    mediaUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    visibility: 'vip_only',
    unlockPrice: 15.0,
    scheduledAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(), // Due 1h ago (Retryable Failure simulation)
    timezone: 'Asia/Tokyo',
    status: 'failed_retryable',
    retryCount: 1,
    maxRetries: 3,
    lastError: 'Simulated API gateway timeout during payload delivery',
    createdAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
  },
  {
    id: 'sched-105',
    creatorId: 'c-003',
    creatorName: 'Sophia Lin',
    creatorUsername: 'sophialin_art',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    contentType: 'reel',
    title: 'Speed Painting Timelapse - Neon Cyberpunk City 🎨',
    content: '4 hours of Procreate digital painting condensed into 30 seconds!',
    mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800',
    visibility: 'public',
    unlockPrice: 0,
    scheduledAt: new Date(Date.now() + 3600 * 1000 * 72).toISOString(), // 3 days from now
    timezone: 'Asia/Dhaka',
    status: 'scheduled',
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  }
];

const INITIAL_MOCK_LOGS: ScheduleLog[] = [
  {
    id: 'log-201',
    scheduledItemId: 'sched-103',
    creatorId: 'c-001',
    creatorName: 'Elena Rostova',
    contentType: 'story',
    action: 'AUTO_PUBLISH_SUCCESS',
    status: 'success',
    message: 'Story "Live Q&A Announcement Story ⏳" auto-published successfully to feed.',
    executedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'log-202',
    scheduledItemId: 'sched-104',
    creatorId: 'c-002',
    creatorName: 'Marcus Vance',
    contentType: 'post',
    action: 'PUBLISH_RETRY_TRIGGERED',
    status: 'warning',
    message: 'Attempt #1 failed: Simulated API gateway timeout. Queued for automatic retry.',
    errorDetails: 'HTTP 504 Gateway Timeout during webhook dispatch',
    executedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
  },
  {
    id: 'log-203',
    action: 'CRON_WORKER_PULSE',
    status: 'info',
    message: 'Background scheduling worker executed check. 3 items pending in queue.',
    executedAt: new Date(Date.now() - 300 * 1000).toISOString(),
  }
];

export class SchedulingService {
  /**
   * Get all scheduled items from storage with fallback mock initialization
   */
  public static getItems(): ScheduledItem[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_ITEMS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_MOCK_ITEMS));
        return INITIAL_MOCK_ITEMS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOCK_ITEMS;
    }
  }

  /**
   * Save items to storage
   */
  private static saveItems(items: ScheduledItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (err) {
      console.error('[SchedulingService] Failed to save items to storage:', err);
    }
  }

  /**
   * Get execution audit logs
   */
  public static getLogs(): ScheduleLog[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_LOGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOGS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(INITIAL_MOCK_LOGS));
        return INITIAL_MOCK_LOGS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOCK_LOGS;
    }
  }

  /**
   * Log an execution audit event
   */
  public static addLog(log: Omit<ScheduleLog, 'id' | 'executedAt'>): ScheduleLog {
    const logs = this.getLogs();
    const newLog: ScheduleLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...log,
      executedAt: new Date().toISOString(),
    };
    const updated = [newLog, ...logs].slice(0, 100); // keep last 100 logs
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
      } catch {}
    }
    return newLog;
  }

  /**
   * Get scheduled items filtered by creatorId or role
   */
  public static getScheduledContent(creatorId?: string, status?: string): ScheduledItem[] {
    let items = this.getItems();
    if (creatorId) {
      items = items.filter(i => i.creatorId === creatorId);
    }
    if (status && status !== 'all') {
      items = items.filter(i => i.status === status);
    }
    return items.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  /**
   * Create a new scheduled item
   */
  public static scheduleContent(data: Partial<ScheduledItem> & { content: string; scheduledAt: string }): ScheduledItem {
    const items = this.getItems();
    const newItem: ScheduledItem = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      creatorId: data.creatorId || 'c-001',
      creatorName: data.creatorName || 'Elena Rostova',
      creatorUsername: data.creatorUsername || 'elena_rostova',
      creatorAvatar: data.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      contentType: data.contentType || 'post',
      title: data.title || '',
      content: data.content,
      mediaUrl: data.mediaUrl || '',
      thumbnailUrl: data.thumbnailUrl || '',
      visibility: data.visibility || 'public',
      unlockPrice: Number(data.unlockPrice) || 0,
      scheduledAt: data.scheduledAt,
      timezone: data.timezone || 'UTC',
      status: 'scheduled',
      retryCount: 0,
      maxRetries: data.maxRetries || 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    items.push(newItem);
    this.saveItems(items);

    this.addLog({
      scheduledItemId: newItem.id,
      creatorId: newItem.creatorId,
      creatorName: newItem.creatorName,
      contentType: newItem.contentType,
      action: 'SCHEDULE_CREATED',
      status: 'info',
      message: `Scheduled ${newItem.contentType.toUpperCase()} "${newItem.title || 'Untitled'}" for ${new Date(newItem.scheduledAt).toLocaleString()} (${newItem.timezone}).`
    });

    return newItem;
  }

  /**
   * Edit or reschedule an existing item
   */
  public static updateScheduledContent(id: string, updates: Partial<ScheduledItem>): ScheduledItem | null {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const current = items[idx];
    const updated: ScheduledItem = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Reset status to scheduled if rescheduled
    if (updates.scheduledAt && updates.scheduledAt !== current.scheduledAt) {
      updated.status = 'scheduled';
      updated.retryCount = 0;
      updated.lastError = undefined;
    }

    items[idx] = updated;
    this.saveItems(items);

    this.addLog({
      scheduledItemId: updated.id,
      creatorId: updated.creatorId,
      creatorName: updated.creatorName,
      contentType: updated.contentType,
      action: updates.scheduledAt ? 'SCHEDULE_RESCHEDULED' : 'SCHEDULE_UPDATED',
      status: 'info',
      message: `Updated scheduled ${updated.contentType} "${updated.title || 'Untitled'}".`
    });

    return updated;
  }

  /**
   * Cancel a scheduled item
   */
  public static cancelScheduledContent(id: string): boolean {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return false;

    item.status = 'cancelled';
    item.updatedAt = new Date().toISOString();
    this.saveItems(items);

    this.addLog({
      scheduledItemId: item.id,
      creatorId: item.creatorId,
      creatorName: item.creatorName,
      contentType: item.contentType,
      action: 'SCHEDULE_CANCELLED',
      status: 'warning',
      message: `Cancelled scheduled ${item.contentType} "${item.title || 'Untitled'}".`
    });

    return true;
  }

  /**
   * Delete a scheduled item permanently
   */
  public static deleteScheduledContent(id: string): boolean {
    let items = this.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return false;

    items = items.filter(i => i.id !== id);
    this.saveItems(items);

    this.addLog({
      scheduledItemId: id,
      creatorId: item.creatorId,
      creatorName: item.creatorName,
      contentType: item.contentType,
      action: 'SCHEDULE_DELETED',
      status: 'warning',
      message: `Deleted scheduled ${item.contentType} "${item.title || 'Untitled'}".`
    });

    return true;
  }

  /**
   * Immediately publish a scheduled item (Force Publish Now)
   */
  public static forcePublishNow(id: string): { success: boolean; item?: ScheduledItem; error?: string } {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return { success: false, error: 'Scheduled item not found.' };

    item.status = 'published';
    item.publishedAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    this.saveItems(items);

    this.addLog({
      scheduledItemId: item.id,
      creatorId: item.creatorId,
      creatorName: item.creatorName,
      contentType: item.contentType,
      action: 'FORCE_PUBLISH_NOW',
      status: 'success',
      message: `Manually published ${item.contentType.toUpperCase()} "${item.title || 'Untitled'}" immediately.`
    });

    return { success: true, item };
  }

  /**
   * Retry publishing a failed item
   */
  public static retryFailedJob(id: string): { success: boolean; item?: ScheduledItem; error?: string } {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return { success: false, error: 'Scheduled item not found.' };

    item.status = 'publishing';
    item.retryCount = (item.retryCount || 0) + 1;
    item.updatedAt = new Date().toISOString();
    this.saveItems(items);

    // Simulate instant success on manual retry
    setTimeout(() => {
      const refreshedItems = this.getItems();
      const refItem = refreshedItems.find(i => i.id === id);
      if (refItem) {
        refItem.status = 'published';
        refItem.publishedAt = new Date().toISOString();
        refItem.updatedAt = new Date().toISOString();
        this.saveItems(refreshedItems);

        this.addLog({
          scheduledItemId: refItem.id,
          creatorId: refItem.creatorId,
          creatorName: refItem.creatorName,
          contentType: refItem.contentType,
          action: 'RETRY_SUCCESS',
          status: 'success',
          message: `Manual retry succeeded! ${refItem.contentType.toUpperCase()} "${refItem.title || 'Untitled'}" is now published.`
        });
      }
    }, 600);

    return { success: true, item };
  }

  /**
   * Background Worker Cron Execution
   * Checks due items, updates status, handles retries, logs audit trail
   */
  public static runWorkerCronCheck(): { processedCount: number; publishedCount: number; retryCount: number } {
    const items = this.getItems();
    const now = new Date().getTime();

    let processedCount = 0;
    let publishedCount = 0;
    let retryCount = 0;

    items.forEach(item => {
      if (item.status === 'scheduled' || item.status === 'failed_retryable') {
        const schedTime = new Date(item.scheduledAt).getTime();
        if (schedTime <= now) {
          processedCount++;

          // Simulate worker processing logic (90% success rate simulation)
          const isSimulatedError = Math.random() < 0.10 && item.retryCount < item.maxRetries;

          if (isSimulatedError) {
            item.retryCount += 1;
            retryCount++;
            if (item.retryCount >= item.maxRetries) {
              item.status = 'failed';
              item.lastError = 'Maximum retry limit reached (3/3 attempts failed).';
              this.addLog({
                scheduledItemId: item.id,
                creatorId: item.creatorId,
                creatorName: item.creatorName,
                contentType: item.contentType,
                action: 'WORKER_PERMANENT_FAILURE',
                status: 'error',
                message: `Failed to auto-publish ${item.contentType} "${item.title || 'Untitled'}". ${item.lastError}`
              });
            } else {
              item.status = 'failed_retryable';
              item.lastError = `Temporary network failure on attempt #${item.retryCount}. Will retry automatically.`;
              this.addLog({
                scheduledItemId: item.id,
                creatorId: item.creatorId,
                creatorName: item.creatorName,
                contentType: item.contentType,
                action: 'WORKER_RETRYABLE_FAILURE',
                status: 'warning',
                message: `Attempt #${item.retryCount} failed for ${item.contentType} "${item.title || 'Untitled'}". Scheduled for retry.`
              });
            }
          } else {
            publishedCount++;
            item.status = 'published';
            item.publishedAt = new Date().toISOString();
            this.addLog({
              scheduledItemId: item.id,
              creatorId: item.creatorId,
              creatorName: item.creatorName,
              contentType: item.contentType,
              action: 'WORKER_AUTO_PUBLISHED',
              status: 'success',
              message: `Auto-published ${item.contentType.toUpperCase()} "${item.title || 'Untitled'}" successfully to feed.`
            });
          }
          item.updatedAt = new Date().toISOString();
        }
      }
    });

    if (processedCount > 0) {
      this.saveItems(items);
    }

    this.addLog({
      action: 'CRON_WORKER_PULSE',
      status: 'info',
      message: `Worker pulse completed. Processed: ${processedCount}, Published: ${publishedCount}, Retries: ${retryCount}.`
    });

    return { processedCount, publishedCount, retryCount };
  }

  /**
   * Get worker status metrics
   */
  public static getWorkerStatus(): WorkerStatus {
    const items = this.getItems();
    return {
      isRunning: true,
      lastPulse: new Date().toISOString(),
      checkIntervalSeconds: 30,
      pendingCount: items.filter(i => i.status === 'scheduled').length,
      totalPublished: items.filter(i => i.status === 'published').length,
      totalFailed: items.filter(i => i.status === 'failed' || i.status === 'failed_retryable').length,
      retryQueueCount: items.filter(i => i.status === 'failed_retryable').length,
    };
  }
}
