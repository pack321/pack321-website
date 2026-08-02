const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const store = path.join(root, 'store');
const scouts = JSON.parse(fs.readFileSync(path.join(store, 'data', 'scouts.json'), 'utf8'));
const template = fs.readFileSync(path.join(store, 'scout.html'), 'utf8');

const isPublicActive = scout => Boolean(
  scout?.fundraisingCode &&
  scout.fundraisingEnabled &&
  scout.visibility === 'public' &&
  scout.guardianApproved &&
  scout.status !== 'expired'
);

for (const scout of scouts.filter(isPublicActive)) {
  const code = String(scout.fundraisingCode).trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) continue;
  const route = path.join(store, 'scout', code);
  fs.mkdirSync(route, { recursive: true });
  fs.writeFileSync(path.join(route, 'index.html'), template, 'utf8');
}

console.log(`Generated ${scouts.filter(isPublicActive).length} public Scout fundraising route(s).`);
