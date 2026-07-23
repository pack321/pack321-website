const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataPath = path.join(root, 'assets', 'data', 'leaders.json');
const teamPath = path.join(root, 'team', 'index.html');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const fallbackLeader = '/assets/images/placeholders/leader-placeholder.jpg';
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

const denHelpButton = (person) => {
  const den = person.den || person.role || 'this den';
  return `<a class="leader-contact-button den-help-button" href="mailto:volunteer@pack321wi.org" aria-label="Volunteer to help ${esc(den)}">Help This Den</a>`;
};

const imgTag = (person) => {
  const alt = hasPerson(person) ? person.name : person.role;
  return `<img src="${asset(person.photo)}" alt="${esc(alt)}" data-fallback="${fallbackLeader}" onerror="this.onerror=null;this.src='${fallbackLeader}';">`;
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
  const action = vacant ? denHelpButton(person) : '';
  return `        <article class="${className}">${imgTag(person)}<h3>${esc(person.role)}</h3><p class="den-name">${esc(name)}</p>${service}<span>${esc(person.favorite)}</span>${action}</article>`;
};

const assistantRow = (person) => {
  const service = person.started ? `<span>${esc(person.den || person.role)} &bull; Serving since ${esc(person.started)}</span>` : `<span>${esc(person.den || person.role)}</span>`;
  return `        <div>${imgTag(person)}<strong>${esc(person.name)}</strong>${service}</div>`;
};

const committeeCard = (person) => {
  const vacant = !hasPerson(person);
  const className = vacant ? 'committee-card profile-card team-function' : 'committee-card profile-card';
  const personMeta = hasPerson(person) ? `<span class="committee-card__person">${esc(person.name)}</span>` : '';
  return `        <article class="${className}">${imgTag(person)}<h3>${esc(person.role)}</h3><p>${esc(person.bio)}</p><div class="committee-card__contact">${contactButton(person)}</div>${personMeta}</article>`;
};

function replaceBetween(html, start, end, replacement) {
  const pattern = new RegExp(`(${start})([\\s\\S]*?)(${end})`);
  if (!pattern.test(html)) throw new Error(`Could not find Team page block: ${start}`);
  return html.replace(pattern, `$1\n${replacement}\n$3`);
}

let html = fs.readFileSync(teamPath, 'utf8');

html = html.replace(
  /<div><span>Dedicated Leaders<\/span><strong>[^<]+<\/strong><\/div>\s*<div><span>Annual Adventures<\/span><strong>[^<]+<\/strong><\/div>\s*<div><span>Years of Adventure<\/span><strong>[^<]+<\/strong><\/div>/,
  '<div><span>Pack Type</span><strong>Boys &amp; Girls</strong></div>\n        <div><span>Families Welcome From</span><strong>Any School</strong></div>\n        <div><span>Communities Served</span><strong>Oak Creek Area</strong></div>'
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
  '\\s*</div>\\s*</div>\\s*<aside>',
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
  '\\s*</div>\\s*</div>\\s*<article class="commitment-card premium-card">',
  data.committee.map(committeeCard).join('\n')
);

fs.writeFileSync(teamPath, html);
console.log('Generated Team page cards from assets/data/leaders.json.');
