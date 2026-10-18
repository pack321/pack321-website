(function () {
  const fallbackLeader = '/assets/images/leaders/Standard.jpg';
  let leaderImageByRole = Object.freeze({});
  let denBadgeByRole = Object.freeze({});
  let committeeEmblemByRole = Object.freeze({});
  const esc = (value) => String(value || '').replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
  const asset = (value) => {
    const clean = String(value || 'assets/images/placeholders/leader-placeholder.jpg');
    return clean.startsWith('/') ? clean : '/' + clean;
  };
  const hasPerson = (person) => Boolean(String(person.name || '').trim());
  const leaderImage = (person) => person.photoUrl || (person.focalX === undefined ? leaderImageByRole[person.roleKey] : '') || fallbackLeader;
  const imgTag = (person, className) => {
    const alt = hasPerson(person) ? person.name : person.role;
    return '<img class="' + esc(className || 'leader-card__photo') + '" src="' + esc(leaderImage(person)) + '"' + (person.focalX === undefined ? '' : ' style="object-position:' + person.focalX + '% ' + person.focalY + '%"') + ' alt="' + esc(alt) + ', ' + esc(person.role) + '" onerror="this.onerror=null; this.src=&quot;' + fallbackLeader + '&quot;;">';
  };
  const yearsBadge = (started) => {
    const year = Number(started);
    if (!year) return '';
    const years = Math.max(0, new Date().getFullYear() - year);
    if (years === 0) return 'New';
    return years + '+ ' + (years === 1 ? 'Year' : 'Years');
  };
  const serviceLine = (person, prefix) => person.started ? '<p class="leader-since">' + esc(prefix || 'Serving Pack 321 since') + ' ' + esc(person.started) + '</p>' : '';
  const contactLabel = (person) => {
    if (person.contactLabel) return person.contactLabel;
    const role = String(person.role || '');
    if (/assistant cubmaster/i.test(role)) return 'Contact Assistant';
    if (/committee chair/i.test(role)) return 'Contact Chair';
    if (/cubmaster/i.test(role)) return 'Contact Cubmaster';
    if (/secretary/i.test(role)) return 'Contact Secretary';
    if (/treasurer/i.test(role)) return 'Contact Treasurer';
    if (/advancement/i.test(role)) return 'Contact Advancement';
    if (/popcorn/i.test(role)) return 'Contact Popcorn';
    if (/wreath/i.test(role)) return 'Contact Wreaths';
    if (/sports/i.test(role)) return 'Contact Sports';
    if (/candy/i.test(role)) return 'Contact Candy Bars';
    return 'Contact Leader';
  };
  const emailLink = (person) => {
    if (!person.email) return '';
    const label = contactLabel(person);
    const aria = person.role ? label + ': ' + person.role : label;
    return '<a class="leader-contact-button" href="' + (person.email ? 'mailto:' + esc(person.email) : '/volunteer/') + '" aria-label="' + esc(aria) + '">' + esc(label) + '</a>';
  };
  const leaderCard = (person) => {
    const secondary = person.secondaryRole ? '<p class="leader-secondary-role">' + esc(person.secondaryRole) + '</p>' : '';
    return '<article class="leader-card premium-card"><div class="leader-photo-wrap">' + imgTag(person) + '<span class="years-badge">' + esc(yearsBadge(person.started)) + '</span></div><div class="leader-body"><h3>' + esc(person.name) + '</h3><p class="leader-role">' + esc(person.role) + '</p>' + secondary + serviceLine(person) + '<p>' + esc(person.bio) + '</p>' + emailLink(person) + '<div class="leader-favorite"><span>Favorite Activity</span><strong>' + esc(person.favorite) + '</strong></div></div></article>';
  };
  const denCard = (person) => {
    const vacant = !hasPerson(person);
    const name = vacant ? 'Volunteer Opportunity' : person.name;
    const service = person.started ? '<p>Serving since ' + esc(person.started) + '</p>' : '<p>Role available for a Pack volunteer</p>';
    const badgeSrc = denBadgeByRole[person.roleKey];
    const rankClass = person.roleKey === 'arrow-of-light-den-leader' ? ' leadership-role-card__badge--aol' : '';
    return '<a class="den-card profile-card den-leader-card leadership-role-card leadership-role-card--den' + (vacant ? ' vacant' : '') + '" href="/volunteer/" aria-label="Contact Pack 321 about the ' + esc(person.role) + ' role"><span class="leadership-role-card__media">' + imgTag(person, 'leader-card__photo leadership-role-card__photo') + '<img class="leadership-role-card__badge' + rankClass + '" src="' + esc(badgeSrc) + '" alt="" aria-hidden="true"></span><h3 class="leadership-role-card__title">' + esc(person.role) + '</h3><div class="leadership-role-card__identity"><p class="den-name">' + esc(name) + '</p>' + service + '</div><span class="leadership-role-card__divider" aria-hidden="true"></span><span class="leadership-role-card__message">' + esc(person.favorite) + '</span><span class="leadership-role-card__cta"><span>Click Here</span><span aria-hidden="true">&rarr;</span></span></a>';
  };
  const publicCommitteeMeta = (person) => hasPerson(person) ? '<strong>' + esc(person.name) + '</strong>' : '';
  const committeeCard = (person) => {
    const emblemSrc = committeeEmblemByRole[person.roleKey];
    const emblem = emblemSrc ? '<img class="leadership-role-card__badge" src="' + esc(emblemSrc) + '" alt="" aria-hidden="true">' : '';
    return '<a class="committee-card profile-card leadership-role-card leadership-role-card--committee' + (!hasPerson(person) ? ' team-function' : '') + '" href="' + (person.email ? 'mailto:' + esc(person.email) : '/volunteer/') + '" aria-label="' + esc(person.contactLabel || ('Contact ' + person.role)) + ': ' + esc(person.role) + '"><span class="leadership-role-card__media">' + imgTag(person, 'leader-card__photo leadership-role-card__photo') + emblem + '</span><h3 class="leadership-role-card__title">' + esc(person.role) + '</h3><div class="leadership-role-card__identity">' + publicCommitteeMeta(person) + '</div><span class="leadership-role-card__divider" aria-hidden="true"></span><span class="leadership-role-card__message">' + esc(person.bio) + '</span><span class="leadership-role-card__cta"><span>Click Here</span><span aria-hidden="true">&rarr;</span></span></a>';
  };
  const assistantRow = (person) => {
    const service = person.started ? esc(person.den || person.role) + ' &bull; Serving since ' + esc(person.started) : esc(person.den || person.role);
    return '<div>' + imgTag(person) + '<strong>' + esc(person.name) + '</strong><span>' + service + '</span></div>';
  };

  async function loadTeamData() {
    try {
      const [response, imageResponse, badgeResponse, emblemResponse] = await Promise.all([
        fetch('/assets/data/leaders.json', { cache: 'no-store', signal: AbortSignal.timeout(5000) }),
        fetch('/assets/data/leader-images.json', { cache: 'no-store', signal: AbortSignal.timeout(5000) }),
        fetch('/assets/data/den-badges.json', { cache: 'no-store', signal: AbortSignal.timeout(5000) }),
        fetch('/assets/data/committee-emblems.json', { cache: 'no-store', signal: AbortSignal.timeout(5000) })
      ]);
      if (response.ok && imageResponse.ok && badgeResponse.ok && emblemResponse.ok) {
        leaderImageByRole = Object.freeze(await imageResponse.json());
        denBadgeByRole = Object.freeze(await badgeResponse.json());
        committeeEmblemByRole = Object.freeze(await emblemResponse.json());
        return await response.json();
      }
    } catch (error) { console.warn('Pack 321 team data could not be loaded.', error); }
    return null;
  }

  function applyTeamData(data) {
    if (!data) return;
    const executive = document.querySelector('.executive-grid');
    if (executive && data.executive) executive.innerHTML = data.executive.map(leaderCard).join('');
    const dens = document.querySelector('.den-grid');
    if (dens && data.dens) dens.innerHTML = data.dens.map(denCard).join('');
    const assistants = document.querySelector('.assistant-list');
    if (assistants && data.assistants) assistants.innerHTML = data.assistants.map(assistantRow).join('');
    const committee = document.querySelector('.committee-grid');
    if (committee && data.committee) committee.innerHTML = data.committee.map(committeeCard).join('');
  }

  async function refreshTeam() {
    const fallback = await loadTeamData();
    applyTeamData(fallback);
    try {
      const configResponse = await fetch('/assets/data/leadership-source.json', {cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(5000)});
      if (!configResponse.ok) return;
      const config = await configResponse.json();
      const published = await Pack321PublishedLeadership.load(config.url);
      applyTeamData(published);
      document.documentElement.dataset.leadershipSource = 'published';
    } catch {
      // Local JSON and pre-rendered cards remain the final fallback, including offline/no-JS.
      document.documentElement.dataset.leadershipSource = 'fallback';
    }
  }
  refreshTeam();
}());
