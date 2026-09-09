export const ORDER_STATUSES=['pending','checkout_created','paid','payment_failed','cancelled','refunded','partially_refunded','payment-reconciliation-required'];
export const FULFILLMENT_STATUSES=['not_required','awaiting_campaign_close','ordered_from_vendor','ready_for_pickup','partially_completed','completed','reconciliation_required'];
export const FULFILLMENT_TYPES=['local-pickup','program-direct-shipment','ceremony-placement','none'];
export const ONLINE_FEE_AMOUNT=300;
export const TAX_AMOUNT=0;
export const REFUND_CATEGORIES={
  customer_requested_full:0,
  customer_requested_partial:0,
  pack_cancellation:ONLINE_FEE_AMOUNT,
  pack_unfulfillable:ONLINE_FEE_AMOUNT,
  pack_duplicate:ONLINE_FEE_AMOUNT,
  pack_error:ONLINE_FEE_AMOUNT
};
export const codePattern=/^[0-9A-HJKMNP-TV-Z]{8}$/;
export const clean=value=>String(value??'').trim();
export const normalizeEmail=value=>clean(value).toLowerCase();
export const now=()=>new Date().toISOString();
export const id=prefix=>`${prefix}_${crypto.randomUUID().replaceAll('-','')}`;

export function validateShape(body){
  if(!body||!Array.isArray(body.items)||body.items.length<1||body.items.length>50)throw new Error('INVALID_ORDER');
  if(!body.customerContact||!clean(body.customerContact.firstName)||!clean(body.customerContact.lastName)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(body.customerContact.email)))throw new Error('INVALID_CONTACT');
  for(const item of body.items){
    if(!/^[a-z0-9][a-z0-9-]{1,80}$/.test(clean(item.productId))||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>99||!Array.isArray(item.optionIds))throw new Error('INVALID_ITEM');
    if('price' in item||'unitAmount' in item||'lineAmount' in item)throw new Error('CLIENT_PRICE_REJECTED');
    for(const option of item.optionIds)if(!/^[a-z0-9][a-z0-9-]{0,50}$/.test(clean(option.optionId))||!/^[a-z0-9][a-z0-9-]{0,80}$/.test(clean(option.valueId)))throw new Error('INVALID_OPTION');
  }
  const code=clean(body.fundraisingCode).toUpperCase();if(code&&!codePattern.test(code))throw new Error('INVALID_ATTRIBUTION');
  return {...body,fundraisingCode:code||null,pickupSelection:clean(body.pickupSelection)||null,attributionSource:clean(body.attributionSource).slice(0,64)||'pack-wide',sourcePage:clean(body.sourcePage).slice(0,200)||null,customerContact:{firstName:clean(body.customerContact.firstName).slice(0,80),lastName:clean(body.customerContact.lastName).slice(0,80),email:normalizeEmail(body.customerContact.email).slice(0,254),phone:clean(body.customerContact.phone).slice(0,40)||null}};
}

export async function sha256(value){const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,'0')).join('');}
export async function checkoutFingerprint(key,input){return sha256(JSON.stringify({key,email:input.customerContact.email,items:input.items.map(item=>({productId:item.productId,quantity:item.quantity,optionIds:[...item.optionIds].sort((a,b)=>`${a.optionId}:${a.valueId}`.localeCompare(`${b.optionId}:${b.valueId}`))})).sort((a,b)=>a.productId.localeCompare(b.productId)),fundraisingCode:input.fundraisingCode,pickupSelection:input.pickupSelection}));}

const CROCKFORD='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export function publicOrderNumber(date=new Date(),randomBytes=crypto.getRandomValues(new Uint8Array(5))){let value=0n;for(const byte of randomBytes)value=(value<<8n)|BigInt(byte);let suffix='';for(let i=0;i<8;i++){suffix=CROCKFORD[Number(value&31n)]+suffix;value>>=5n;}return `P321-${date.toISOString().slice(0,10).replaceAll('-','')}-${suffix}`;}

