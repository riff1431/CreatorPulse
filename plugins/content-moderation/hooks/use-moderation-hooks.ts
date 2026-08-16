'use client';

import { usePlugins } from '@/lib/extensions/plugin-engine';
import { ModerationService } from '../services/moderation-service';

export function useModeration() {
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === 'plugin-ai-content-moderation' || p.slug === 'content-moderation');
  const isEnabled = plugin?.isEnabled ?? false;

  return {
    isEnabled,
    plugin,
    scanText: (text: string) => ModerationService.scanText(text)
  };
}
