/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Starter Plugin API Request Handler
 */
export async function handleApi(_req: Request) {
  return new Response(JSON.stringify({ plugin: 'plugin-starter-plugin', status: 'ok' }));
}
