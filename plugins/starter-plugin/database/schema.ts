/**
 * Starter Plugin Database Schema Mapping
 * Defines TypeScript interface representations of the plugin's schema definitions.
 */
export interface PluginAnalyticsRecord {
  id: string;
  pluginId: string;
  metricName: string;
  metricValue: number;
  recordedAt: string;
  metadata?: Record<string, unknown>;
}

export interface PluginSettingsRecord {
  key: string;
  value: string;
  updatedAt: string;
}
