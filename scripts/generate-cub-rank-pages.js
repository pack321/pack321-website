const fs = require("fs");
const path = require("path");
const { cubScoutRanks, cubScoutRankOrder } = require("../js/cub-scout-ranks.js");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://pack321wi.org";
const SOCIAL_IMAGE = `${SITE}/assets/seo/pack321-social.png`;
const SOCIAL_ALT = "Cub Scout Pack 321 in Oak Creek, Wisconsin social sharing image";

const legacyRoutes = {
  lion: "cub-lion.html",
  tiger: "cub-tiger.html",
  wolf: "cub-wolf.html",
  bear: "cub-bear.html",
  webelos: "cub-webelos.html",
  "arrow-of-light": "cub-arrow-of-light.html",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fromRoot(depth, target) {
  return `${"../".repeat(depth)}${target}`;
}

function sitePath(target) {
  const cleanRoutes = {
    "index.html": "/",
    "why-pack321.html": "/why-pack321/",
    "cub-scouts.html": "/cub-scouts/",
    "adventures.html": "/adventures/",
    "events-calendar.html": "/calendar/",
    "resources.html": "/resources/",
    "team.html": "/team/",
    "join.html": "/join/",
    "contact.html": "/contact/",
  };
  return cleanRoutes[target] || `/${target}`;
}

function faviconLinks() {
  return [
    '<link rel="icon" href="/favicon.ico?v=3" sizes="any">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=3">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3">',
    '<link rel="manifest" href="/site.webmanifest?v=3">',
    '<meta name="theme-color" content="#0D1B2A">',
  ].map((line) => `  ${line}`).join("\n");
}

function metadata({ title, description, canonical }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);
  const orgJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cub Scout Pack 321",
    url: `${SITE}/`,
    logo: `${SITE}/assets/logos/cub-scout-logo.svg`,
  });
  return [
    `  <title>${safeTitle}</title>`,
    `  <meta name="description" content="${safeDescription}">`,
    `  <link rel="canonical" href="${safeCanonical}">`,
    '  <meta property="og:type" content="website">',
    '  <meta property="og:site_name" content="Cub Scout Pack 321">',
    `  <meta property="og:title" content="${safeTitle}">`,
    `  <meta property="og:description" content="${safeDescription}">`,
    `  <meta property="og:url" content="${safeCanonical}">`,
    `  <meta property="og:image" content="${SOCIAL_IMAGE}">`,
    '  <meta property="og:image:width" content="1200">',
    '  <meta property="og:image:height" content="630">',
    `  <meta property="og:image:alt" content="${escapeHtml(SOCIAL_ALT)}">`,
    '  <meta name="twitter:card" content="summary_large_image">',
    `  <meta name="twitter:title" content="${safeTitle}">`,
    `  <meta name="twitter:description" content="${safeDescription}">`,
    `  <meta name="twitter:image" content="${SOCIAL_IMAGE}">`,
    `  <meta name="twitter:image:alt" content="${escapeHtml(SOCIAL_ALT)}">`,
    `  <script type="application/ld+json">${orgJson}</script>`,
  ].join("\n");
}

function header(depth) {
  return `
<header class="site-header">
  <div class="wrap nav-inner">
    <a class="brand" href="${sitePath("index.html")}" aria-label="Pack 321 Home">
      <img src="${fromRoot(depth, "assets/logos/cub-scout-logo.svg")}" alt="Pack 321 logo">
      <span><strong>Pack 321</strong><span>Oak Creek, Wisconsin</span><span class="subline">Serving families since 1967</span></span>
    </a>
    <button class="mobile-toggle" type="button" data-menu-toggle aria-controls="primary-nav" aria-expanded="false">Menu</button>
    <nav class="nav-links" id="primary-nav" aria-label="Primary navigation">
      <a href="${sitePath("index.html")}">Home</a>
      <a href="${sitePath("why-pack321.html")}">Why Pack 321</a>
      <a class="active" href="${sitePath("cub-scouts.html")}">Cub Scouts</a>
      <a href="${sitePath("adventures.html")}">Adventures</a>
      <a href="${sitePath("events-calendar.html")}">Calendar</a>
      <a href="${sitePath("resources.html")}">Resources</a>
      <a href="${sitePath("team.html")}">Team</a>
      <a href="${sitePath("join.html")}">Join</a>
      <a href="${sitePath("contact.html")}">Contact</a>
    </nav>
    <a class="visit-btn" href="${sitePath("join.html")}">Visit a Meeting</a>
  </div>
</header>`;
}

