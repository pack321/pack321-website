(function () {
  const rankMap = window.cubScoutRanks || {};
  const rankOrder = window.cubScoutRankOrder || Object.keys(rankMap);
  const app = document.querySelector('[data-rank-app]');
  if (!app) return;
  if (app.dataset.static === 'true') return;

  const mode = app.dataset.mode || 'rank';
  const rankSlug = app.dataset.rank || getRankSlug();
  const rank = rankMap[rankSlug];

  if (!rank) {
    renderNotFound(app);
    return;
  }

  document.documentElement.style.setProperty('--rank-accent', rank.accentColor);

  if (mode === 'adventure') {
    renderAdventureDetail(app, rank, getAdventureSlug());
  } else {
    renderRankPage(app, rank);
  }

  function getRankSlug() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const adventuresIndex = parts.indexOf('adventures');
    return adventuresIndex >= 0 ? parts[adventuresIndex + 1] : '';
  }

  function getAdventureSlug() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const adventuresIndex = parts.indexOf('adventures');
    return adventuresIndex >= 0 ? parts[adventuresIndex + 2] : '';
  }

  function renderRankPage(target, currentRank) {
    const required = renderRequiredSection(currentRank);
    const electives = renderElectiveSection(currentRank);
    target.innerHTML = `
      ${renderBreadcrumbs(currentRank)}
      <section class="rank-adventure-hero">
        <div class="wrap rank-adventure-hero__grid">
          <div class="rank-adventure-hero__intro">
            <img class="rank-adventure-hero__emblem" src="${currentRank.emblem}" width="${currentRank.emblemWidth}" height="${currentRank.emblemHeight}" alt="${escapeHtml(currentRank.name)} rank emblem">
            <div class="rank-adventure-hero__copy">
              <p class="rank-adventure-kicker">Cub Scout Adventures</p>
              <h1>${escapeHtml(currentRank.title)}</h1>
              <span class="rank-adventure-underline" aria-hidden="true"></span>
              <p>${escapeHtml(currentRank.introduction)}</p>
              <dl class="rank-adventure-facts">
                <div><dt>Grade</dt><dd>${escapeHtml(currentRank.grade)}</dd></div>
                <div><dt>Typical age range</dt><dd>${escapeHtml(currentRank.ageRange)}</dd></div>
              </dl>
            </div>
          </div>
          ${renderOfficialCard(currentRank)}
        </div>
      </section>
      ${renderDivider(currentRank)}
      <section class="rank-source-note-section">
        <div class="wrap">
          <aside class="rank-source-note" aria-label="Official requirements notice">
            <span class="rank-source-note__icon" aria-hidden="true">i</span>
            <p>Adventure requirements are maintained by Scouting America. Selecting an adventure will open its official requirements in a new tab.</p>
          </aside>
        </div>
      </section>
      ${required}
      ${electives}
      ${renderDisclaimer()}
    `;
  }

  function renderBreadcrumbs(currentRank) {
    return `
      <nav class="rank-breadcrumbs wrap" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">></span>
        <a href="/cub-scouts.html">Cub Scouts</a>
        <span aria-hidden="true">></span>
        <a href="/cub-scouts/adventures/${currentRank.slug}/">${escapeHtml(currentRank.name)}</a>
        <span aria-hidden="true">></span>
        <span>Adventures</span>
      </nav>
    `;
  }

  function renderOfficialCard(currentRank) {
    const ctaLabel = `View Official ${currentRank.name} Requirements`;
    const officialUrl = currentRank.officialRankUrl || currentRank.officialRequirementsUrl;
    return `
      <aside class="rank-official-card" aria-label="Official Adventure Requirements">
        <div class="rank-official-card__icon" aria-hidden="true">i</div>
        <h2>Official Adventure Requirements</h2>
        <p>Adventure requirements are maintained by Scouting America and open in a new tab.</p>
        <a class="button gold rank-official-card__button" href="${officialUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(ctaLabel)} on Scouting America">
          ${escapeHtml(ctaLabel)} <span class="rank-external-indicator" aria-hidden="true">&#8599;</span>
        </a>
      </aside>
    `;
  }

  function renderDivider(currentRank) {
    return `
      <div class="wrap rank-divider" aria-hidden="true">
        <span></span>
        <img src="${currentRank.emblem}" width="${currentRank.emblemWidth}" height="${currentRank.emblemHeight}" alt="">
        <span></span>
      </div>
    `;
  }

  function renderRequiredSection(currentRank) {
    return `
      <section class="rank-section">
        <div class="wrap">
          <h2>Required Adventures</h2>
          <div class="rank-required-grid">
            ${currentRank.requiredAdventures.map((item) => renderRequiredCard(item)).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderRequiredCard(item) {
    return `
      <a class="rank-required-card" href="${item.officialUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open official ${escapeHtml(item.name)} adventure requirements on Scouting America">
        <span class="rank-required-card__image"><img src="${item.icon}" alt="${escapeHtml(item.iconAlt)}"></span>
        <span class="rank-required-card__body">
          <span class="rank-required-card__category">${escapeHtml(item.category)}</span>
          <strong>${escapeHtml(item.name)} <span class="rank-external-indicator" aria-hidden="true">&#8599;</span></strong>
          <span>${escapeHtml(item.description)}</span>
        </span>
      </a>
    `;
  }

  function renderElectiveSection(currentRank) {
    return `
      <section class="rank-section rank-section--elective">
        <div class="wrap">
          <h2>Elective Adventures</h2>
          <div class="rank-elective-grid">
            ${currentRank.electiveAdventures.map((item) => renderElectiveCard(item)).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderElectiveCard(item) {
    return `
      <a class="rank-elective-card" href="${item.officialUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open official ${escapeHtml(item.name)} adventure requirements on Scouting America">
        <span class="rank-elective-card__icon"><img src="${item.icon}" alt="${escapeHtml(item.iconAlt)}"></span>
        <span>${escapeHtml(item.name)}</span>
        <b class="rank-external-indicator" aria-hidden="true">&#8599;</b>
      </a>
    `;
  }

  function renderDisclaimer() {
    return `
      <section class="rank-disclaimer-section">
        <div class="wrap">
          <aside class="rank-disclaimer" aria-label="Adventure source note">
            <span class="rank-disclaimer__icon" aria-hidden="true">i</span>
            <div>
              <h2>Please Note</h2>
              <p>Pack 321 adventure information is provided for convenience. Scouting America maintains the official requirements.</p>
            </div>
            <a class="button light" href="/cub-scouts.html">About Cub Scouts</a>
          </aside>
        </div>
      </section>
    `;
  }

  function adventureType(currentRank, adventure) {
    return currentRank.requiredAdventures.some((item) => item.slug === adventure.slug) ? 'Required' : 'Elective';
  }

  function renderAdventureDetail(target, currentRank, adventureSlug) {
    const adventure = currentRank.requiredAdventures.concat(currentRank.electiveAdventures)
      .find((item) => item.slug === adventureSlug);
    if (!adventure) {
      renderNotFound(target);
      return;
    }

    const type = adventureType(currentRank, adventure);
    document.title = `${adventure.name} | ${currentRank.name} Adventures | Pack 321`;
    target.innerHTML = `
      <nav class="rank-breadcrumbs wrap" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">></span>
        <a href="/cub-scouts.html">Cub Scouts</a>
        <span aria-hidden="true">></span>
        <a href="/cub-scouts/adventures/${currentRank.slug}/">${escapeHtml(currentRank.name)}</a>
        <span aria-hidden="true">></span>
        <span>${escapeHtml(adventure.name)}</span>
      </nav>
      <section class="rank-detail">
        <div class="wrap rank-detail__grid">
          <div class="rank-detail__media">
            <img src="${adventure.icon}" width="360" height="360" alt="${escapeHtml(adventure.iconAlt)}">
          </div>
          <div class="rank-detail__copy">
            <p class="rank-adventure-kicker">${escapeHtml(currentRank.name)} Adventure</p>
            <h1>${escapeHtml(adventure.name)}</h1>
            <p class="rank-detail__meta">${type}</p>
            <p>${escapeHtml(adventure.description)}</p>
            <div class="rank-detail-actions">
              <a class="button gold rank-detail-actions__official" href="${adventure.officialUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open official ${escapeHtml(adventure.name)} requirements on Scouting America">View Official ${escapeHtml(adventure.name)} Requirements <span class="rank-external-indicator" aria-hidden="true">&#8599;</span></a>
              <a class="button rank-detail-actions__back" href="/cub-scouts/adventures/${currentRank.slug}/">Back to ${escapeHtml(currentRank.name)} Adventures</a>
            </div>
          </div>
        </div>
        <div class="wrap rank-detail__requirements">
          <section class="rank-requirements-info" aria-labelledby="official-requirements-heading">
            <h2 id="official-requirements-heading">Official Requirements</h2>
            <p>Scouting America maintains the official current requirements for this adventure. Use the button above to open the official requirements in a new tab.</p>
          </section>
        </div>
      </section>
      ${renderDisclaimer()}
    `;
  }

  function renderNotFound(target) {
    target.innerHTML = `
      <section class="rank-detail-placeholder">
        <div class="wrap rank-detail-placeholder__copy">
          <p class="rank-adventure-kicker">Page not found</p>
          <h1>Adventure Page Not Found</h1>
          <p>The requested Cub Scout rank or adventure could not be found.</p>
          <a class="button gold" href="/cub-scouts.html">Back to Cub Scouts</a>
        </div>
      </section>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}());
