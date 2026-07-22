const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://pack321wi.org";

const redirects = [
  { file: "why-pack321.html", route: "why-pack321/", label: "Why Pack 321" },
  { file: "cub-scouts.html", route: "cub-scouts/", label: "Cub Scouts" },
  { file: "adventures.html", route: "adventures/", label: "Cub Scout Adventures" },
  { file: "events-calendar.html", route: "calendar/", label: "Pack 321 Calendar" },
  { file: "resources.html", route: "resources/", label: "Pack 321 Resources" },
  { file: "new-family-guide.html", route: "new-family-guide/", label: "New Family Guide" },
  { file: "join.html", route: "join/", label: "Join Pack 321" },
  { file: "contact.html", route: "contact/", label: "Contact Pack 321" },
  { file: "team.html", route: "team/", label: "Pack 321 Team" },
  { file: "uniforms.html", route: "uniforms/", label: "Pack 321 Uniforms" },
  { file: "volunteer.html", route: "volunteer/", label: "Volunteer With Pack 321" },
];

const adventures = [
  {
    slug: "camping",
    title: "Camping",
    description: "Pack 321 camping brings Scouts and their families together for outdoor adventures, shared meals, games, and time around camp.",
  },
  {
    slug: "fishing",
    title: "Fishing",
    description: "Fishing activities introduce Scouts to patience, conservation, outdoor responsibility, and the excitement of catching their first fish.",
  },
  {
    slug: "pinewood-derby",
    title: "Pinewood Derby",
    description: "The Pinewood Derby combines creativity, craftsmanship, friendly competition, and one of Cub Scouting's most recognized traditions.",
  },
  {
    slug: "raingutter-regatta",
    title: "Raingutter Regatta",
    description: "The Raingutter Regatta gives Scouts the opportunity to build and race small boats in a fun, hands-on competition.",
  },
  {
    slug: "hiking",
    title: "Hiking",
    description: "Pack 321 hikes help Scouts explore local trails, observe nature, stay active, and practice outdoor awareness.",
  },
  {
    slug: "service",
    title: "Service",
    description: "Service projects help Scouts learn that small actions can make a meaningful difference in their community.",
  },
  {
    slug: "blue-gold",
    title: "Blue & Gold",
    description: "The Blue & Gold celebration recognizes Cub Scouting, Pack achievements, volunteer contributions, and the friendships built throughout the year.",
  },
  {
    slug: "graduation",
    title: "Graduation",
    description: "Graduation celebrates Scouts advancing to their next rank and recognizes the work, growth, and adventures completed during the year.",
  },
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function write(relativePath, content) {
  const fullPath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

function rootRelativeAssets(html) {
  return html
    .replace(/\b(href|src|data-fallback)="(css|js|assets)\//g, '$1="/$2/')
    .replace(/\bsrcset="assets\//g, 'srcset="/assets/')
    .replace(/,\s+assets\//g, ', /assets/')
    .replace(/url\((['"]?)(?:\.\.\/)?assets\//g, "url($1/assets/")
    .replace(/this\.src='assets\//g, "this.src='/assets/");
}

function setHeadValue(html, selectorPattern, replacement) {
  return html.replace(selectorPattern, replacement);
}

function setCanonical(html, url) {
  return setHeadValue(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}">`);
}

function setTitle(html, title) {
  return setHeadValue(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
}

function setDescription(html, description) {
  const safeDescription = description.replace(/"/g, "&quot;");
  return setHeadValue(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${safeDescription}">`);
}

function setSocialRoute(html, { title, description, url }) {
  const safeDescription = description.replace(/"/g, "&quot;");
  return html
    .replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}">`)
    .replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${safeDescription}">`)
    .replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${url}">`)
    .replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}">`)
    .replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${safeDescription}">`);
}

function adventureRouteHtml(source, adventure) {
  const url = `${SITE}/adventures/${adventure.slug}/`;
  const title = `${adventure.title} | Cub Scout Pack 321`;
  let html = rootRelativeAssets(source);
  html = setTitle(html, title);
  html = setDescription(html, adventure.description);
  html = setCanonical(html, url);
  html = setSocialRoute(html, {
    title,
    description: adventure.description,
    url,
  });
  return html;
}

function redirectHtml({ route, label }) {
  const href = `/${route}`;
  const canonical = `${SITE}/${route}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <link rel="canonical" href="${canonical}">
  <meta http-equiv="refresh" content="0; url=${href}">
  <script>window.location.replace("${href}");</script>
</head>
<body>
  <p>Redirecting to <a href="${href}">${label}</a>.</p>
</body>
</html>
`;
}

const adventuresShell = read("adventures/index.html");
adventures.forEach((adventure) => {
  write(`adventures/${adventure.slug}/index.html`, adventureRouteHtml(adventuresShell, adventure));
});

redirects.forEach((redirect) => {
  write(redirect.file, redirectHtml(redirect));
});

const notFound = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Page Not Found | Cub Scout Pack 321</title>
  <meta name="description" content="The Pack 321 page you requested could not be found.">
  <link rel="canonical" href="${SITE}/404.html">
  <link rel="stylesheet" href="/css/design-system.css">
  <link rel="stylesheet" href="/css/navigation.css">
  <link rel="stylesheet" href="/css/cards.css">
  <link rel="stylesheet" href="/css/footer.css">
</head>
<body>
<main class="page-section">
  <div class="wrap">
    <div class="section-heading">
      <h1>Page Not Found</h1>
      <span></span>
      <p>The page you requested is not available.</p>
    </div>
    <div class="center-action"><a class="button gold" href="/adventures/">Explore Adventures</a><a class="button" href="/">Return Home</a></div>
  </div>
</main>
</body>
</html>
`;

write("404.html", notFound);

console.log(`Generated ${adventures.length} adventure routes and ${redirects.length} legacy redirects.`);
