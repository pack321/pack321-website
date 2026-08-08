const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'store/js/store-utils.js'), 'utf8');
const sandbox = { window: {}, Intl, Number, String, Date, Math, URLSearchParams };
vm.runInNewContext(source, sandbox);
const progress = sandbox.window.StoreUtils.getFundraisingProgress;

const valid = progress({ goal: 1000, raised: 410 }, { visibility: 'public' });
assert.equal(valid.hasValidGoal, true);
assert.equal(valid.goal, 1000);
assert.equal(valid.raised, 410);
assert.equal(valid.percent, 41);

for (const [label, goal] of [
  ['missing', undefined],
  ['null', null],
  ['zero placeholder', 0],
  ['malformed', 'not-a-goal']
]) {
  const result = progress({ goal, raised: 410 }, { visibility: 'public' });
  assert.equal(result.hasValidGoal, false, label);
  assert.equal(result.goal, null, label);
  assert.equal(result.percent, null, label);
  assert.equal(result.raised, 410, label);
}

assert.equal(progress({ goal: 1000, raised: 410, goalApprovalStatus: 'pending' }, { visibility: 'public' }).hasValidGoal, false);
assert.equal(progress({ goal: 1000, raised: 410, goalApprovalStatus: 'approved' }, { visibility: 'public' }).percent, 41);

const catalog = fs.readFileSync(path.join(root, 'store/js/catalog.js'), 'utf8');
const campaign = fs.readFileSync(path.join(root, 'store/js/campaign.js'), 'utf8');
const scout = fs.readFileSync(path.join(root, 'store/js/scout.js'), 'utf8');
for (const [name, script] of [['catalog', catalog], ['campaign', campaign], ['scout', scout]]) {
  assert(script.includes('getFundraisingProgress'), `${name} must use the shared goal rule`);
  assert(script.includes('Goal Pending'), `${name} must render the approved pending language`);
}
assert(!catalog.includes('formatCurrency((progress.goal||0)*100)'), 'campaign cards still format placeholder goals');
assert(!campaign.includes('formatCurrency((progress.goal||0)*100)'), 'campaign detail still formats placeholder goals');
assert(!scout.includes('formatCurrency((p.goal||0)*100)'), 'Scout campaign cards still format placeholder goals');
assert(scout.includes('StoreUtils.setAttribution'), 'Scout attribution must remain intact');
assert(scout.includes('publicDisplayName'), 'Scout privacy-safe display name must remain intact');
assert(catalog.includes('getCampaignUrl(c)'), 'Pack-wide campaign navigation must remain intact');

console.log('Goal progress validation passed: positive, missing, null, zero, malformed, approval, attribution, and Pack-wide cases.');