export async function verifyStripeSignature(raw,header,secret,tolerance=300,epoch=Math.floor(Date.now()/1000)){
  const pairs=String(header||'').split(',').map(part=>part.trim().split('=',2));const timestamp=Number(pairs.find(([key])=>key==='t')?.[1]);const signatures=pairs.filter(([key,value])=>key==='v1'&&value).map(([,value])=>value);if(!timestamp||!signatures.length||Math.abs(epoch-timestamp)>tolerance)return false;
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const digest=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${timestamp}.${raw}`));const expected=[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  return signatures.some(signature=>{if(expected.length!==signature.length)return false;let mismatch=0;for(let i=0;i<expected.length;i++)mismatch|=expected.charCodeAt(i)^signature.charCodeAt(i);return mismatch===0;});
}

export function accounting(subtotal,stripeFee=0,refund=0){const gross=subtotal+ONLINE_FEE_AMOUNT+TAX_AMOUNT;return{subtotalAmount:subtotal,taxAmount:TAX_AMOUNT,customerFeeAmount:ONLINE_FEE_AMOUNT,grossAmount:gross,stripeFeeAmount:stripeFee,refundAmount:refund,netAmount:gross-stripeFee-refund};}

export function refundDecision(category,merchandiseRefundAmount,remainingMerchandiseAmount,feeAlreadyRefunded=false){
  if(!Object.hasOwn(REFUND_CATEGORIES,category))throw new Error('INVALID_REFUND_CATEGORY');
  if(!Number.isInteger(merchandiseRefundAmount)||merchandiseRefundAmount<0||merchandiseRefundAmount>remainingMerchandiseAmount)throw new Error('INVALID_REFUND_AMOUNT');
  const customerFeeRefundAmount=feeAlreadyRefunded?0:REFUND_CATEGORIES[category];
  if(merchandiseRefundAmount+customerFeeRefundAmount<=0)throw new Error('INVALID_REFUND_AMOUNT');
  return{category,merchandiseRefundAmount,customerFeeRefundAmount,totalRefundAmount:merchandiseRefundAmount+customerFeeRefundAmount};
}

export function stripeForm(order,items,origin,packId){
  const form=new URLSearchParams({mode:'payment',client_reference_id:order.order_number,customer_email:order.customer_email,success_url:`${origin}/confirmation.html?order=${encodeURIComponent(order.order_number)}&session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${origin}/cart.html?checkout=cancelled`,'metadata[order_number]':order.order_number,'metadata[campaign_ids]':order.campaign_id||'mixed-or-pack','metadata[attribution_type]':order.attribution_type,'metadata[scout_reference]':order.scout_attribution_ref||'','metadata[source_page]':order.source_page||'storefront','metadata[pack_identifier]':packId,'metadata[fulfillment_summary]':order.fulfillment_summary});
  items.forEach((item,index)=>{form.set(`line_items[${index}][price_data][currency]`,item.currency);form.set(`line_items[${index}][price_data][unit_amount]`,String(item.unit_amount));form.set(`line_items[${index}][price_data][product_data][name]`,item.product_name);form.set(`line_items[${index}][quantity]`,String(item.quantity));});
  for(const [key,value] of Object.entries({order_number:order.order_number,pack_identifier:packId,attribution_type:order.attribution_type,scout_reference:order.scout_attribution_ref||''}))form.set(`payment_intent_data[metadata][${key}]`,value);
  form.set('payment_method_types[0]','card');
  const feeIndex=items.length;form.set(`line_items[${feeIndex}][price_data][currency]`,order.currency);form.set(`line_items[${feeIndex}][price_data][unit_amount]`,String(ONLINE_FEE_AMOUNT));form.set(`line_items[${feeIndex}][price_data][product_data][name]`,'Online Convenience Fee');form.set(`line_items[${feeIndex}][quantity]`,'1');return form;
}
