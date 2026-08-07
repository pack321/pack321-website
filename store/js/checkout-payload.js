(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.Pack321CheckoutPayload=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const optionValueId=value=>String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const clean=value=>String(value||'').trim();
  const requiresPickup=(cart,products)=>{const productMap=Object.fromEntries(products.map(product=>[product.id,product]));return cart.items.some(item=>{const product=productMap[item.productId];return product&&product.pickupRequired!==false&&product.fulfillmentType!=='program-direct-shipment';});};
  function build({cart,products,contact,pickupSelection}){
    const productMap=Object.fromEntries(products.map(product=>[product.id,product]));
    const campaignIds=[...new Set(cart.items.map(item=>productMap[item.productId]?.campaignId).filter(Boolean))];
    if(campaignIds.length>1)throw new Error('Checkout requires items from a single fundraising campaign.');
    const attribution=cart.attribution||cart.items.find(item=>item.attribution)?.attribution||{};
    return {
      items:cart.items.map(item=>({productId:clean(item.productId),optionIds:Object.entries(item.options||{}).filter(([,value])=>value).map(([optionId,value])=>({optionId:clean(optionId),valueId:optionValueId(value)})),quantity:Number(item.quantity)})),
      campaignId:campaignIds[0]||null,
      fundraisingCode:attribution.type==='scout'?clean(attribution.scoutCode).toUpperCase()||null:null,
      attributionSource:clean(attribution.attributionSource)||'pack-wide',
      pickupSelection:clean(pickupSelection)||null,
      customerContact:{firstName:clean(contact.firstName),lastName:clean(contact.lastName),email:clean(contact.email),phone:clean(contact.phone)}
    };
  }
  return {build,optionValueId,requiresPickup};
});
