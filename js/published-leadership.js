/* Explicit public contract. No identity, household, membership or draft fields. */
(function (root) {
  'use strict';
  const roles = {
    'committee chair': ['executive', 'committee-chair'],
    'cubmaster': ['executive', 'cubmaster'],
    'assistant cubmaster': ['executive', 'assistant-cubmaster'],
    'secretary / communications': ['executive', 'secretary'],
    'treasurer': ['executive', 'treasurer'],
    'assistant treasurer': ['executive', 'assistant-treasurer'],
    'arrow of light assistant den leader': ['assistants', 'arrow-of-light-assistant'],
    'advancement chair': ['committee', 'advancement-chair'],
    'popcorn kernel': ['committee', 'popcorn-kernel'],
    'wreath coordinator': ['committee', 'wreath-coordinator'],
    'sports / professional sporting events': ['committee', 'sports-events'],
    'candy bar fundraiser': ['committee', 'candy-bar-fundraiser']
  };
  for (const rank of ['lion', 'tiger', 'wolf', 'bear', 'webelos', 'arrow of light']) {
    roles[rank + ' den leader'] = ['dens', rank.replaceAll(' ', '-') + '-den-leader'];
  }
  const text = (value, required = false, max = 5000) => {
    if (value == null && !required) return '';
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw Error('Invalid public text');
    return value;
  };
  const number = (value, min, max) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw Error('Invalid public number');
    return value;
  };
  function photo(value) {
    if (!value) return '';
    const url = new URL(text(value, true, 2048), 'https://pack321wi.org');
    if (url.protocol !== 'https:' || url.username || url.password) throw Error('Invalid public photo');
    return url.href;
  }
  function project(payload) {
    if (!payload || !Array.isArray(payload.leaders) || payload.leaders.length > 100) throw Error('Invalid publication');
    const groups = {executive: [], dens: [], assistants: [], committee: []};
    const rows = payload.leaders.map(row => {
      if (!row || typeof row !== 'object') throw Error('Invalid public leader');
      // Deliberately do not spread input or merge it into the local fallback.
      const role = text(row.role, true, 200);
      const key = role.trim().toLowerCase().replace(/\s+/g, ' ');
      const [section, roleKey] = roles[key] || [/assistant.*den|den.*assistant/.test(key) ? 'assistants' : 'committee', ''];
      const email = text(row.email, false, 254);
      if (email && !/^[^\s@<>"?&#]+@[^\s@<>"?&#]+\.[^\s@<>"?&#]+$/.test(email)) throw Error('Invalid public email');
      return {section, roleKey, name: text(row.name, true, 160), role,
        secondaryRole: text(row.secondaryRole, false, 200), started: number(row.started, 1900, 2200),
        email, bio: text(row.bio), favorite: text(row.favorite), photoUrl: photo(row.photoUrl),
        focalX: number(row.focalX, 0, 100), focalY: number(row.focalY, 0, 100), sortOrder: number(row.sortOrder, 0, 1000000)};
    });
    rows.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const {section, ...row} of rows) groups[section].push(row);
    return groups; // A valid empty publication clears all cards; never resurrect fallback leaders.
  }
  async function load(url, fetcher = fetch) {
    const endpoint = new URL(url);
    if (endpoint.protocol !== 'https:' || endpoint.pathname !== '/api/public/leadership' ||
        !['pack321wi.org', 'preview-hq.pack321wi.org', 'hq.pack321wi.org'].includes(endpoint.hostname) || endpoint.search || endpoint.hash || endpoint.port || endpoint.username || endpoint.password) throw Error('Unapproved publication source');
    const response = await fetcher(endpoint.href, {credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(5000)});
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw Error('Publication unavailable');
    const body = await response.text();
    if (body.length > 512000) throw Error('Publication too large');
    return project(JSON.parse(body));
  }
  const api = {project, load};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Pack321PublishedLeadership = api;
}(globalThis));
