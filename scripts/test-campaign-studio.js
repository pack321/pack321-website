const assert = require('assert');
const fs = require('fs');
const path = require('path');
const store = path.resolve(__dirname, '../store');
const read = file => JSON.parse(fs.readFileSync(path.join(store, file), 'utf8'));
const campaigns = read('data/campaigns.json');
const products = read('data/products.json');
const symbols = read('data/product-symbols.json');
const media = read('data/media-manifest.json').images;
const campaign = id => campaigns.find(item => item.id === id);
const items = id => products.filter(product => product.campaignId === id);

assert.equal(items('seroogy-candy-2026').length, 7);
assert(items('seroogy-candy-2026').every(product => product.price === 200 && product.priceStatus === 'approved'));

const popcorn = items('popcorn-2026');
assert.equal(popcorn.length, 18);
const expected = {
  'classic-caramel-corn': ['8 oz', 1000],
  'yellow-popping-corn': ['2 lbs', 1200],
  'cinnamon-roll': ['7 oz', 1500],
  'butter-microwave-15': ['37.5 oz', 2200],
  'kettle-corn-microwave-15': ['37.5 oz', 2200],
  'double-butter-microwave-28': ['70 oz', 3000],
  'cheddar-cheese': ['5 oz', 2200],
  'jalapeno-cheese': ['5 oz', 2200],
  'trail-mix': ['15 oz', 2200],
  'peanut-butter-cup': ['15 oz', 2500],
  'mountain-munch': ['14 oz', 2800],
  'caramel-sea-salt': ['15 oz', 2800],
  'freedom-pretzels': ['15 oz', 2800],
  'classic-trio': ['17 oz', 3500],
  'cheese-lovers': ['13 oz', 4500],
  'chocolate-lovers': ['52 oz', 6000]
};
for (const [id, [weight, price]] of Object.entries(expected)) {
  const product = products.find(item => item.id === id);
  assert.equal(product.weight, weight, id);
  assert.equal(product.price, price, id);
}
assert(popcorn.filter(product => product.id.startsWith('military-donation')).every(product => !product.pickupRequired && product.fulfillmentType === 'program-direct-shipment'));

const wreaths = items('rose-wreaths-2026');
assert.equal(wreaths.length, 19);
assert(wreaths.every(product => product.price === 0 && product.priceStatus === 'pending' && !product.availableForSale));
assert.equal(products.find(product => product.id === '27-inch-christmas-tree').vendorDescription, 'Description Pending');
assert.equal(campaign('wreaths-2027').productIds.length, 19);
assert.deepEqual(campaign('wreaths-2027').productIds, campaign('rose-wreaths-2026').productIds);

