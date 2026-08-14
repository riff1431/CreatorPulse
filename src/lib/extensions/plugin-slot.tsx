'use client';

import React from 'react';
import { usePlugins } from './plugin-engine';
import { PluginHookType, PluginManifest } from './plugin-types';
import { Sparkles, Shield, Gift, Send, Share2, Award, ExternalLink } from 'lucide-react';

export interface PluginSlotProps {
  hook: PluginHookType | string;
  context?: Record<string, any>;
  className?: string;
  renderCustom?: (plugin: PluginManifest) => React.ReactNode;
}

/**
 * PluginSlot dynamically mounts and renders components from all active plugins
 * that subscribe to the specified extension hook.
 */
export const PluginSlot: React.FC<PluginSlotProps> = ({
  hook,
  context = {},
  className = '',
  renderCustom
}) => {
  const { plugins } = usePlugins();

  // Find enabled plugins that subscribe to this hook
  const activePlugins = plugins.filter(
    (p: PluginManifest) => p.isEnabled && !p.hasError && Array.isArray(p.hooks) && p.hooks.includes(hook as PluginHookType)
  );

  if (activePlugins.length === 0) {
    return null;
  }

  return (
    <div data-plugin-slot={hook} className={`plugin-slot-container flex flex-col gap-3 ${className}`}>
      {activePlugins.map((plugin: PluginManifest) => {
        if (renderCustom) {
          return <React.Fragment key={plugin.id}>{renderCustom(plugin)}</React.Fragment>;
        }

        // Render dynamic plugin widget based on plugin id / category
        return (
          <div
            key={plugin.id}
            data-plugin-id={plugin.id}
            className="p-4 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  {plugin.id.includes('gift') ? (
                    <Gift size={16} />
                  ) : plugin.id.includes('watermark') || plugin.id.includes('drm') ? (
                    <Shield size={16} />
                  ) : plugin.id.includes('telegram') ? (
                    <Send size={16} />
                  ) : plugin.id.includes('seo') || plugin.id.includes('social') ? (
                    <Share2 size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#18181B] flex items-center gap-1.5">
                    {plugin.name}
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
                      v{plugin.version}
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#71717A] line-clamp-1">{plugin.description}</p>
                </div>
              </div>

              {Boolean(plugin.settingsValues?.isDefault) && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                  Active
                </span>
              )}
            </div>

            {/* Dynamic context interactive elements */}
            {hook === 'dashboard_widget' && (
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#71717A]">
                <span>Status: <strong className="text-emerald-600">Running</strong></span>
                <span className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1">
                  Manage Widget <ExternalLink size={11} />
                </span>
              </div>
            )}

            {hook === 'feed_post_action' && (
              <div className="mt-1 flex items-center gap-2">
                <button className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors flex items-center gap-1">
                  <Sparkles size={12} /> {plugin.name} Action
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PluginSlot;
