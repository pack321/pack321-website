const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataPath = path.join(root, 'assets', 'data', 'leaders.json');
const leaderImagesPath = path.join(root, 'assets', 'data', 'leader-images.json');
const denBadgesPath = path.join(root, 'assets', 'data', 'den-badges.json');
const teamPath = path.join(root, 'team', 'index.html');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const leaderImageByRole = Object.freeze(JSON.parse(fs.readFileSync(leaderImagesPath, 'utf8')));
const denBadgeByRole = Object.freeze(JSON.parse(fs.readFileSync(denBadgesPath, 'utf8')));

const fallbackLeader = '/assets/images/leaders/Standard.jpg';
const currentYear = new Date().getFullYear();

const esc = (value) => String(value ?? '').replace(/[&<>"]/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
}[char]));

const asset = (value) => {
  const clean = String(value || 'assets/images/placeholders/leader-placeholder.jpg');
  return clean.startsWith('/') ? clean : `/${clean}`;
};

const hasPerson = (person) => Boolean(String(person.name || '').trim());
const leaderImage = (person) => leaderImageByRole[person.roleKey] || fallbackLeader;

const yearsBadge = (started) => {
  const year = Number(started);
  if (!year) return '';
  const years = Math.max(0, currentYear - year);
  if (years === 0) return 'New';
  return `${years}+ ${years === 1 ? 'Year' : 'Years'}`;
};

const serviceLine = (person, prefix = 'Serving Pack 321 since') => {
  if (!person.started) return '';
  return `<p class="leader-since">${prefix} ${esc(person.started)}</p>`;
};

const contactButton = (person) => {
  if (!person.email) return '';
  const label = person.contactLabel || 'Contact Leader';
  const aria = person.role ? `${label}: ${person.role}` : label;
  return `<a class="leader-contact-button" href="mailto:${esc(person.email)}" aria-label="${esc(aria)}">${esc(label)}</a>`;
};

const imgTag = (person, className = 'leader-card__photo') => {
  const alt = hasPerson(person) ? person.name : person.role;
  return `<img class="${className}" src="${leaderImage(person)}" alt="${esc(alt)}, ${esc(person.role)}" data-fallback="${fallbackLeader}" onerror="this.onerror=null;this.src='${fallbackLeader}';">`;
};

const executiveCard = (person) => {
  const secondary = person.secondaryRole ? `<p class="leader-secondary-role">${esc(person.secondaryRole)}</p>` : '';
  return `      <article class="leader-card premium-card">
      <div class="leader-photo-wrap">${imgTag(person)}<span class="years-badge">${esc(yearsBadge(person.started))}</span></div>
      <div class="leader-body"><h3>${esc(person.name)}</h3><p class="leader-role">${esc(person.role)}</p>${secondary}${serviceLine(person)}<p>${esc(person.bio)}</p>${contactButton(person)}<div class="leader-favorite"><span>Favorite Activity</span><strong>${esc(person.favorite)}</strong></div></div>
    </article>`;
};

const denCard = (person) => {
  const vacant = !hasPerson(person);
  const className = vacant ? 'den-card profile-card vacant' : 'den-card profile-card';
  const name = vacant ? 'Volunteer Opportunity' : person.name;
  const service = person.started ? `<p>Serving since ${esc(person.started)}</p>` : '<p>Role available for a Pack volunteer</p>';
  const badgeSrc = denBadgeByRole[person.roleKey];
  const rankClass = person.roleKey === 'arrow-of-light-den-leader' ? ' den-card__rank--aol' : '';
  return `        <a class="${className} den-leader-card" href="/volunteer/" aria-label="Contact Pack 321 about the ${esc(person.role)} role"><span class="den-card__media">${imgTag(person, 'leader-card__photo den-card__photo')}<img class="den-card__rank${rankClass}" src="${badgeSrc}" alt="" aria-hidden="true"></span><h3 class="den-card__title">${esc(person.role)}</h3><div class="den-card__identity"><p class="den-name">${esc(name)}</p>${service}</div><span class="den-card__divider" aria-hidden="true"></span><span class="den-card__message">${esc(person.favorite)}</span><span class="den-card__cta"><span>Click Here</span><span aria-hidden="true">&rarr;</span></span></a>`;
};

const assistantRow = (person) => {
  const service = person.started ? `<span>${esc(person.den || person.role)} &bull; Serving since ${esc(person.started)}</span>` : `<span>${esc(person.den || person.role)}</span>`;
  return `        <div>${imgTag(person)}<strong>${esc(person.name)}</strong>${service}</div>`;
};

