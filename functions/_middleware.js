// Keep the Pack homepage unchanged; route only the receipt subdomain root.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'receipts.pack321wi.org' && url.pathname === '/' && ['GET', 'HEAD'].includes(context.request.method)) {
    return Response.redirect('https://pack321wi.org/receipts/', 302);
  }
  return context.next();
}
