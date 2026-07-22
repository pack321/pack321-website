const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://pack321wi.org";

const cleanPages = [
  { source: "why-pack321.html", route: "why-pack321/" },
  { source: "cub-scouts.html", route: "cub-scouts/" },
  { source: "adventures.html", route: "adventures/" },
  { source: "events-calendar.html", route: "calendar/" },
  { source: "resources.html", route: "resources/" },
  { source: "new-family-guide.html", route: "new-family-guide/" },
  { source: "join.html", route: "join/" },
  { source: "contact.html", route: "contact/" },
  { source: "team.html", route: "team/" },
  { source: "uniforms.html", route: "uniforms/" },
  { source: "volunteer.html", route: "volunteer/" },
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

function cleanRouteHtml(source, route) {
  const url = `${SITE}/${route}`;
  return setSocialRoute(setCanonical(rootRelativeAssets(source), url), {
    title: source.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "Cub Scout Pack 321",
    description: source.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i)?.[1] || "",
    url,
  });
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

cleanPages.forEach(({ source, route }) => {
  write(`${route}index.html`, cleanRouteHtml(read(source), route));
});

const adventuresShell = read("adventures.html");
adventures.forEach((adventure) => {
  write(`adventures/${adventure.slug}/index.html`, adventureRouteHtml(adventuresShell, adventure));
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

console.log(`Generated ${cleanPages.length} clean page routes and ${adventures.length} adventure routes.`);
