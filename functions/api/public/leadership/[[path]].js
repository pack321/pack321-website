// Only the explicitly published projection is reachable through this bridge.
// Never forward caller cookies, headers, arbitrary paths or mutation methods.
export async function onRequest({ request, env, params }) {
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (request.method !== 'GET') return new Response(null, {status: 405, headers: {...headers, Allow: 'GET'}});
  const path = (params.path || []).join('/');
  const photo = path.match(/^photos\/([a-z0-9-]{36})$/);
  if (path && !photo) return new Response(null, {status: 404, headers});
  try {
    const upstream = await env.LEADERSHIP_PUBLICATION.fetch(new Request(
      'https://preview-hq.pack321wi.org' + (photo ? '/api/leadership/photos/' + photo[1] : '/api/public/leadership'),
      {headers: {Host: 'preview-hq.pack321wi.org', 'X-Forwarded-Host': 'preview-hq.pack321wi.org', 'X-Forwarded-Proto': 'https'}, signal: AbortSignal.timeout(10000)}
    ));
    if (!upstream.ok) return new Response(null, {status: upstream.status, headers});
    const type = upstream.headers.get('Content-Type') || '';
    if (photo) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(type)) throw Error('Invalid photo');
      return new Response(upstream.body, {headers: {...headers, 'Content-Type': type, 'Content-Security-Policy': "default-src 'none'"}});
    }
    if (!type.includes('application/json')) throw Error('Invalid publication');
    const publication = await upstream.json();
    for (const leader of publication.leaders) {
      if (!leader.photoUrl) continue;
      const url = new URL(leader.photoUrl, 'https://preview-hq.pack321wi.org');
      if (url.origin === 'https://preview-hq.pack321wi.org' && /^\/api\/leadership\/photos\/[a-z0-9-]{36}$/.test(url.pathname)) {
        leader.photoUrl = '/api/public/leadership/photos/' + url.pathname.split('/').at(-1);
      }
    }
    return Response.json(publication, {headers});
  } catch {
    return Response.json({error: 'Published leadership is temporarily unavailable.'}, {status: 503, headers});
  }
}
