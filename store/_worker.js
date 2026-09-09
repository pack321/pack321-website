export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && /^\/support\/[^/]+\/?$/.test(url.pathname)) {
      // Request the canonical clean asset path internally so Pages does not
      // return its HTML-normalization redirect to the browser.
      const assetUrl = new URL("/support-route", url.origin);
      return env.ASSETS.fetch(new Request(assetUrl, { headers: request.headers }));
    }

    return env.ASSETS.fetch(request);
  },
};
