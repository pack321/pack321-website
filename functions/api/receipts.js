const HOSTS = new Set(['pack321wi.org', 'www.pack321wi.org', 'receipts.pack321wi.org']);
const MAX_BODY = 15 * 1024 * 1024;
const json = (body, status = 200) => new Response(JSON.stringify(body), {status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function configured(env) {
  return env.RECEIPTS_ENABLED === 'true' && /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(env.RECEIPTS_SCRIPT_URL || '') &&
    (env.RECEIPTS_SIGNING_SECRET || '').length >= 32 && Boolean(env.RECEIPTS_TURNSTILE_SECRET && env.RECEIPTS_TURNSTILE_SITE_KEY);
}
export async function onRequestGet({env}) {
  const enabled = configured(env);
  return json({enabled,siteKey:enabled ? env.RECEIPTS_TURNSTILE_SITE_KEY : null});
}
async function readBounded(request) {
  const reader = request.body.getReader(), chunks = []; let size = 0;
  while (true) {
    const {done,value} = await reader.read(); if(done) break;
    size += value.byteLength;
    if(size > MAX_BODY) { await reader.cancel(); throw Error('too-large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for(const chunk of chunks) {bytes.set(chunk,offset);offset += chunk.byteLength;}
  return JSON.parse(new TextDecoder().decode(bytes));
}
export async function onRequestPost({request,env}) {
  const url = new URL(request.url);
  if (!HOSTS.has(url.hostname) || request.headers.get('Origin') !== url.origin) return json({ok:false,error:'Please submit from the Pack website.'},403);
  if (!configured(env)) return json({ok:false,error:'Receipt submissions are not active yet.'},503);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ok:false,error:'Invalid receipt request.'},415);
  if (Number(request.headers.get('Content-Length')) > MAX_BODY || !request.body) return json({ok:false,error:'Receipt request is too large or empty.'},413);
  let payload;
  try { payload = await readBounded(request); } catch { return json({ok:false,error:'Invalid or oversized receipt request.'},400); }
  if (!payload || typeof payload.token !== 'string' || payload.token.length > 2048 || !payload.data || !/^[a-f0-9-]{36}$/i.test(payload.data.requestId || '')) return json({ok:false,error:'Invalid receipt submission.'},400);
  try {
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.RECEIPTS_TURNSTILE_SECRET,response:payload.token}),signal:AbortSignal.timeout(10000)
    });
    const verified = await check.json();
    if (!check.ok || !verified.success || verified.action !== 'receipt' || verified.hostname !== url.hostname) return json({ok:false,error:'Verification failed. Please try again.'},403);
    const body = JSON.stringify(payload.data), timestamp = String(Date.now());
    const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(env.RECEIPTS_SIGNING_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const signature = Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(timestamp + '.' + body))), b => b.toString(16).padStart(2,'0')).join('');
    const upstream = await fetch(env.RECEIPTS_SCRIPT_URL, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({timestamp,body,signature}),signal:AbortSignal.timeout(45000)});
    const result = await upstream.json();
    if (!upstream.ok || !result.ok || result.reference !== payload.data.requestId || typeof result.subject !== 'string' || typeof result.emailSent !== 'boolean') return json({ok:false,error:'Submission status needs review. Keep your reference before trying again.'},502);
    return json({ok:true,reference:result.reference,subject:result.subject,emailSent:result.emailSent});
  } catch { return json({ok:false,error:'Unable to confirm receipt submission. Keep your reference for follow-up.'},502); }
}
