(function () {
  const namespace = 'http://www.w3.org/2000/svg';

  const icons = {
    'calendar-days': [
      '<path d="M8 2v4M16 2v4M3.5 9.5h17M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/>',
      '<path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/>'
    ].join(''),
    'user-round-plus': [
      '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>',
      '<circle cx="10" cy="7" r="4"/>',
      '<path d="M19 8v6M22 11h-6"/>'
    ].join(''),
    'users-round': [
      '<path d="M18 21a5 5 0 0 0-10 0"/>',
      '<circle cx="13" cy="7" r="4"/>',
      '<path d="M22 21a4 4 0 0 0-3-3.87M6 17.13A4 4 0 0 0 3 21"/>',
      '<path d="M17.5 3.2a4 4 0 0 1 0 7.6M6.5 3.2a4 4 0 0 0 0 7.6"/>'
    ].join(''),
    'calendar-check': [
      '<path d="M8 2v4M16 2v4M3.5 9.5h17M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/>',
      '<path d="m8 16 2.2 2.2L16 12.4"/>'
    ].join(''),
    'door-open': [
      '<path d="M13 4h3a2 2 0 0 1 2 2v14"/>',
      '<path d="M3 20h18"/>',
      '<path d="M13 20V3.5L6 5v15"/>',
      '<path d="M10 12h.01"/>'
    ].join('')
  };

  function renderIcon(name) {
    const iconName = icons[name] ? name : 'calendar-check';
    if (!icons[name]) {
      console.warn(`Pack321Icons: missing icon "${name}", using calendar-check fallback.`);
    }
    const svg = document.createElementNS(namespace, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = icons[iconName];
    return svg;
  }

  function hydrate(root = document) {
    root.querySelectorAll('[data-card-icon]').forEach((target) => {
      target.replaceChildren(renderIcon(target.getAttribute('data-card-icon')));
    });
  }

  window.Pack321Icons = {
    hydrate,
    renderIcon,
  };

  document.addEventListener('DOMContentLoaded', () => hydrate());
}());