const veteran = products.find(product => product.id === '20-inch-veterans-wreath');
assert.equal(veteran.fulfillmentType, 'ceremony-placement');
assert(!/ship|deliver/i.test(veteran.vendorDescription));
assert.equal(campaign('veterans-wreaths-2026').primaryAction, 'Sponsor a Veteran’s Wreath');
const verifiedSymbols = symbols.filter(symbol => symbol.verified === true);
assert.deepEqual(verifiedSymbols.map(symbol => symbol.id), ['gluten-free', 'ou-kosher', 'dairy']);
assert(symbols.filter(symbol => symbol.verified === false).every(symbol => symbol.meaning === null && symbol.verificationStatus === 'pending' && !symbol.publiclyInterpreted));
assert.deepEqual(products.find(product => product.id === 'classic-caramel-corn').dietaryAttributes, ['gluten-free', 'ou-kosher', 'dairy']);
for (const campaign of campaigns.filter(item => ['seroogy-candy-2026', 'popcorn-2026', 'rose-wreaths-2026', 'veterans-wreaths-2026'].includes(item.id))) {
  assert.equal(campaign.programYearLabel, '2026–2027');
  assert(campaign.cardTitle.startsWith('2026–2027'));
  assert(fs.existsSync(path.join(store, campaign.cardImage.replace(/^\//, ''))), campaign.cardImage);
}
const candyCard = path.join(store, campaign('seroogy-candy-2026').cardImage.replace(/^\//, ''));
assert.equal(fs.readFileSync(candyCard, { start: 0, end: 3 }).subarray(0, 4).toString('ascii'), 'RIFF');

for (const product of products) {
  assert(!/^https?:|\.pdf(?:$|[?#])/i.test(product.image));
  const file = path.join(store, ...product.image.split('/').filter(Boolean));
  assert(fs.existsSync(file), product.image);
}
for (const image of media) {
  assert(image.alt);
  assert(image.width && image.height);
  assert(['pending-source-image', 'approved-user-supplied'].includes(image.approvalStatus));
}
for (const product of products.filter(product => ['seroogy-candy-2026', 'popcorn-2026', 'rose-wreaths-2026', 'veterans-wreaths-2026'].includes(product.campaignId))) {
  assert.equal(product.mediaApprovalStatus, 'approved-user-supplied', product.id);
}

const builder = fs.readFileSync(path.join(store, 'js/campaign-builders.js'), 'utf8');
assert(/product\.priceStatus\s*===\s*'approved'/.test(builder));
assert(builder.includes('fundraisingCode'));
assert(builder.includes('selectedOptions'));
assert(builder.includes('product-row__media product-thumbnail-wrap'));
assert(builder.includes('product-row__image product-card__image product-thumbnail'));
const builderCss = fs.readFileSync(path.join(store, 'css/campaign-builders.css'), 'utf8');
assert(/\.product-row__image[\s\S]*?object-fit:\s*contain/.test(builderCss));
assert(/\.wreath-product-row \.product-row__image[\s\S]*?width:\s*108px/.test(builderCss));
const fundraisingHtml = fs.readFileSync(path.join(store, 'fundraising.html'), 'utf8');
const indexHtml = fs.readFileSync(path.join(store, 'index.html'), 'utf8');
const helpHtml = fs.readFileSync(path.join(store, 'help.html'), 'utf8');
const campaignJs = fs.readFileSync(path.join(store, 'js/campaign.js'), 'utf8');
const revisionOneCss = fs.readFileSync(path.join(store, 'css/revision-1.css'), 'utf8');
const visualRegressionCss = fs.readFileSync(path.join(store, 'css/visual-regression.css'), 'utf8');
assert(fundraisingHtml.includes('<h1>Fundraising Center</h1>'));
assert(fundraisingHtml.includes('<h2>Choose a campaign to support</h2>'));
assert(indexHtml.includes('<h2>Choose Your Way to Support</h2>'));
assert(indexHtml.includes('class="trust-strip"'));
assert(helpHtml.includes('class="fundraiser-section-title">Reach the right volunteer'));
assert(campaignJs.includes('campaign-hero__title fundraiser-hero-title'));
assert(campaignJs.includes('class="fundraiser-section-title">Choose your way to support'));
assert(campaignJs.includes('class="fundraiser-section-title">Campaign FAQ'));
assert(!/\.campaign-hero h1\{[^}]*Bebas Neue/.test(revisionOneCss));
assert(/\.fundraiser-hero-title\{[^}]*font-family:var\(--font-heading\)[^}]*line-height:1/.test(visualRegressionCss));
assert(/\.fundraiser-section-title\{[^}]*font-family:var\(--font-heading\)[^}]*line-height:1/.test(visualRegressionCss));
const publicJson = JSON.stringify({ campaigns, products });
for (const forbidden of ['dateOfBirth', 'parentDetails', 'schoolInformation', 'privateScoutHQId', 'internalFinancialNotes']) {
  assert(!publicJson.includes(forbidden));
}
console.log('Fundraiser catalogs, pricing guards, fulfillment, symbols, privacy, and local media validation passed.');
