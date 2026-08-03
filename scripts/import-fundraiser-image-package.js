const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const packageRoot = path.resolve(process.argv[2] || '');
if (!packageRoot || !fs.existsSync(path.join(packageRoot, 'media-manifest.json'))) {
  throw new Error('Usage: node scripts/import-fundraiser-image-package.js <extracted-package-directory>');
}

const store = path.join(root, 'store');
const productsPath = path.join(store, 'data', 'products.json');
const mediaManifestPath = path.join(store, 'data', 'media-manifest.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const supplied = JSON.parse(fs.readFileSync(path.join(packageRoot, 'media-manifest.json'), 'utf8'));
const campaignFolders = {
  candy: 'seroogy-candy-2026',
  popcorn: 'popcorn-2026',
  wreaths: 'rose-wreaths-2026',
  'veterans-wreaths': 'veterans-wreaths-2026'
};
const productAliases = {
  'butter-microwave-15-pack': ['butter-microwave-15'],
  'kettle-corn-microwave-15-pack': ['kettle-corn-microwave-15'],
  'double-butter-microwave-28-pack': ['double-butter-microwave-28'],
  'military-donation': ['military-donation-30', 'military-donation-50'],
  '20-inch-veterans-wreath': ['20-inch-veterans-wreath']
};

function rel(...parts) {
  return parts.join('/').replace(/\\/g, '/');
}

async function main() {
  const imageRows = [];
  for (const item of supplied) {
    const parts = item.relative_path.split('/');
    const sourceCampaign = parts[3];
    const campaignId = campaignFolders[sourceCampaign];
    if (!campaignId) throw new Error(`Unknown campaign folder: ${sourceCampaign}`);

    const source = path.join(packageRoot, item.relative_path);
    if (!fs.existsSync(source)) throw new Error(`Missing supplied image: ${item.relative_path}`);
    const section = parts[4];
    const basename = path.parse(parts.at(-1)).name;
    const destinationDirectory = path.join(store, 'assets', 'media', 'campaigns', campaignId, section);
    fs.mkdirSync(destinationDirectory, { recursive: true });

    const variants = {};
    for (const [variant, maxWidth] of [['thumb', 400], ['card', 800], ['detail', 1400]]) {
      const filename = `${basename}-${variant}.webp`;
      const destination = path.join(destinationDirectory, filename);
      await sharp(source).resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(destination);
      const metadata = await sharp(destination).metadata();
      variants[variant] = {
        path: rel('assets', 'media', 'campaigns', campaignId, section, filename),
        width: metadata.width,
        height: metadata.height
      };
    }

    const defaultIds = [basename];
    const productIds = productAliases[basename] || defaultIds;
    const matchedProducts = products.filter(product => product.campaignId === campaignId && productIds.includes(product.id));
    for (const product of matchedProducts) {
      product.image = `/${variants.card.path}`;
      product.images = [`/${variants.card.path}`, `/${variants.detail.path}`];
      product.imageAlt = `${product.name} fundraiser product`;
      product.imageWidth = variants.card.width;
      product.imageHeight = variants.card.height;
      product.mediaApprovalStatus = 'approved-user-supplied';
      imageRows.push({
        id: `${campaignId}-${product.id}`,
        campaignId,
        productId: product.id,
        sourceFilename: item.source_file,
        suppliedPath: item.relative_path,
        localPath: variants.card.path,
        thumbnailPath: variants.thumb.path,
        detailPath: variants.detail.path,
        width: variants.card.width,
        height: variants.card.height,
        alt: product.imageAlt,
        approvalStatus: 'approved-user-supplied',
        sourceType: 'provided-image-package',
        missingSource: false
      });
    }
  }

  const existingManifest = JSON.parse(fs.readFileSync(mediaManifestPath, 'utf8'));
  const importedKeys = new Set(imageRows.map(row => `${row.campaignId}:${row.productId}`));
  existingManifest.images = existingManifest.images.filter(row => !importedKeys.has(`${row.campaignId}:${row.productId}`));
  existingManifest.images.push(...imageRows);
  existingManifest.generatedAt = new Date().toISOString();
  existingManifest.sourcePackage = 'Pack321-Fundraiser-Images-Codex.zip';

  fs.writeFileSync(productsPath, `${JSON.stringify(products, null, 2)}\n`);
  fs.writeFileSync(mediaManifestPath, `${JSON.stringify(existingManifest, null, 2)}\n`);
  console.log(`Imported ${supplied.length} supplied images and mapped ${imageRows.length} product records.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
