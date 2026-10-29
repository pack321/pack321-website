import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../functions/api/receipts.js',import.meta.url),'utf8');
const {onRequestGet,onRequestPost}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('no configuration exposes no credentials and cannot accept uploads',async()=>{
  const availability=await onRequestGet({env:{}});
  const config=await availability.json();
  assert.equal(config.enabled,false); assert.equal(config.siteKey,null); assert.equal(config.setupIssues.length,5);
  const response=await onRequestPost({env:{},request:new Request('https://pack321wi.org/api/receipts',{method:'POST',headers:{Origin:'https://pack321wi.org','Content-Type':'application/json'},body:'{}'})});
  assert.equal(response.status,503);
});
test('cross-origin receipt requests are denied before any integration call',async()=>{
  const response=await onRequestPost({env:{},request:new Request('https://pack321wi.org/api/receipts',{method:'POST',headers:{Origin:'https://example.com'},body:'{}'})});
  assert.equal(response.status,403);
});

test('configuration diagnostics identify short signing secrets without revealing values',async()=>{
  const env={RECEIPTS_ENABLED:'true',RECEIPTS_SCRIPT_URL:'https://script.google.com/macros/s/test-id/exec',RECEIPTS_SIGNING_SECRET:'too-short',RECEIPTS_TURNSTILE_SITE_KEY:'public-test-key',RECEIPTS_TURNSTILE_SECRET:'private-test-value'};
  const response=await onRequestGet({env}); const body=await response.text(); const config=JSON.parse(body);
  assert.equal(config.enabled,false); assert.equal(config.setupIssues.length,1);
  assert.match(config.setupIssues[0],/RECEIPTS_SIGNING_SECRET/);
  assert.ok(!body.includes('too-short')); assert.ok(!body.includes('private-test-value'));
});

test('a forty-character signing secret passes availability checks without revealing it',async()=>{
  const secret='x'.repeat(40);
  const env={RECEIPTS_ENABLED:'true',RECEIPTS_SCRIPT_URL:'https://script.google.com/macros/s/test-id/exec',RECEIPTS_SIGNING_SECRET:secret,RECEIPTS_TURNSTILE_SITE_KEY:'public-test-key',RECEIPTS_TURNSTILE_SECRET:'private-test-value'};
  const response=await onRequestGet({env}); const body=await response.text();const config=JSON.parse(body);
  assert.equal(config.enabled,true);assert.deepEqual(config.setupIssues,[]);
  assert.ok(!body.includes(secret));assert.ok(!body.includes('private-test-value'));
  delete env.RECEIPTS_SIGNING_SECRET;
  const missing=await (await onRequestGet({env})).json();
  assert.match(missing.setupIssues[0],/missing from this deployment/);
});
