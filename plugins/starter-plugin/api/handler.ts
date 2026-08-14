export async function handleApi(req: Request) {
  return new Response(JSON.stringify({ plugin: 'plugin-starter-plugin', status: 'ok' }));
}
