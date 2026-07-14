const fs = require("fs");
const path = require("path");

const SITE = "https://pack321wi.org";
const SOCIAL_IMAGE = `${SITE}/assets/seo/pack321-social.png`;
const SOCIAL_ALT = "Cub Scout Pack 321 in Oak Creek, Wisconsin social sharing image";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cub Scout Pack 321",
  url: `${SITE}/`,
  logo: `${SITE}/assets/logos/cub-scout-logo.svg`,
};

const pages = {
  "index.html": {
    url: `${SITE}/`,
    title: "Cub Scout Pack 321 | Oak Creek, WI",
    description: "Cub Scout Pack 321 serves Oak Creek and surrounding communities with family-friendly scouting, outdoor adventure, service, and leadership for boys and girls.",
    h1: "Cub Scout Pack 321 in Oak Creek, Wisconsin",
    h1Html: '<h1 class="sr-only">Cub Scout Pack 321 in Oak Creek, Wisconsin</h1>',
  },
  "why-pack321.html": {
    url: `${SITE}/why-pack321.html`,
    title: "Why Choose Cub Scout Pack 321 | Oak Creek, WI",
    description: "Learn why families in Oak Creek and surrounding communities choose Cub Scout Pack 321 for character, friendship, service, and adventure.",
    h1: "Why Families Choose Pack 321",
    h1Html: '<h1><span>Why Families </span><span class="gold">Choose Pack 321</span></h1>',
  },
  "cub-scouts.html": {
    url: `${SITE}/cub-scouts.html`,
    title: "Cub Scouts at Pack 321 | Oak Creek, WI",
    description: "Explore the Cub Scout journey with Pack 321, serving Oak Creek and surrounding communities from Lion through Arrow of Light.",
    h1: "Cub Scouts at Pack 321",
    h1Html: '<h1><span>Cub Scouts </span><span class="gold">at Pack 321</span></h1>',
  },
  "adventures.html": {
    url: `${SITE}/adventures.html`,
    title: "Cub Scout Adventures | Pack 321 Oak Creek",
    description: "See the camping, fishing, racing, hiking, service, and family adventures Pack 321 offers Scouts in Oak Creek and surrounding communities.",
    h1: "Adventure Lives Here",
    h1Html: '<h1><span>Adventure </span><span class="gold">Lives Here</span></h1>',
  },
  "events-calendar.html": {
    url: `${SITE}/events-calendar.html`,
    title: "Pack 321 Events and Calendar | Oak Creek, WI",
    description: "View Pack 321 meetings, adventures, and family events for Oak Creek and surrounding communities, including gatherings at Carollton Elementary.",
    h1: "Pack 321 Events and Calendar",
    h1Html: '<h1><span>Pack 321 </span><span class="gold">Events and Calendar</span></h1>',
  },
  "resources.html": {
    url: `${SITE}/resources.html`,
    title: "Pack 321 Family Resources | Oak Creek, WI",
    description: "Find Pack 321 resources for families in Oak Creek and surrounding communities, including uniforms, forms, volunteering, and scouting support.",
    h1: "Pack 321 Family Resources",
    h1Html: '<h1><span>Pack 321 </span><span class="gold">Family Resources</span></h1>',
  },
  "join.html": {
    url: `${SITE}/join.html`,
    title: "Join Cub Scout Pack 321 | Oak Creek, WI",
    description: "Learn how to join Cub Scout Pack 321, visit a meeting at Carollton Elementary, and connect with scouting families in Oak Creek and surrounding communities.",
    h1: "Join Pack 321",
    h1Html: '<h1><span>Join </span><span class="gold">Pack 321</span></h1>',
  },
  "contact.html": {
    url: `${SITE}/contact.html`,
    title: "Contact Cub Scout Pack 321 | Oak Creek, WI",
    description: "Contact Cub Scout Pack 321 in Oak Creek, Wisconsin to ask questions, visit a meeting at Carollton, or learn more about joining.",
    h1: "Contact Pack 321",
    h1Html: '<h1><span>Contact </span><span class="gold">Pack 321</span></h1>',
  },
  "team.html": {
    url: `${SITE}/team.html`,
    title: "Pack 321 Leadership Team | Oak Creek, WI",
    description: "Meet the volunteer leaders who support Cub Scout Pack 321 families in Oak Creek and surrounding communities.",
    h1: "Meet the Pack 321 Leadership Team",
    h1Html: '<h1><span>Meet the Pack 321 </span><span class="gold">Leadership Team</span></h1>',
  },
  "uniforms.html": {
    url: `${SITE}/uniforms.html`,
    title: "Pack 321 Uniform Standards | Oak Creek, WI",
    description: "Review Pack 321 Cub Scout uniform standards by den and rank for families in Oak Creek and surrounding communities.",
    h1: "Pack 321 Uniform Standards",
    h1Html: '<h1><span>Pack 321 </span><span class="gold">Uniform Standards</span></h1>',
  },
  "volunteer.html": {
    url: `${SITE}/volunteer.html`,
    title: "Volunteer With Pack 321 | Oak Creek, WI",
    description: "Learn how parents, grandparents, and community members can volunteer with Cub Scout Pack 321 in Oak Creek and surrounding communities.",
    h1: "Volunteer With Pack 321",
    h1Html: '<h1><span>Volunteer </span><span class="gold">With Pack 321</span></h1>',
  },
  "cub-lion.html": {
    url: `${SITE}/cub-lion.html`,
    title: "Lion Cub Scout Adventures | Pack 321",
    description: "Explore Lion Cub Scout adventures for kindergarten Scouts with Pack 321, serving Oak Creek and surrounding communities.",
    h1: "Lion Cub Scout Adventures",
    h1Html: "<h1>Lion Cub Scout Adventures</h1>",
  },
  "cub-tiger.html": {
    url: `${SITE}/cub-tiger.html`,
    title: "Tiger Cub Scout Adventures | Pack 321",
    description: "Explore Tiger Cub Scout adventures for first grade Scouts with Pack 321, serving Oak Creek and surrounding communities.",
    h1: "Tiger Cub Scout Adventures",
    h1Html: "<h1>Tiger Cub Scout Adventures</h1>",
  },
  "cub-wolf.html": {
    url: `${SITE}/cub-wolf.html`,
    title: "Wolf Cub Scout Adventures | Pack 321",
    description: "Explore Wolf Cub Scout adventures for second grade Scouts with Pack 321, serving Oak Creek and surrounding communities.",
    h1: "Wolf Cub Scout Adventures",
    h1Html: "<h1>Wolf Cub Scout Adventures</h1>",
  },
  "cub-bear.html": {
    url: `${SITE}/cub-bear.html`,
    title: "Bear Cub Scout Adventures | Pack 321",
    description: "Explore Bear Cub Scout adventures for third grade Scouts with Pack 321, serving Oak Creek and surrounding communities.",
    h1: "Bear Cub Scout Adventures",
    h1Html: "<h1>Bear Cub Scout Adventures</h1>",
  },
  "cub-webelos.html": {
    url: `${SITE}/cub-webelos.html`,
    title: "Webelos Cub Scout Adventures | Pack 321",
    description: "Explore Webelos Cub Scout adventures for fourth grade Scouts with Pack 321, serving Oak Creek and surrounding communities.",
    h1: "Webelos Cub Scout Adventures",
    h1Html: "<h1>Webelos Cub Scout Adventures</h1>",
  },
  "cub-arrow-of-light.html": {
    url: `${SITE}/cub-arrow-of-light.html`,
    title: "Arrow of Light Cub Scout Adventures | Pack 321",
    description: "Explore Arrow of Light Cub Scout adventures for fifth grade Scouts with Pack 321, serving Oak Creek and surrounding communities.",
    h1: "Arrow of Light Cub Scout Adventures",
    h1Html: "<h1>Arrow of Light Cub Scout Adventures</h1>",
  },
};

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function metadataBlock(page) {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const url = escapeHtml(page.url);
  const imageAlt = escapeHtml(SOCIAL_ALT);
  return [
    `  <title>${title}</title>`,
    `  <meta name="description" content="${description}">`,
    `  <link rel="canonical" href="${url}">`,
    '  <meta property="og:type" content="website">',
    '  <meta property="og:site_name" content="Cub Scout Pack 321">',
    `  <meta property="og:title" content="${title}">`,
    `  <meta property="og:description" content="${description}">`,
    `  <meta property="og:url" content="${url}">`,
    `  <meta property="og:image" content="${SOCIAL_IMAGE}">`,
    '  <meta property="og:image:width" content="1200">',
    '  <meta property="og:image:height" content="630">',
    `  <meta property="og:image:alt" content="${imageAlt}">`,
    '  <meta name="twitter:card" content="summary_large_image">',
    `  <meta name="twitter:title" content="${title}">`,
    `  <meta name="twitter:description" content="${description}">`,
    `  <meta name="twitter:image" content="${SOCIAL_IMAGE}">`,
    `  <meta name="twitter:image:alt" content="${imageAlt}">`,
    `  <script type="application/ld+json">${JSON.stringify(organizationJsonLd)}</script>`,
  ].join("\n") + "\n  ";
}

