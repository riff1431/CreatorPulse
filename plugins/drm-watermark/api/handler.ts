export async function handleApi(req: Request) {
  return new Response(JSON.stringify({ plugin: 'plugin-drm-watermark', status: 'ok' }));
}
