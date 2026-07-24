(function () {
  const namespace = 'http://www.w3.org/2000/svg';

  const iconPaths = {
    calendar: [
      '<path d="M8 2v4M16 2v4M3.5 9.5h17M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/>',
      '<path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/>'
    ].join(''),
    visitMeeting: [
      '<path d="m11 17 2 2a2.8 2.8 0 0 0 4 0l4-4a2.8 2.8 0 0 0 0-4l-3.5-3.5a2.8 2.8 0 0 0-4 0l-.5.5"/>',
      '<path d="m13 7-2-2a2.8 2.8 0 0 0-4 0l-4 4a2.8 2.8 0 0 0 0 4l3.5 3.5a2.8 2.8 0 0 0 4 0l.5-.5"/>',
      '<path d="m8 12 2 2 4-4"/>'
    ].join(''),
    packMeeting: [
      '<path d="M18 21a5 5 0 0 0-10 0"/>',
      '<circle cx="13" cy="7" r="4"/>',
      '<path d="M22 21a4 4 0 0 0-3-3.87M6 17.13A4 4 0 0 0 3 21"/>',
      '<path d="M17.5 3.2a4 4 0 0 1 0 7.6M6.5 3.2a4 4 0 0 0 0 7.6"/>'
    ].join(''),
    camping: [
      '<path d="M3 20h18"/>',
      '<path d="m12 4 8 16H4Z"/>',
      '<path d="m12 4 3 16"/>',
      '<path d="m12 4-3 16"/>'
    ].join(''),
    fishing: [
      '<path d="M6.5 12c2.4-4 7.2-5.4 13.5-4-1.2 2.3-3.2 4-6 5.1"/>',
      '<path d="M20 8.1 22 6v5Z"/>',
      '<path d="M3 15c2.2-1.9 4.7-2.4 7.5-1.4 2.8 1 5.4.5 7.5-1.4"/>',
      '<circle cx="16" cy="9" r=".5"/>'
    ].join(''),
    hiking: [
      '<path d="M4 17.5c1.8 1 3.7 1 5.5 0"/>',
      '<path d="M14.5 17.5c1.8 1 3.7 1 5.5 0"/>',
      '<path d="M7 14.5 8.5 9 12 7l3 2.5"/>',
      '<path d="m12 7 1.5-3"/>',
      '<path d="m9.5 12 3 2.5 1.5 4"/>'
    ].join(''),
    service: [
      '<path d="M12 21s-7-4.4-9.2-8.1C.9 9.6 2.6 6 6.1 6c2 0 3.2 1.1 3.9 2.1C10.8 7.1 12 6 14 6c3.5 0 5.2 3.6 3.3 6.9C15.1 16.6 12 21 12 21Z"/>',
      '<path d="M16 11h5M18.5 8.5v5"/>'
    ].join(''),
    blueGold: [
      '<circle cx="12" cy="8" r="5"/>',
      '<path d="m8.5 12.5-2 8 5.5-3 5.5 3-2-8"/>'
    ].join(''),
    graduation: [
      '<path d="m22 10-10-5-10 5 10 5Z"/>',
      '<path d="M6 12v5c3.5 2 8.5 2 12 0v-5"/>',
      '<path d="M22 10v6"/>'
    ].join(''),
    resources: [
      '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
      '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5Z"/>'
    ].join(''),
    newFamilyGuide: [
      '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
      '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5Z"/>',
      '<path d="M9 7h6M9 11h6"/>'
    ].join(''),
    team: [
      '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>',
      '<circle cx="10" cy="7" r="4"/>',
      '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
      '<path d="M17 3.13a4 4 0 0 1 0 7.75"/>'
    ].join(''),
    join: [
      '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>',
      '<circle cx="10" cy="7" r="4"/>',
      '<path d="M19 8v6M22 11h-6"/>'
    ].join(''),
    safety: [
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
      '<path d="m9 12 2 2 4-5"/>'
    ].join(''),
    forms: [
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>',
      '<path d="M14 2v6h6"/>',
      '<path d="M8 13h8M8 17h5"/>'
    ].join(''),
    pinewoodDerby: [
      '<path d="M5 16h12l2-4-3-4H8l-3 4Z"/>',
      '<path d="M7 12h10"/>',
      '<circle cx="8" cy="18" r="2"/>',
      '<circle cx="16" cy="18" r="2"/>'
    ].join(''),
    raingutterRegatta: [
      '<path d="M4 19c2 1 4 1 6 0s4-1 6 0 4 1 6 0"/>',
      '<path d="M5 15h14l-2 3H7Z"/>',
      '<path d="M12 4v11"/>',
      '<path d="m12 4 5 7H12Z"/>'
    ].join(''),
    contact: [
      '<rect x="3" y="5" width="18" height="14" rx="2"/>',
      '<path d="m3 7 9 6 9-6"/>'
    ].join(''),
    questionBubble: [
      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/>',
      '<path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 1.9-2.5 3.5"/>',
      '<path d="M12 16h.01"/>'
    ].join(''),
    leadershipShield: [
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
      '<path d="M9 12h6"/>',
      '<path d="M12 9v6"/>'
    ].join(''),
    committee: [
      '<path d="M18 21a4 4 0 0 0-8 0"/>',
      '<circle cx="14" cy="8" r="4"/>',
      '<path d="M6 21v-2a3 3 0 0 1 3-3"/>',
      '<path d="M6 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>'
    ].join(''),
    familyGroup: [
      '<circle cx="12" cy="8" r="3"/>',
      '<circle cx="5.5" cy="10" r="2.5"/>',
      '<circle cx="18.5" cy="10" r="2.5"/>',
      '<path d="M7 21v-2a5 5 0 0 1 10 0v2"/>',
      '<path d="M1.5 21v-1.5A4.5 4.5 0 0 1 6 15M22.5 21v-1.5A4.5 4.5 0 0 0 18 15"/>'
    ].join(''),
    fleurDeLis: [
      '<path d="M12 22V8"/>',
      '<path d="M12 8c-1.8-2.4-1.8-4.4 0-6 1.8 1.6 1.8 3.6 0 6Z"/>',
      '<path d="M12 10c-2.7-3-6.8-2.8-8.5.7 3.8-.6 5.4 1.2 5.5 4.3H5.5"/>',
      '<path d="M12 10c2.7-3 6.8-2.8 8.5.7-3.8-.6-5.4 1.2-5.5 4.3h3.5"/>',
      '<path d="M8.5 18h7M9.5 21h5"/>'
    ].join(''),
    school: [
      '<path d="m3 10 9-6 9 6"/>',
      '<path d="M5 9v11h14V9"/>',
      '<path d="M9 20v-6h6v6M8 11h.01M12 11h.01M16 11h.01"/>'
    ].join(''),
    locationPin: [
      '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/>',
      '<circle cx="12" cy="10" r="2.5"/>'
    ].join(''),
    fallback: [
      '<path d="M8 2v4M16 2v4M3.5 9.5h17M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/>',
      '<path d="m8 16 2.2 2.2L16 12.4"/>'
    ].join('')
  };

  const icons = {
    packMeeting: iconPaths.packMeeting,
    calendar: iconPaths.calendar,
    visitMeeting: iconPaths.visitMeeting,
    camping: iconPaths.camping,
    fishing: iconPaths.fishing,
    hiking: iconPaths.hiking,
    service: iconPaths.service,
    blueGold: iconPaths.blueGold,
    graduation: iconPaths.graduation,
    resources: iconPaths.resources,
    volunteerHelp: iconPaths.service,
    newFamilyGuide: iconPaths.newFamilyGuide,
    volunteer: iconPaths.service,
    team: iconPaths.team,
    join: iconPaths.join,
    contact: iconPaths.contact,
    questionBubble: iconPaths.questionBubble,
    leadershipShield: iconPaths.leadershipShield,
    committee: iconPaths.committee,
    familyGroup: iconPaths.familyGroup,
    fleurDeLis: iconPaths.fleurDeLis,
    school: iconPaths.school,
    locationPin: iconPaths.locationPin,
    safety: iconPaths.safety,
    forms: iconPaths.forms,
    pinewoodDerby: iconPaths.pinewoodDerby,
    raingutterRegatta: iconPaths.raingutterRegatta,
    'calendar-days': iconPaths.calendar,
    'user-round-plus': iconPaths.visitMeeting,
    'users-round': iconPaths.packMeeting,
    'calendar-check': iconPaths.fallback
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
    supportedKeys: Object.freeze(Object.keys(icons)),
  };

  document.addEventListener('DOMContentLoaded', () => hydrate());
}());
