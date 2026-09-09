import assert from 'node:assert/strict';
import {accounting,refundDecision,validateShape,verifyStripeSignature,stripeForm} from '../src/domain.mjs';

const base={items:[{productId:'classic-holiday-wreath',optionIds:[],quantity:1}],fundraisingCode:'0A2B3C4D',attributionSource:'code-search',pickupSelection:'carollton-elementary',sourcePage:'/scout/0A2B3C4D',customerContact:{firstName:'Pat',lastName:'Example',email:'PAT@example.test',phone:'555-0100'}};
const clean=validateShape(base);assert.equal(clean.customerContact.email,'pat@example.test');assert.equal(clean.fundraisingCode,'0A2B3C4D');
assert.throws(()=>validateShape({...base,items:[{productId:'bad!',optionIds:[],quantity:1}]}),/INVALID_ITEM/);assert.throws(()=>validateShape({...base,fundraisingCode:'bad code'}),/INVALID_ATTRIBUTION/);assert.throws(()=>validateShape({...base,items:[{...base.items[0],price:1}]}),/CLIENT_PRICE_REJECTED/);

const raw=JSON.stringify({id:'evt_test'});const secret='whsec_test_secret';const timestamp=Math.floor(Date.now()/1000);const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const bytes=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${timestamp}.${raw}`));const signature=[...new Uint8Array(bytes)].map(byte=>byte.toString(16).padStart(2,'0')).join('');assert.equal(await verifyStripeSignature(raw,`t=${timestamp},v1=${signature}`,secret),true);assert.equal(await verifyStripeSignature(raw,`t=${timestamp},v1=bad,v1=${signature}`,secret),true);assert.equal(await verifyStripeSignature(raw,`t=${timestamp-1000},v1=${signature}`,secret),false);assert.equal(await verifyStripeSignature(`${raw}x`,`t=${timestamp},v1=${signature}`,secret),false);

const totals=accounting(3500);assert.equal(totals.grossAmount,3800);assert.equal(totals.customerFeeAmount,300);assert.equal(totals.taxAmount,0);
assert.deepEqual(refundDecision('customer_requested_full',3500,3500),{category:'customer_requested_full',merchandiseRefundAmount:3500,customerFeeRefundAmount:0,totalRefundAmount:3500});
assert.deepEqual(refundDecision('customer_requested_partial',1000,3500),{category:'customer_requested_partial',merchandiseRefundAmount:1000,customerFeeRefundAmount:0,totalRefundAmount:1000});
assert.deepEqual(refundDecision('pack_cancellation',3500,3500),{category:'pack_cancellation',merchandiseRefundAmount:3500,customerFeeRefundAmount:300,totalRefundAmount:3800});
assert.deepEqual(refundDecision('pack_error',0,3500),{category:'pack_error',merchandiseRefundAmount:0,customerFeeRefundAmount:300,totalRefundAmount:300});
assert.equal(refundDecision('pack_duplicate',3500,3500,true).customerFeeRefundAmount,0);
assert.throws(()=>refundDecision('unknown',100,3500),/INVALID_REFUND_CATEGORY/);
const form=stripeForm({customer_email:'pat@example.test',order_number:'P321-20260807-7K4M9Q2D',campaign_id:'wreaths-2026',attribution_type:'scout',scout_attribution_ref:'0A2B3C4D',source_page:'/scout/0A2B3C4D',fulfillment_summary:'local-pickup',currency:'usd'},[{currency:'usd',unit_amount:3500,product_name:'Classic Holiday Wreath',quantity:1}],'https://store.example','pack-321');assert.equal(form.get('line_items[0][price_data][unit_amount]'),'3500');assert.equal(form.get('line_items[1][price_data][unit_amount]'),'300');assert.equal(form.get('metadata[order_number]'),'P321-20260807-7K4M9Q2D');assert.equal(form.has('metadata[internal_order_reference]'),false);assert.match(form.get('success_url'),/\{CHECKOUT_SESSION_ID\}/);
assert.equal(form.get('payment_method_types[0]'),'card');assert.equal(form.get('payment_intent_data[metadata][order_number]'),'P321-20260807-7K4M9Q2D');

const workerSource=await (await import('node:fs/promises')).readFile(new URL('../src/index.mjs',import.meta.url),'utf8');assert.match(workerSource,/INSERT INTO stripe_events/);assert.match(workerSource,/charge\.refunded/);assert.match(workerSource,/checkout\.expired/);assert.match(workerSource,/payment-reconciliation-required/);assert.doesNotMatch(workerSource,/console\.(?:log|info|warn|error)/);
console.log('Worker domain, pricing boundary, signature, fee, Stripe metadata, refund, and reconciliation tests passed.');
