/* Run in the rendered storefront (or inject through browser automation). */
(() => {
  const rect = element => element ? element.getBoundingClientRect() : null;
  const intersects = (a, b) => Boolean(a && b && Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top));
  const visible = element => Boolean(element && getComputedStyle(element).display !== 'none' && rect(element).width && rect(element).height);
  const pair = (name, first, second, allow = false) => {
    const a = rect(document.querySelector(first));
    const b = rect(document.querySelector(second));
    const overlap = intersects(a, b);
    return { name, first, second, present: Boolean(a && b), overlap, pass: !overlap || allow, rectangles: { first: a?.toJSON(), second: b?.toJSON() } };
  };
  const separated = (name, firstSelector, secondSelector) => {
    const first = rect(document.querySelector(firstSelector));
    const second = rect(document.querySelector(secondSelector));
    const overlap = intersects(first, second);
    return { name, firstSelector, secondSelector, present: Boolean(first && second), overlap, pass: !overlap, rectangles: { first: first?.toJSON(), second: second?.toJSON() } };
  };
  window.StorefrontGeometryAudit = {
    run() {
      const checks = [
        pair('announcement versus navigation', '.preview-banner', '.site-header'),
        pair('navigation versus attribution', '.site-header', '.support-context'),
        pair('attribution versus campaign context', '.support-context', '.campaign-context'),
        pair('attribution versus page title', '.support-context', 'main h1'),
        pair('hero versus workspace', '.campaign-hero, .store-v2-hero', '#products, #current'),
        pair('filters versus products', '.filter-panel', '.product-grid'),
        pair('workspace versus footer', 'main', '.site-footer'),
        separated('product text versus actions', '.product-card h3, .product-card .product-meta', '.product-card .product-actions'),
        separated('cart prices versus totals', '.cart-line > span', '.cart-line > strong')
      ];
      const drawer = document.querySelector('[data-store-nav]');
      const drawerOpen = visible(drawer) && drawer.classList.contains('is-open');
      checks.push({ name: 'mobile drawer versus clickable content', present: Boolean(drawer), pass: !drawerOpen || document.body.classList.contains('menu-open'), drawerOpen });
      return {
        route: location.href,
        viewport: { width: innerWidth, height: innerHeight, clientWidth: document.documentElement.clientWidth, clientHeight: document.documentElement.clientHeight },
        checks,
        pass: checks.every(check => check.pass)
      };
    }
  };
})();
