/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Starter Plugin Server Handler
 * Demonstrates node side request handling using unknown argument safety.
 */
export async function handlePluginServerRequest(_req: unknown) {
  return { success: true, plugin: 'plugin-starter-plugin' };
}