const committeeCard = (person) => {
  const vacant = !hasPerson(person);
  const className = vacant ? 'committee-card profile-card team-function' : 'committee-card profile-card';
  const personMeta = hasPerson(person) ? `<span class="committee-card__person">${esc(person.name)}</span>` : '';
  return `        <a class="${className}" href="mailto:${esc(person.email)}" aria-label="${esc(person.contactLabel || `Contact ${person.role}`)}: ${esc(person.role)}"><span class="committee-profile">${imgTag(person)}</span><h3>${esc(person.role)}</h3><span class="committee-divider" aria-hidden="true"></span><p>${esc(person.bio)}</p><span class="committee-card__cta">Click Here <b aria-hidden="true">&rarr;</b></span>${personMeta}</a>`;
};

function replaceBetween(html, start, end, replacement) {
  const pattern = new RegExp(`(${start})([\\s\\S]*?)(${end})`);
  if (!pattern.test(html)) throw new Error(`Could not find Team page block: ${start}`);
  return html.replace(pattern, (_match, startMatch, _body, endMatch) => (
    `${startMatch}\n${replacement}${endMatch.replace(/^(?:\r?\n)+/, '\n')}`
  ));
}

let html = fs.readFileSync(teamPath, 'utf8');

html = replaceBetween(
  html,
  '<div class="pack-glance-grid">',
  '\\s*</div>\\s*</article>',
  [
    '        <article class="pack-glance-stat"><div class="pack-glance-stat__icon" data-card-icon="calendar" aria-hidden="true"></div><h3 class="pack-glance-stat__label">Serving<br>Families Since</h3><span class="pack-glance-stat__divider" aria-hidden="true"></span><div class="pack-glance-stat__value"><span>1967</span></div><p class="pack-glance-stat__description">Over five decades of Scouting</p></article>',
    '        <article class="pack-glance-stat"><div class="pack-glance-stat__icon" data-card-icon="familyGroup" aria-hidden="true"></div><h3 class="pack-glance-stat__label">Active<br>Scouts</h3><span class="pack-glance-stat__divider" aria-hidden="true"></span><div class="pack-glance-stat__value"><span>31</span></div><p class="pack-glance-stat__description">Across all Cub Scout ranks</p></article>',
    '        <article class="pack-glance-stat"><div class="pack-glance-stat__icon" data-card-icon="fleurDeLis" aria-hidden="true"></div><h3 class="pack-glance-stat__label">Pack Type</h3><span class="pack-glance-stat__divider" aria-hidden="true"></span><div class="pack-glance-stat__value pack-glance-stat__value--words"><span>Boys &amp;</span><span>Girls</span></div><p class="pack-glance-stat__description">A welcoming family Pack</p></article>',
    '        <article class="pack-glance-stat"><div class="pack-glance-stat__icon" data-card-icon="school" aria-hidden="true"></div><h3 class="pack-glance-stat__label">Schools<br>Welcome</h3><span class="pack-glance-stat__divider" aria-hidden="true"></span><div class="pack-glance-stat__value pack-glance-stat__value--words"><span>Any</span><span>School</span></div><p class="pack-glance-stat__description">Open to the surrounding area</p></article>',
    '        <article class="pack-glance-stat"><div class="pack-glance-stat__icon" data-card-icon="locationPin" aria-hidden="true"></div><h3 class="pack-glance-stat__label">Community</h3><span class="pack-glance-stat__divider" aria-hidden="true"></span><div class="pack-glance-stat__value pack-glance-stat__value--words"><span>Oak</span><span>Creek</span></div><p class="pack-glance-stat__description">And surrounding communities</p></article>'
  ].join('\n')
);

html = replaceBetween(
  html,
  '<div class="executive-grid">',
  '\\s*</div>\\s*</div>\\s*</section>\\s*\\n\\s*<section class="page-section cream-section leadership-page">',
  data.executive.map(executiveCard).join('\n')
);

html = replaceBetween(
  html,
  '<div class="den-grid">',
  '\\s*</div>\\s*(?:<a class="den-volunteer-banner"[\\s\\S]*?</a>\\s*)?</div>\\s*<aside>',
  data.dens.map(denCard).join('\n')
);

html = replaceBetween(
  html,
  '<div class="assistant-list premium-card">',
  '\\s*</div>\\s*</aside>',
  data.assistants.map(assistantRow).join('\n')
);

html = replaceBetween(
  html,
  '<div class="committee-grid">',
  '\\s*</div>\\s*</div>\\s*<article class="commitment-card premium-card"',
  data.committee.map(committeeCard).join('\n')
);

fs.writeFileSync(teamPath, html);
console.log('Generated Team page cards from assets/data/leaders.json.');
