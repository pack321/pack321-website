const test=require('node:test');
const assert=require('node:assert/strict');
const rules=require('../receipts/rules.js');
test('Pack year switches on August 1 using purchase date',()=>{
  assert.equal(rules.financialYear('2027-07-31'),'2026–2027');
  assert.equal(rules.financialYear('2027-08-01'),'2027–2028');
  assert.equal(rules.financialYear('2027-01-01'),'2026–2027');
  assert.equal(rules.financialYear('2028-02-29'),'2027–2028');
});
test('rejects impossible purchase dates',()=>{
  for(const date of ['2027-02-29','2026-13-01','2026-04-31','',null])assert.throws(()=>rules.financialYear(date));
});
test('subjects have exactly the agreed format and cents',()=>{
  assert.equal(rules.subject('Camping','42.18'),'Receipt-Camping-$42.18');
  assert.equal(rules.subject('Pinewood Derby','85'),'Receipt-PinewoodDerby-$85.00');
  assert.equal(rules.subject('Blue & Gold Banquet','0.10'),'Receipt-BlueGoldBanquet-$0.10');
});
test('rejects ambiguous, negative, zero and overprecise amounts',()=>{
  for(const value of ['0','-1','42.183','1e3','$42.18','1,000.00','NaN'])assert.throws(()=>rules.amount(value));
});
