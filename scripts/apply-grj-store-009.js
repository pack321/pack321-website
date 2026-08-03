const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const store = path.join(root, 'store');
const read = file => JSON.parse(fs.readFileSync(path.join(store, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(store, file), `${JSON.stringify(value, null, 2)}\n`);

const campaigns = read('data/campaigns.json');
const products = read('data/products.json');
const definitions = [
  { id: 'gluten-free', shortLabel: 'GF', displayName: 'Gluten Free', description: 'The vendor identifies this product as gluten free.', verified: true, visible: true },
  { id: 'ou-kosher', shortLabel: 'OU', displayName: 'OU Kosher', description: 'This product displays the OU kosher certification symbol.', verified: true, visible: true },
  { id: 'dairy', shortLabel: 'D', displayName: 'Dairy', description: 'The kosher designation identifies this product as dairy.', verified: true, visible: true },
  ...read('data/product-symbols.json').map(symbol => ({
    ...symbol,
    shortLabel: symbol.id === 'pine-tree' ? '🌲' : symbol.displayName,
    description: 'Vendor product designation. Meaning pending official confirmation.',
    verified: false,
    visible: true
  }))
];

const updates = {
  'seroogy-candy-2026': {
    vendorName: 'Seroogy’s Homemade Chocolates',
    cardTitle: '2026–2027 Candy Bar Fundraiser',
    cardDescription: 'Mix and match seven Seroogy’s candy-bar flavors for $2 each.',
    cardImage: '/assets/media/campaigns/seroogy-candy-2026/campaign/all-seven-candy-bars.webp',
    cardImageAlt: 'Seven varieties of Seroogy’s candy bars',
    name: '2026–2027 Candy Bar Fundraiser'
  },
  'popcorn-2026': {
    vendorName: 'Three Harbors Council',
    cardTitle: '2026–2027 Popcorn Fundraiser',
    cardDescription: 'Premium popcorn and snacks supporting Pack 321 adventures.',
    cardImage: '/assets/media/campaigns/popcorn-2026/campaign/popcorn-campaign-products.webp',
    cardImageAlt: 'Popcorn fundraiser products',
    name: '2026–2027 Popcorn Fundraiser',
    symbolDefinitionIds: definitions.map(item => item.id)
  },
  'rose-wreaths-2026': {
    vendorName: 'Rose Wreath Fundraising',
    aliases: ['wreaths-2027', 'wreaths-2026'],
    cardTitle: '2026–2027 Holiday Wreath Fundraiser',
    cardDescription: 'Fresh wreaths, greenery, centerpieces, and holiday decorations supporting Pack 321.',
    cardImage: '/assets/media/campaigns/rose-wreaths-2026/specialty/36-inch-christmas-cane-card.webp',
    cardImageAlt: 'Fresh evergreen Christmas cane with a red velvet bow',
    name: '2026–2027 Holiday Wreath Fundraiser'
  },
  'veterans-wreaths-2026': {
    cardTitle: '2026–2027 Veterans Wreath Sponsorship',
    cardDescription: 'Honor a veteran by sponsoring a fresh evergreen remembrance wreath.',
    cardImage: '/assets/media/campaigns/veterans-wreaths-2026/products/20-inch-veterans-wreath-card.webp',
    cardImageAlt: 'Twenty-inch evergreen veterans remembrance wreath',
    name: '2026–2027 Veterans Wreath Sponsorship'
  }
};

for (const campaign of campaigns) {
  if (!updates[campaign.id]) continue;
  Object.assign(campaign, updates[campaign.id], {
    programYearStart: 2026,
    programYearEnd: 2027,
    programYearLabel: '2026–2027'
  });
  campaign.shortName = campaign.cardTitle;
  campaign.image = campaign.cardImage;
}

// The supplied package explicitly illustrates these three verified marks on Classic Caramel Corn.
const caramel = products.find(product => product.id === 'classic-caramel-corn');
if (caramel) caramel.dietaryAttributes = ['gluten-free', 'ou-kosher', 'dairy'];

async function montage(campaignId, filename, productIds) {
  const selected = productIds.map(id => products.find(product => product.id === id)).filter(Boolean);
  const width = 1400;
  const height = 800;
  const cellWidth = Math.floor(width / Math.ceil(selected.length / 2));
  const composites = [];
  for (let index = 0; index < selected.length; index += 1) {
    const input = path.join(store, selected[index].image.replace(/^\//, ''));
    const image = await sharp(input).resize({ width: cellWidth - 30, height: 350, fit: 'contain', withoutEnlargement: true }).toBuffer();
    composites.push({ input: image, left: (index % Math.ceil(selected.length / 2)) * cellWidth + 15, top: Math.floor(index / Math.ceil(selected.length / 2)) * 390 + 25 });
  }
  const output = path.join(store, 'assets', 'media', 'campaigns', campaignId, 'campaign', filename);
  await sharp({ create: { width, height, channels: 4, background: '#f4f1e8' } }).composite(composites).webp({ quality: 86 }).toFile(output);
}

Promise.all([
  montage('seroogy-candy-2026', 'all-seven-candy-bars.webp', campaigns.find(item => item.id === 'seroogy-candy-2026').productIds),
  montage('popcorn-2026', 'popcorn-campaign-products.webp', campaigns.find(item => item.id === 'popcorn-2026').productIds.filter(id => !id.startsWith('military-donation')).slice(0, 8))
]).then(() => {
  write('data/campaigns.json', campaigns);
  write('data/products.json', products);
  write('data/product-symbols.json', definitions);
  console.log('Applied GRJ-STORE-009 campaign metadata, program years, campaign imagery, and symbol definitions.');
}).catch(error => { console.error(error); process.exit(1); });