function footer(depth) {
  return `
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div><a class="brand" href="${sitePath("index.html")}"><img src="${fromRoot(depth, "assets/logos/cub-scout-logo.svg")}" alt="Pack 321 logo"><span><strong>Pack 321</strong><span>Oak Creek, Wisconsin</span></span></a><p>Serving families in Oak Creek and surrounding communities since 1967.</p><div class="footer-social-links" aria-label="Pack 321 website links"><a href="https://www.facebook.com/occubscoutpack321" target="_blank" rel="noopener" aria-label="Pack 321 on Facebook"><img src="${fromRoot(depth, "assets/icons/social/facebook.jpg")}" alt=""><span>Facebook</span></a><a href="https://www.band.us/" target="_blank" rel="noopener" aria-label="BAND app"><img src="${fromRoot(depth, "assets/icons/social/band.jpg")}" alt=""><span>BAND</span></a></div></div>
    <div><h4>Quick Links</h4><a href="${sitePath("why-pack321.html")}">Why Pack 321</a><a href="${sitePath("cub-scouts.html")}">Cub Scouts</a><a href="${sitePath("adventures.html")}">Adventures</a><a href="${sitePath("events-calendar.html")}">Calendar</a><a href="${sitePath("resources.html")}">Resources</a>
      <a href="${sitePath("team.html")}">Team</a>
      <a href="${sitePath("join.html")}">Join</a><a href="${sitePath("contact.html")}">Contact</a></div>
    <div><h4>Contact Us</h4><a href="tel:14142159261">(414) 215-9261</a><a href="mailto:wicubscoutpack321@gmail.com">wicubscoutpack321@gmail.com</a><p>Carollton Elementary, Oak Creek, WI</p><a class="button" href="${sitePath("join.html")}">Visit a Meeting</a></div>
    <div class="footer-scouting"><img class="scouting-america-logo" src="${fromRoot(depth, "assets/logos/scouting-america-logo-reversed.png")}" alt="Scouting America"><p>Prepared. For Life.</p><h4 class="be-scout">Be A Scout</h4></div>
  </div>
  <div class="wrap footer-bottom">Preparing young people for life.</div>
</footer>`;
}

