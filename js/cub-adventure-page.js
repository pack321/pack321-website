(function () {
  const rankMap = window.cubScoutRanks || {};
  const rankOrder = window.cubScoutRankOrder || Object.keys(rankMap);
  const app = document.querySelector('[data-rank-app]');
  if (!app) return;
  if (app.dataset.static === 'true') return;

  const mode = app.dataset.mode || 'rank';
  const rankSlug = app.dataset.rank || getRankSlug();
  const adventureSlug = app.dataset.adventure || getAdventureSlug();
  const rank = rankMap[rankSlug];

  if (!rank) {
    renderNotFound(app);
    return;
  }

  document.documentElement.style.setProperty('--rank-accent', rank.accentColor);

  if (mode === 'adventure') {
    renderAdventureDetail(app, rank, adventureSlug);
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
    return `
      <aside class="rank-official-card" aria-label="Official Adventure Requirements">
        <div class="rank-official-card__icon" aria-hidden="true">i</div>
        <h2>Official Adventure Requirements</h2>
        <p>Adventure requirements are maintained by Scouting America and open in a new tab.</p>
        <a class="button gold rank-official-card__button" href="${currentRank.officialRequirementsUrl}" target="_blank" rel="noopener noreferrer" aria-label="View Official ${escapeHtml(currentRank.name)} Requirements on Scouting America">
          View Official ${escapeHtml(currentRank.name)} Requirements
        </a>
        <a class="rank-official-card__link" href="https://www.scouting.org/programs/cub-scouts/adventures/" target="_blank" rel="noopener noreferrer">Go to Scouting America (opens in new tab)</a>
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
      <a class="rank-required-card" href="${item.href}" aria-label="${escapeHtml(item.name)} adventure details">
        <span class="rank-required-card__image"><img src="${item.icon}" alt="${escapeHtml(item.iconAlt)}"></span>
        <span class="rank-required-card__body">
          <span class="rank-required-card__category">${escapeHtml(item.category)}</span>
          <strong>${escapeHtml(item.name)}</strong>
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
      <a class="rank-elective-card" href="${item.href}" aria-label="${escapeHtml(item.name)} adventure details">
        <span class="rank-elective-card__icon"><img src="${item.icon}" alt="${escapeHtml(item.iconAlt)}"></span>
        <span>${escapeHtml(item.name)}</span>
        <b aria-hidden="true">></b>
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

  function renderRequirements(adventure) {
    if (!adventure.requirements || adventure.requirements.length === 0) {
      return `
        <div class="rank-requirements-empty">
          <h2>Official Requirements</h2>
          <p>Scouting America maintains the official current requirements for this adventure. Use the official source link to view and print the published requirements.</p>
          <a class="button gold" href="${adventure.officialUrl}" target="_blank" rel="noopener noreferrer">View Official ${escapeHtml(adventure.name)} Requirements</a>
        </div>
      `;
    }

    const renderItems = (items) => `<ol class="rank-requirements-list">${items.map((item) => `
      <li>
        <strong>${escapeHtml(item.label)}</strong>
        <p>${escapeHtml(item.text)}</p>
        ${item.children && item.children.length ? renderItems(item.children) : ''}
      </li>`).join('')}
    </ol>`;

    return `
      <section class="rank-requirements" aria-labelledby="official-requirements-heading">
        <h2 id="official-requirements-heading">Official Requirements</h2>
        ${renderItems(adventure.requirements)}
      </section>
    `;
  }

  function renderAdventureDetail(target, currentRank, currentAdventureSlug) {
    const allAdventures = currentRank.requiredAdventures.concat(currentRank.electiveAdventures);
    const adventure = allAdventures.find((item) => item.slug === currentAdventureSlug);
    if (!adventure) {
      renderNotFound(target);
      return;
    }

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
            <p class="rank-detail__meta">${escapeHtml(adventure.category)} · ${currentRank.requiredAdventures.some((item) => item.slug === adventure.slug) ? 'Required' : 'Elective'}</p>
            <p>${escapeHtml(adventure.description)}</p>
            <div class="rank-detail-placeholder__actions">
              <a class="button gold" href="${adventure.officialUrl}" target="_blank" rel="noopener noreferrer">Official Source</a>
              <button class="button rank-print-button" type="button" onclick="window.print()">Print Requirements</button>
              <a class="button" href="/cub-scouts/adventures/${currentRank.slug}/">Back to ${escapeHtml(currentRank.name)} Adventures</a>
            </div>
          </div>
        </div>
        <div class="wrap rank-detail__requirements">
          ${renderRequirements(adventure)}
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
