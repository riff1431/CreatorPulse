import { PluginLoader } from '@/lib/loaders/plugin-loader';
import { PluginManifest } from '@/lib/extensions/plugin-types';
import manifest from '../manifest.json';
import pluginConfig from '../plugin.config';

/**
 * Starter Plugin SDK Compliance Verification Suite
 */
export function runPluginTestSuite() {
  const manifestTyped = manifest as unknown as PluginManifest;
  const validationResult = PluginLoader.validateManifest(manifestTyped);

  if (!validationResult.valid) {
    throw new Error(`Manifest validation failed: ${validationResult.error}`);
  }

  if (typeof pluginConfig.onInstall !== 'function') {
    throw new Error('Plugin config missing onInstall handler');
  }

  if (typeof pluginConfig.onActivate !== 'function') {
    throw new Error('Plugin config missing onActivate handler');
  }

  return {
    success: true,
    pluginId: manifest.id,
    version: manifest.version,
    hooksCount: manifest.hooks.length,
    permissionsCount: manifest.permissions.length
  };
}

export default runPluginTestSuite;
