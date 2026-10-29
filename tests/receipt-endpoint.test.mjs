import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../functions/api/receipts.js',import.meta.url),'utf8');
const {onRequestGet,onRequestPost}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('no configuration exposes no credentials and cannot accept uploads',async()=>{
  const availability=await onRequestGet({env:{}});
  assert.deepEqual(await availability.json(),{enabled:false,siteKey:null});
  const response=await onRequestPost({env:{},request:new Request('https://pack321wi.org/api/receipts',{method:'POST',headers:{Origin:'https://pack321wi.org','Content-Type':'application/json'},body:'{}'})});
  assert.equal(response.status,503);
});
test('cross-origin receipt requests are denied before any integration call',async()=>{
  const response=await onRequestPost({env:{},request:new Request('https://pack321wi.org/api/receipts',{method:'POST',headers:{Origin:'https://example.com'},body:'{}'})});
  assert.equal(response.status,403);
});
