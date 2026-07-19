const fs = require("fs");
const path = require("path");
const { cubScoutRanks } = require("../js/cub-scout-ranks.js");

const ROOT = path.resolve(__dirname, "..");
const htmlFiles = [];

function walk(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith(".html")) {
      htmlFiles.push(fullPath);
    }
  });
}

function existsForUrl(url, fromFile) {
  if (/[+]/.test(url)) return true;
  const cleanUrl = url.split("#")[0].split("?")[0];
  if (!cleanUrl || /^(https?:|mailto:|tel:)/.test(cleanUrl)) return true;

  const relativePath = cleanUrl.startsWith("/")
    ? cleanUrl.slice(1)
    : path.relative(ROOT, path.resolve(path.dirname(fromFile), cleanUrl));
  const fullPath = path.join(ROOT, relativePath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) return true;
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, "index.html"))) return true;
  if (!path.extname(fullPath) && fs.existsSync(`${fullPath}.html`)) return true;
  if (relativePath.endsWith("/") && fs.existsSync(path.join(ROOT, relativePath, "index.html"))) return true;
  return false;
}

walk(ROOT);

const problems = {
  badHrefOrSrc: [],
  emptyHref: [],
  remoteScoutingImageDeps: [],
  duplicateSlugs: [],
  missingLocalAdventureIcons: [],
  badAdventureCardLinks: [],
  scoutingIframeUsage: [],
  oldRequirementPlaceholders: [],
  staleAdventureDetailDirectories: [],
};

const hrefPattern = /href="([^"]*)"/g;
const srcPattern = /src="([^"]*)"/g;
const adventureCardPattern = /<a\s+class="(rank-(?:required|elective)-card)"([^>]*)>/g;

htmlFiles.forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  if (/<iframe\b[^>]+src="[^"]*scouting\.org/i.test(html)) problems.scoutingIframeUsage.push(path.relative(ROOT, file));
  if (/rank-requirements-empty|Print Requirements|requirements coming soon|rank-official-card__link|Go to Scouting America/i.test(html)) {
    problems.oldRequirementPlaceholders.push(path.relative(ROOT, file));
  }
  for (const match of html.matchAll(hrefPattern)) {
    const href = match[1];
    if (href === "" || href === "#") problems.emptyHref.push([path.relative(ROOT, file), href]);
    if (!existsForUrl(href, file)) problems.badHrefOrSrc.push([path.relative(ROOT, file), href]);
  }
  for (const match of html.matchAll(srcPattern)) {
    const src = match[1];
    if (/scouting\.org/.test(src)) problems.remoteScoutingImageDeps.push([path.relative(ROOT, file), src]);
    if (!existsForUrl(src, file)) problems.badHrefOrSrc.push([path.relative(ROOT, file), src]);
  }
  for (const match of html.matchAll(adventureCardPattern)) {
    const attrs = match[2];
    const href = attrs.match(/\shref="([^"]+)"/)?.[1] || "";
    const target = attrs.match(/\starget="([^"]+)"/)?.[1] || "";
    const rel = attrs.match(/\srel="([^"]+)"/)?.[1] || "";
    const ariaLabel = attrs.match(/\saria-label="([^"]+)"/)?.[1] || "";
    if (
      !href.startsWith("https://www.scouting.org/cub-scout-adventures/") ||
      target !== "_blank" ||
      !/\bnoopener\b/.test(rel) ||
      !/\bnoreferrer\b/.test(rel) ||
      !/Scouting America/.test(ariaLabel)
    ) {
      problems.badAdventureCardLinks.push([path.relative(ROOT, file), href, target, rel, ariaLabel]);
    }
  }
});

Object.entries(cubScoutRanks).forEach(([rankSlug, rank]) => {
  const seen = new Set();
  rank.requiredAdventures.concat(rank.electiveAdventures).forEach((adventure) => {
    if (seen.has(adventure.slug)) problems.duplicateSlugs.push(`${rankSlug}:${adventure.slug}`);
    seen.add(adventure.slug);

    if (!adventure.icon.startsWith(`/assets/images/cub-scouts/adventures/${rankSlug}/`)) {
      problems.missingLocalAdventureIcons.push(adventure.icon);
    } else {
      const iconPath = path.join(ROOT, adventure.icon.slice(1));
      if (!fs.existsSync(iconPath)) problems.missingLocalAdventureIcons.push(adventure.icon);
    }
  });

  const rankDir = path.join(ROOT, "cub-scouts", "adventures", rankSlug);
  if (fs.existsSync(rankDir)) {
    fs.readdirSync(rankDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .forEach((entry) => problems.staleAdventureDetailDirectories.push(path.join("cub-scouts", "adventures", rankSlug, entry.name)));
  }
});

const summary = {
  htmlFiles: htmlFiles.length,
  badHrefOrSrc: problems.badHrefOrSrc.length,
  emptyHref: problems.emptyHref.length,
  remoteScoutingImageDeps: problems.remoteScoutingImageDeps.length,
  duplicateSlugs: problems.duplicateSlugs.length,
  missingLocalAdventureIcons: problems.missingLocalAdventureIcons.length,
  badAdventureCardLinks: problems.badAdventureCardLinks.length,
  scoutingIframeUsage: problems.scoutingIframeUsage.length,
  oldRequirementPlaceholders: problems.oldRequirementPlaceholders.length,
  staleAdventureDetailDirectories: problems.staleAdventureDetailDirectories.length,
};

console.log(JSON.stringify({ summary, problems }, null, 2));

const failed = Object.values(problems).some((items) => items.length > 0);
if (failed) process.exit(1);
