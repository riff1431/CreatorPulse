'use client';

import { usePlugins } from '@/lib/extensions/plugin-engine';

export function usePipraPay() {
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === 'plugin-piprapay' || p.slug === 'piprapay');
  const isEnabled = plugin?.isEnabled ?? false;
  const settings = plugin?.settingsValues ?? {};

  return {
    plugin,
    isEnabled,
    settings,
    mode: settings.mode || 'sandbox',
    supportedCurrencies: settings.supportedCurrencies || 'BDT'
  };
}

export default usePipraPay;
