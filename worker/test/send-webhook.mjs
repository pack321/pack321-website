import {createHmac} from 'node:crypto';
const base=process.argv[2]||'http://127.0.0.1:8787';
const event={id:'evt_local_paid_1',type:'checkout.session.completed',data:{object:{client_reference_id:'ord_webhooktest',metadata:{internal_order_reference:'ord_webhooktest'},payment_status:'paid',payment_intent:'pi_local_1',amount_total:3500,currency:'usd'}}};
const body=JSON.stringify(event);const timestamp=Math.floor(Date.now()/1000);const signature=createHmac('sha256','whsec_test_secret').update(`${timestamp}.${body}`).digest('hex');
for(let attempt=0;attempt<2;attempt++){const response=await fetch(`${base}/api/stripe/webhook`,{method:'POST',headers:{'content-type':'application/json','stripe-signature':`t=${timestamp},v1=${signature}`},body});console.log(response.status,await response.text());}
