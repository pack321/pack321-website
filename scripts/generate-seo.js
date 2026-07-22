const fs = require("fs");
const path = require("path");

const SITE_URL = "https://pack321wi.org";
const ROOT = path.resolve(__dirname, "..");

const EXCLUDED_FILES = new Set([
  "admin.html",
  "banner-review.html",
  "404.html",
  "favicon-links.html",
  "hero-component.html",
  "scout-accounts.html",
  "team-admin.html",
  "why-pack321.html",
  "cub-scouts.html",
  "adventures.html",
  "events-calendar.html",
  "resources.html",
  "new-family-guide.html",
  "join.html",
  "contact.html",
  "team.html",
  "uniforms.html",
  "volunteer.html",
  "cub-lion.html",
  "cub-tiger.html",
  "cub-wolf.html",
  "cub-bear.html",
  "cub-webelos.html",
  "cub-arrow-of-light.html",
]);

const EXCLUDED_PREFIXES = [
  "portal/",
];

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") return [];
      return walk(fullPath);
    }
    return entry.isFile() ? [fullPath] : [];
  });
}

function isPublicPage(relativePath) {
  if (!relativePath.endsWith(".html")) return false;
  if (EXCLUDED_FILES.has(relativePath)) return false;
  return !EXCLUDED_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

function pageUrl(relativePath) {
  if (relativePath === "index.html") return `${SITE_URL}/`;
  if (relativePath.endsWith("/index.html")) {
    return `${SITE_URL}/${relativePath.slice(0, -"index.html".length)}`;
  }
  return `${SITE_URL}/${relativePath}`;
}

function lastmod(filePath) {
  return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
}

const pages = walk(ROOT)
  .map((filePath) => ({
    filePath,
    relativePath: toPosix(path.relative(ROOT, filePath)),
  }))
  .filter(({ relativePath }) => isPublicPage(relativePath))
  .sort((a, b) => pageUrl(a.relativePath).localeCompare(pageUrl(b.relativePath)));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(({ filePath, relativePath }) => `  <url>
    <loc>${pageUrl(relativePath)}</loc>
    <lastmod>${lastmod(filePath)}</lastmod>
  </url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Disallow: /admin.html
Disallow: /banner-review.html
Disallow: /favicon-links.html
Disallow: /scout-accounts.html
Disallow: /team-admin.html
Disallow: /portal/

Sitemap: ${SITE_URL}/sitemap.xml
`;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(ROOT, "robots.txt"), robots, "utf8");

console.log(`Generated sitemap.xml with ${pages.length} public pages.`);
console.log("Generated robots.txt.");
