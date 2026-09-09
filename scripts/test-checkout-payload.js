const assert=require('assert');
const {build,requiresPickup}=require('../store/js/checkout-payload.js');
const products=require('../store/data/products.json');

const payload=build({
  cart:{attribution:{type:'scout',scoutCode:'AB12CD',attributionSource:'code-search'},items:[{productId:'chocolate-meltaway',quantity:2,options:{},price:1,total:2,inventory:true}]},
  products,
  contact:{firstName:' Pat ',lastName:' Example ',email:' pat@example.test ',phone:' 555-0100 '},
  pickupSelection:'carollton-elementary'
});
assert.deepStrictEqual(Object.keys(payload).sort(),['attributionSource','customerContact','fundraisingCode','items','pickupSelection'].sort());
assert.deepStrictEqual(Object.keys(payload.items[0]).sort(),['optionIds','productId','quantity'].sort());
assert.deepStrictEqual(payload.items[0].optionIds,[]);
assert.strictEqual(payload.fundraisingCode,'AB12CD');
assert.strictEqual(JSON.stringify(payload).includes('price'),false);
assert.strictEqual(JSON.stringify(payload).includes('inventory'),false);
const militaryPayload=build({cart:{attribution:{type:'pack',attributionSource:'pack-wide'},items:[{productId:'military-donation-30',quantity:1,options:{}}]},products,contact:{},pickupSelection:null});
assert.strictEqual(militaryPayload.pickupSelection,null);
assert.strictEqual(requiresPickup({items:[{productId:'military-donation-30'}]},products),false);
assert.strictEqual(requiresPickup({items:[{productId:'chocolate-meltaway'}]},products),true);
const mixed=build({cart:{items:[{productId:'chocolate-meltaway',quantity:1,options:{}},{productId:'military-donation-30',quantity:1,options:{}}]},products,contact:{},pickupSelection:'carollton-elementary'});
assert.strictEqual(mixed.items.length,2);
console.log('Checkout payload allowlist passed.');
