// Serve the receipt form at the subdomain root without changing its address.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'receipts.pack321wi.org' && url.pathname === '/' && ['GET', 'HEAD'].includes(context.request.method)) {
    url.pathname = '/receipts/';
    return context.env.ASSETS.fetch(new Request(url, context.request));
  }
  return context.next();
}
