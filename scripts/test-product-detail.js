const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message);};
const html=read('store/product.html');
const script=read('store/js/product.js');
const styles=read('store/css/store-v3-2-product-detail.css');
const products=json('store/data/products.json');
const campaigns=json('store/data/campaigns.json');
const byCampaign=Object.fromEntries(campaigns.map(item=>[item.id,item]));
assert(html.includes('data-product-detail'),'dynamic Product Detail mount is missing');
assert(html.includes('store-v3-2-product-detail.css'),'shared Product Detail stylesheet is missing');
assert(script.includes('normalizeId'),'product ID validation is missing');
assert(script.includes('product-lightbox'),'accessible lightbox rendering is missing');
assert(script.includes('renderRelated'),'dynamic related-product rendering is missing');
assert(script.includes('Pricing Pending'),'pending-price state is missing');
assert(script.includes('Product Not Found'),'safe not-found state is missing');
assert(styles.includes('object-fit:contain'),'contained product imagery is missing');
for(const id of ['chocolate-meltaway','classic-caramel-corn','platinum-24-wreath','27-inch-christmas-tree','military-donation-30']){
  const product=products.find(item=>item.id===id);assert(product,`required validation product is missing: ${id}`);assert(product&&byCampaign[product.campaignId],`campaign relationship is missing: ${id}`);
}
const pending=products.filter(item=>item.priceStatus==='pending');assert(pending.length>0,'pending-price validation fixture is missing');pending.forEach(item=>assert(!item.availableForSale&&Number(item.price)===0,`pending product must not be purchasable: ${item.id}`));
const productSpecific=fs.readdirSync(path.join(root,'store')).filter(name=>/^(chocolate|popcorn|wreath|candy|military)-.*\.html$/i.test(name));assert(productSpecific.length===0,`product-specific HTML pages found: ${productSpecific.join(', ')}`);
if(failures.length){console.error(failures.map(item=>`FAIL: ${item}`).join('\n'));process.exit(1);}
console.log(`Dynamic Product Detail validation passed: ${products.length} products, ${pending.length} pending-price records, one shared template.`);
