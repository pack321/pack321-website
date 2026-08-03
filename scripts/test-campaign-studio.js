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

const veteran = products.find(product => product.id === '20-inch-veterans-wreath');
assert.equal(veteran.fulfillmentType, 'ceremony-placement');
assert(!/ship|deliver/i.test(veteran.vendorDescription));
assert.equal(campaign('veterans-wreaths-2026').primaryAction, 'Sponsor a Veteran’s Wreath');
assert(symbols.every(symbol => symbol.meaning === null && symbol.verificationStatus === 'pending' && !symbol.publiclyInterpreted));

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
assert(builder.includes("product.priceStatus!=='pending'"));
assert(builder.includes('fundraisingCode'));
assert(builder.includes('selectedOptions'));
const publicJson = JSON.stringify({ campaigns, products });
for (const forbidden of ['dateOfBirth', 'parentDetails', 'schoolInformation', 'privateScoutHQId', 'internalFinancialNotes']) {
  assert(!publicJson.includes(forbidden));
}
console.log('Fundraiser catalogs, pricing guards, fulfillment, symbols, privacy, and local media validation passed.');