function pageShell({ depth, meta, appAttributes }) {
  const content = appAttributes.content || "";
  const attrs = appAttributes.attrs;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
${metadata(meta)}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${fromRoot(depth, "css/design-system.css")}">
  <link rel="stylesheet" href="${fromRoot(depth, "css/navigation.css")}">
  <link rel="stylesheet" href="${fromRoot(depth, "css/cards.css")}">
  <link rel="stylesheet" href="${fromRoot(depth, "css/cub-adventures.css")}">
  <link rel="stylesheet" href="${fromRoot(depth, "css/footer.css")}">
${faviconLinks()}
</head>
<body>
${header(depth)}
<main ${attrs}>${content}</main>
${footer(depth)}
<script src="${fromRoot(depth, "js/site.js")}"></script>
<script src="${fromRoot(depth, "js/cub-scout-ranks.js")}"></script>
<script src="${fromRoot(depth, "js/cub-adventure-page.js")}"></script>
</body>
</html>
`;
}

function writeFile(relativePath, content) {
  const fullPath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

function rankDescription(rank) {
  return `Explore ${rank.name} required and elective Cub Scout adventures for ${rank.grade} Scouts with Pack 321 in Oak Creek, Wisconsin.`;
}

function rankOfficialUrl(rank) {
  return rank.officialRankUrl || rank.officialRequirementsUrl;
}

function breadcrumbs(rank, current) {
  return `
  <nav class="rank-breadcrumbs wrap" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span aria-hidden="true">></span>
    <a href="/cub-scouts/">Cub Scouts</a>
    <span aria-hidden="true">></span>
    ${current ? `<a href="/cub-scouts/adventures/${rank.slug}/">${escapeHtml(rank.name)}</a><span aria-hidden="true">></span><span>${escapeHtml(current)}</span>` : `<span>${escapeHtml(rank.name)}</span><span aria-hidden="true">></span><span>Adventures</span>`}
  </nav>`;
}

function officialCard(rank) {
  const ctaLabel = `View Official ${rank.name} Requirements`;
  return `
      <aside class="rank-official-card" aria-label="Official Adventure Requirements">
        <div class="rank-official-card__icon" aria-hidden="true">i</div>
        <h2>Official Adventure Requirements</h2>
        <p>Adventure requirements are maintained by Scouting America and open in a new tab.</p>
        <a class="button gold rank-official-card__button" href="${rankOfficialUrl(rank)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(ctaLabel)} on Scouting America">${escapeHtml(ctaLabel)} <span class="rank-external-indicator" aria-hidden="true">&#8599;</span></a>
      </aside>`;
}

function divider(rank) {
  return `
  <div class="wrap rank-divider" aria-hidden="true">
    <span></span>
    <img src="${rank.emblem}" width="${rank.emblemWidth}" height="${rank.emblemHeight}" alt="">
    <span></span>
  </div>`;
}

function requiredCard(item) {
  return `
      <a class="rank-required-card" href="${item.officialUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open official ${escapeHtml(item.name)} adventure requirements on Scouting America">
        <span class="rank-required-card__image"><img src="${item.icon}" alt="${escapeHtml(item.iconAlt)}"></span>
        <span class="rank-required-card__body">
          <span class="rank-required-card__category">${escapeHtml(item.category)}</span>
          <strong>${escapeHtml(item.name)} <span class="rank-external-indicator" aria-hidden="true">&#8599;</span></strong>
          <span>${escapeHtml(item.description)}</span>
        </span>
      </a>`;
}

function electiveCard(item) {
  return `
      <a class="rank-elective-card" href="${item.officialUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open official ${escapeHtml(item.name)} adventure requirements on Scouting America">
        <span class="rank-elective-card__icon"><img src="${item.icon}" alt="${escapeHtml(item.iconAlt)}"></span>
        <span>${escapeHtml(item.name)}</span>
        <b class="rank-external-indicator" aria-hidden="true">&#8599;</b>
      </a>`;
}

function adventureType(rank, adventure) {
  return rank.requiredAdventures.some((item) => item.slug === adventure.slug) ? "Required" : "Elective";
}

function detailActions(rank, adventure) {
  return `
        <div class="rank-detail-actions">
          <a class="button gold rank-detail-actions__official" href="${adventure.officialUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open official ${escapeHtml(adventure.name)} requirements on Scouting America">View Official ${escapeHtml(adventure.name)} Requirements <span class="rank-external-indicator" aria-hidden="true">&#8599;</span></a>
          <a class="button rank-detail-actions__back" href="/cub-scouts/adventures/${rank.slug}/">Back to ${escapeHtml(rank.name)} Adventures</a>
        </div>`;
}

function officialRequirementsInfo() {
  return `
      <section class="rank-requirements-info" aria-labelledby="official-requirements-heading">
        <h2 id="official-requirements-heading">Official Requirements</h2>
        <p>Scouting America maintains the official current requirements for this adventure. Use the button above to open the official requirements in a new tab.</p>
      </section>`;
}

function disclaimer() {
  return `
  <section class="rank-disclaimer-section">
    <div class="wrap">
      <aside class="rank-disclaimer" aria-label="Adventure source note">
        <span class="rank-disclaimer__icon" aria-hidden="true">i</span>
        <div>
          <h2>Please Note</h2>
          <p>Pack 321 adventure information is provided for convenience. Scouting America maintains the official requirements.</p>
        </div>
        <a class="button light" href="/cub-scouts/">About Cub Scouts</a>
      </aside>
    </div>
  </section>`;
}

function rankMain(rank) {
  return `${breadcrumbs(rank)}
  <section class="rank-adventure-hero">
    <div class="wrap rank-adventure-hero__grid">
      <div class="rank-adventure-hero__intro">
        <img class="rank-adventure-hero__emblem" src="${rank.emblem}" width="${rank.emblemWidth}" height="${rank.emblemHeight}" alt="${escapeHtml(rank.name)} rank emblem">
        <div class="rank-adventure-hero__copy">
          <p class="rank-adventure-kicker">Cub Scout Adventures</p>
          <h1>${escapeHtml(rank.title)}</h1>
          <span class="rank-adventure-underline" aria-hidden="true"></span>
          <p>${escapeHtml(rank.introduction)}</p>
          <dl class="rank-adventure-facts">
            <div><dt>Grade</dt><dd>${escapeHtml(rank.grade)}</dd></div>
            <div><dt>Typical age range</dt><dd>${escapeHtml(rank.ageRange)}</dd></div>
          </dl>
        </div>
      </div>
      ${officialCard(rank)}
    </div>
  </section>
  ${divider(rank)}
  <section class="rank-source-note-section">
    <div class="wrap">
      <aside class="rank-source-note" aria-label="Official requirements notice">
        <span class="rank-source-note__icon" aria-hidden="true">i</span>
        <p>Adventure requirements are maintained by Scouting America. Selecting an adventure will open its official requirements in a new tab.</p>
      </aside>
    </div>
  </section>
  <section class="rank-section">
    <div class="wrap">
      <h2>Required Adventures</h2>
      <div class="rank-required-grid">${rank.requiredAdventures.map(requiredCard).join("")}
      </div>
    </div>
  </section>
  <section class="rank-section rank-section--elective">
    <div class="wrap">
      <h2>Elective Adventures</h2>
      <div class="rank-elective-grid">${rank.electiveAdventures.map(electiveCard).join("")}
      </div>
    </div>
  </section>
  ${disclaimer()}`;
}

function adventureMain(rank, adventure) {
  const type = adventureType(rank, adventure);
  return `${breadcrumbs(rank, adventure.name)}
  <section class="rank-detail">
    <div class="wrap rank-detail__grid">
      <div class="rank-detail__media">
        <img src="${adventure.icon}" width="360" height="360" alt="${escapeHtml(adventure.iconAlt)}">
      </div>
      <div class="rank-detail__copy">
        <p class="rank-adventure-kicker">${escapeHtml(rank.name)} Adventure</p>
        <h1>${escapeHtml(adventure.name)}</h1>
        <p class="rank-detail__meta">${type}</p>
        <p>${escapeHtml(adventure.description)}</p>
        ${detailActions(rank, adventure)}
      </div>
    </div>
    <div class="wrap rank-detail__requirements">
      ${officialRequirementsInfo()}
    </div>
  </section>
  ${disclaimer()}`;
}

function writeRankPage(rank) {
  writeFile(`cub-scouts/adventures/${rank.slug}/index.html`, pageShell({
    depth: 3,
    meta: {
      title: `${rank.title} | Cub Scout Pack 321`,
      description: rankDescription(rank),
      canonical: `${SITE}/cub-scouts/adventures/${rank.slug}/`,
    },
    appAttributes: {
      attrs: `data-rank-app data-mode="rank" data-rank="${rank.slug}" data-static="true" style="--rank-accent: ${rank.accentColor}"`,
      content: rankMain(rank),
    },
  }));
}

function writeAdventurePage(rank, adventure) {
  writeFile(`cub-scouts/adventures/${rank.slug}/${adventure.slug}/index.html`, pageShell({
    depth: 4,
    meta: {
      title: `${adventure.name} | ${rank.name} Adventures | Pack 321`,
      description: `View Pack 321 information for the ${adventure.name} ${rank.name} Cub Scout adventure, with the official Scouting America requirements linked for reference.`,
      canonical: `${SITE}/cub-scouts/adventures/${rank.slug}/${adventure.slug}/`,
    },
    appAttributes: {
      attrs: `data-rank-app data-mode="adventure" data-rank="${rank.slug}" data-adventure="${adventure.slug}" data-static="true" style="--rank-accent: ${rank.accentColor}"`,
      content: adventureMain(rank, adventure),
    },
  }));
}

function writeLegacyRedirect(rank) {
  const target = `/cub-scouts/adventures/${rank.slug}/`;
  writeFile(legacyRoutes[rank.slug], `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(rank.title)} | Cub Scout Pack 321</title>
  <meta name="description" content="${escapeHtml(rankDescription(rank))}">
  <link rel="canonical" href="${SITE}${target}">
  <meta http-equiv="refresh" content="0; url=${target}">
${faviconLinks()}
</head>
<body>
<main>
  <h1>${escapeHtml(rank.title)}</h1>
  <p>This Pack 321 adventure page has moved to <a href="${target}">${target}</a>.</p>
</main>
</body>
</html>
`);
}

cubScoutRankOrder.forEach((slug) => {
  const rank = cubScoutRanks[slug];
  writeRankPage(rank);
  rank.requiredAdventures.concat(rank.electiveAdventures).forEach((adventure) => writeAdventurePage(rank, adventure));
  writeLegacyRedirect(rank);
});

console.log(`Generated ${cubScoutRankOrder.length} Cub Scout rank pages and Cub Scout adventure detail pages.`);
