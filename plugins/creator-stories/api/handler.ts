export async function handleApi(req: Request) {
  return new Response(JSON.stringify({ plugin: 'plugin-creator-stories', status: 'ok' }));
}
