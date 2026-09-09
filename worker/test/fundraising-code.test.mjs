import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../src/index.mjs';

const campaign={public_display_name:'A Pack 321 Scout',campaign_id:'seroogy-candy-2026',campaign_name:'Candy Fundraiser'};
const environment=rows=>({
  COMMERCE_MODE:'test',STOREFRONT_ORIGINS:'https://test-shop.pack321wi.org',
  LOOKUP_RATE_LIMITER:{limit:async()=>({success:true})},
  DB:{prepare:sql=>({bind:(...values)=>({all:async()=>({results:rows(sql,values)})})})},
});

test('opaque fundraising code resolves only to a public campaign projection',async()=>{
  const response=await worker.fetch(new Request('https://api.example/api/fundraising-code/0A2B3C4D?campaign=seroogy-candy-2026',{headers:{origin:'https://test-shop.pack321wi.org','cf-connecting-ip':'192.0.2.1'}}),environment(()=>[campaign]));
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{available:true,attribution:'scout',campaignId:'seroogy-candy-2026',campaigns:[{id:'seroogy-candy-2026',title:'Candy Fundraiser'}],displayName:'A Pack 321 Scout'});
});

test('unknown, revoked, and malformed codes share a generic response',async()=>{
  for(const code of ['AVAGRIFFIN32','AB12CD','0A2B3C4D']){const response=await worker.fetch(new Request(`https://api.example/api/fundraising-code/${code}?campaign=seroogy-candy-2026`),environment(()=>[]));assert.equal(response.status,404);assert.deepEqual(await response.json(),{error:'REQUEST_UNAVAILABLE',message:'We could not complete this request.'});}
});

test('lookup rate limiter blocks enumeration without code-state detail',async()=>{
  const env=environment(()=>[campaign]);env.LOOKUP_RATE_LIMITER={limit:async()=>({success:false})};const response=await worker.fetch(new Request('https://api.example/api/fundraising-code/0A2B3C4D?campaign=seroogy-candy-2026'),env);assert.equal(response.status,429);assert.equal((await response.json()).error,'REQUEST_UNAVAILABLE');
});

