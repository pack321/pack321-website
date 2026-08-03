const assert=require('assert');
const {build}=require('../store/js/checkout-payload.js');
const products=require('../store/data/products.json');

const payload=build({
  cart:{attribution:{type:'scout',scoutCode:'AB12CD',attributionSource:'code-search'},items:[{productId:'chocolate-meltaway',quantity:2,options:{},price:1,total:2,inventory:true}]},
  products,
  contact:{firstName:' Pat ',lastName:' Example ',email:' pat@example.test ',phone:' 555-0100 '},
  pickupSelection:'carollton-elementary'
});
assert.deepStrictEqual(Object.keys(payload).sort(),['attributionSource','campaignId','customerContact','fundraisingCode','items','pickupSelection'].sort());
assert.deepStrictEqual(Object.keys(payload.items[0]).sort(),['optionIds','productId','quantity'].sort());
assert.deepStrictEqual(payload.items[0].optionIds,[]);
assert.strictEqual(payload.campaignId,'seroogy-candy-2026');
assert.strictEqual(payload.fundraisingCode,'AB12CD');
assert.strictEqual(JSON.stringify(payload).includes('price'),false);
assert.strictEqual(JSON.stringify(payload).includes('inventory'),false);
assert.throws(()=>build({cart:{items:[{productId:'chocolate-meltaway',quantity:1},{productId:'classic-caramel-corn',quantity:1}]},products,contact:{},pickupSelection:null}),/single fundraising campaign/);
console.log('Checkout payload allowlist passed.');
