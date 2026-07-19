const fs = require("fs");
const path = require("path");
const { cubScoutRanks, cubScoutRankOrder } = require("../js/cub-scout-ranks.js");

const ROOT = path.resolve(__dirname, "..");
const SEARCH_URL = "https://uscs32v2.ksearchnet.com/cs/v2/search";
const API_KEY = "klevu-168554966403616429";

function normalize(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function rankSearchName(rank) {
  return rank.slug === "arrow-of-light" ? "Arrow of Light" : rank.name;
}

function rankAliases(rank) {
  if (rank.slug === "arrow-of-light") return ["Arrow of Light", "AOL"];
  if (rank.slug === "webelos") return ["Webelos"];
  return [rank.name];
}

function adventureAliases(adventure) {
  const aliases = [adventure.name];
  aliases.push(adventure.name.replace(/\bAOL\b/g, "Arrow of Light"));
  aliases.push(adventure.name.replace(/\bArrow of Light\b/g, "AOL"));
  aliases.push(adventure.name.replace(/\bWebelos\b/g, "").trim());
  aliases.push(adventure.name.replace(/^Bobcat Adventure$/, "Bobcat"));
  return [...new Set(aliases.filter(Boolean))];
}

function queryTerms(rank, adventure) {
  const terms = [];
  for (const rankName of rankAliases(rank)) {
    for (const adventureName of adventureAliases(adventure)) {
      terms.push(`Cub Scout ${rankName} Adventure Loop ${adventureName}`);
      terms.push(`Cub Scout ${rankName} Adventure Pin ${adventureName}`);
      terms.push(`${rankName} ${adventureName} adventure pin`);
      terms.push(`${rankName} ${adventureName} adventure loop`);
    }
  }
  for (const adventureName of adventureAliases(adventure)) {
    terms.push(`${adventureName} adventure pin`);
    terms.push(`${adventureName} adventure loop`);
  }
  return [...new Set(terms)];
}

function scoreRecord(record, rank, adventure) {
  const haystack = normalize(`${record.name || ""} ${record.shortDesc || ""} ${record.klevu_category || ""}`);
  const adventureWords = normalize(adventure.name).split(" ").filter((word) => word.length > 1);
  const significantAdventureWords = adventureWords.filter((word) => !["adventure", "aol"].includes(word));
  const matchedAdventureWords = significantAdventureWords.filter((word) => haystack.includes(word));
  let score = 0;
  matchedAdventureWords.forEach((word) => {
    score += word.length > 3 ? 3 : 2;
  });
  if (matchedAdventureWords.length >= Math.max(1, Math.ceil(significantAdventureWords.length * 0.6))) {
    score += 4;
  }
  rankAliases(rank).forEach((alias) => {
    normalize(alias).split(" ").forEach((word) => {
      if (word.length > 1 && haystack.includes(word)) score += 2;
    });
  });
  if (/adventure loop|adventure pin|core pin|elective adventure pin|core adventure pin/.test(haystack)) score += 5;
  if (/\b(loop|pin)\b/.test(haystack)) score += 2;
  if (/cub scout/.test(haystack)) score += 2;
  if (/rank colors|neckerchief|slide|shirt|belt|america'?s 250th/.test(haystack)) score -= 8;
  return score;
}

async function searchAdventure(rank, adventure) {
  const recordsByKey = new Map();
  for (const query of queryTerms(rank, adventure)) {
    const body = {
      context: { apiKeys: [API_KEY] },
      recordQueries: [{
        id: "productSearch",
        typeOfRequest: "SEARCH",
        settings: {
          query: { term: query },
          typeOfRecords: ["KLEVU_PRODUCT"],
          limit: 10,
        },
      }],
    };

    const response = await fetch(SEARCH_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Search failed for ${rank.slug}:${adventure.slug} (${response.status})`);

    const json = await response.json();
    const records = json.queryResults?.[0]?.records || [];
    records.forEach((record) => {
      recordsByKey.set(record.sku || record.url || record.imageUrl || record.name, record);
    });
  }
  const records = [...recordsByKey.values()];
  const ranked = records
    .map((record) => ({ record, score: scoreRecord(record, rank, adventure) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0] && ranked[0].score >= 7 ? ranked[0].record : null;
}

async function download(url, targetPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed for ${url} (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, bytes);
  return bytes.length;
}

(async () => {
  const missing = [];
  const manifests = {};

  for (const rankSlug of cubScoutRankOrder) {
    const rank = cubScoutRanks[rankSlug];
    const adventures = rank.requiredAdventures.concat(rank.electiveAdventures);
    manifests[rankSlug] = [];

    for (const adventure of adventures) {
      const publicPath = path.join(ROOT, "assets", "images", "cub-scouts", "adventures", rankSlug, `${adventure.slug}.jpg`);
      const sourcePath = path.join(ROOT, "assets", "source", "cub-scouts", "adventures", rankSlug, `${adventure.slug}.jpg`);
      if (fs.existsSync(publicPath)) {
        const existing = fs.statSync(publicPath);
        manifests[rankSlug].push({
          slug: adventure.slug,
          name: adventure.name,
          productUrl: null,
          imageUrl: null,
          localPath: `/assets/images/cub-scouts/adventures/${rankSlug}/${adventure.slug}.jpg`,
          bytes: existing.size,
          sourcePath: fs.existsSync(sourcePath) ? `/assets/source/cub-scouts/adventures/${rankSlug}/${adventure.slug}.jpg` : null,
        });
        continue;
      }

      const record = await searchAdventure(rank, adventure);
      if (!record || !record.imageUrl) {
        missing.push(`${rankSlug}:${adventure.slug}`);
        continue;
      }

      const bytes = await download(record.imageUrl, publicPath);
      await download(record.imageUrl, sourcePath);
      manifests[rankSlug].push({
        slug: adventure.slug,
        name: adventure.name,
        productUrl: record.url,
        imageUrl: record.imageUrl,
        localPath: `/assets/images/cub-scouts/adventures/${rankSlug}/${adventure.slug}.jpg`,
        bytes,
        sourcePath: `/assets/source/cub-scouts/adventures/${rankSlug}/${adventure.slug}.jpg`,
        sku: record.sku,
        productName: record.name,
      });
    }

    const manifestPath = path.join(ROOT, "assets", "images", "cub-scouts", "adventures", rankSlug, "icon-sources.json");
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifests[rankSlug], null, 2)}\n`);
  }

  if (missing.length) {
    console.error(`Missing icons:\n${missing.join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log("Fetched or verified all adventure icons.");
  }
})();