function updateHead(source, page) {
  return source.replace(/<head>([\s\S]*?)<\/head>/i, (match, head) => {
    let next = head;
    [
      /\s*<title>[\s\S]*?<\/title>\s*/gi,
      /\s*<meta\s+name=["']description["'][^>]*>\s*/gi,
      /\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi,
      /\s*<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi,
      /\s*<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi,
      /\s*<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>\s*/gi,
    ].forEach((pattern) => {
      next = next.replace(pattern, "\n");
    });

    const viewport = next.match(/\s*<meta\s+name=["']viewport["'][^>]*>\s*/i);
    if (viewport) {
      const insertAt = viewport.index + viewport[0].length;
      next = `${next.slice(0, insertAt)}${metadataBlock(page)}${next.slice(insertAt)}`;
    } else {
      next = `\n${metadataBlock(page)}${next}`;
    }
    next = next.replace(/\n{3,}/g, "\n\n");
    return `<head>${next}</head>`;
  });
}

function updateH1(source, file, page) {
  if (file === "index.html") {
    if (/<h1\b/i.test(source)) return source;
    return source.replace("<main>", `<main>\n${page.h1Html}`);
  }
  return source.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, page.h1Html);
}

Object.entries(pages).forEach(([file, page]) => {
  const fullPath = path.resolve(__dirname, "..", file);
  let source = fs.readFileSync(fullPath, "utf8");
  source = updateHead(source, page);
  source = updateH1(source, file, page);
  fs.writeFileSync(fullPath, source, "utf8");
});

console.log(`Applied SEO metadata to ${Object.keys(pages).length} public pages.`);
