import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const source=await readFile(new URL('../functions/api/receipts.js',import.meta.url),'utf8');
const {onRequestPost}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('bridge accepts short references and existing UUID responses during script rollout',async()=>{
  const original=globalThis.fetch;
  const id='11111111-1111-1111-1111-111111111111';
  const env={RECEIPTS_ENABLED:'true',RECEIPTS_SCRIPT_URL:'https://script.google.com/macros/s/test-id/exec',RECEIPTS_SIGNING_SECRET:'x'.repeat(40),RECEIPTS_TURNSTILE_SITE_KEY:'public',RECEIPTS_TURNSTILE_SECRET:'private'};
  try {
    for(const reference of ['R-2627-0001',id]) {
      globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('siteverify')?{success:true,action:'receipt',hostname:'receipts.pack321wi.org'}:{ok:true,...(reference===id?{}:{requestId:id}),reference,subject:'Receipt-Test-$0.01',emailSent:true}));
      const request=new Request('https://receipts.pack321wi.org/api/receipts',{method:'POST',headers:{Origin:'https://receipts.pack321wi.org','Content-Type':'application/json'},body:JSON.stringify({token:'synthetic-token',data:{requestId:id}})});
      const response=await onRequestPost({request,env});const result=await response.json();
      assert.equal(response.status,200,JSON.stringify(result));assert.equal(result.reference,reference);
    }
  } finally {globalThis.fetch=original;}
});
