const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('store/support-route.html','utf8');
const route=fs.readFileSync('store/js/support.js','utf8');
const redirects=fs.readFileSync('store/_redirects','utf8');
const worker=fs.readFileSync('store/_worker.js','utf8');

for(const asset of ['/css/store.css','/css/store-layout.css','/css/store-components.css','/js/store.js','/js/support.js'])assert.match(html,new RegExp(asset.replaceAll('/','\\/')));
assert.match(fs.readFileSync('store/js/api-config.js','utf8'),/pack321-storefront-api-production-disabled\.wicubscoutpack321\.workers\.dev/);
assert.match(html,/products and checkout are not yet live/);
assert.doesNotMatch(redirects,/\/support\/\*/);
assert.match(worker,/\^\\\/support\\\/\[\^\/\]\+/);
assert.match(worker,/env\.ASSETS\.fetch/);
assert.match(worker,/new URL\("\/support-route"/);
assert.match(route,/StoreUtils\.setAttribution/);
assert.match(route,/location\.replace/);
assert.match(route,/campaign\.html/);
assert.match(route,/Fundraising link unavailable/);
assert.doesNotMatch(route,/display_name|household|dependent|email|phone|AVAGRIFFIN/);

async function executeSupportRoute({pathname,apiResult,ok=true}){
  let ready;
  const completed=new Promise(resolve=>{ready=resolve;});
  const host={innerHTML:'',addEventListener(){}};
  const state={attribution:null,redirect:null,request:null};
  const context={
    URLSearchParams,
    Date,
    location:{pathname,search:'',replace(value){state.redirect=value;ready();}},
    window:{PACK321_API_BASE:'https://api.example'},
    document:{
      addEventListener(event,handler){if(event==='DOMContentLoaded')Promise.resolve(handler()).then(()=>ready());},
      querySelector(selector){return selector==='[data-support-route]'?host:null;}
    },
    StoreUtils:{
      setAttribution(value){state.attribution=value;},
      escapeHtml(value){return String(value);}
    },
    async fetch(url){state.request=String(url);return{ok,async json(){return apiResult;}};}
  };
  vm.runInNewContext(route,context);
  await completed;
  return{host,state};
}

(async()=>{
  const valid=await executeSupportRoute({
    pathname:'/support/7KQ4-M9XP',
    apiResult:{campaignId:'seroogy-candy-2026',displayName:'Jordan G.',campaigns:[{id:'seroogy-candy-2026'}]}
  });
  assert.equal(valid.state.attribution.scoutCode,'7KQ4M9XP');
  assert.equal(valid.state.attribution.displayName,'Jordan G.');
  assert.equal(valid.state.attribution.attributionSource,'support-route');
  assert.match(valid.state.redirect,/^\/campaign\.html\?/);
  assert.match(valid.state.redirect,/id=seroogy-candy-2026/);
  assert.match(valid.state.redirect,/scout=7KQ4M9XP/);

  const invalid=await executeSupportRoute({pathname:'/support/INVALID1',apiResult:{},ok:false});
  assert.equal(invalid.state.attribution,null);
  assert.equal(invalid.state.redirect,null);
  assert.match(invalid.host.innerHTML,/This fundraiser is unavailable/);
  assert.doesNotMatch(invalid.host.innerHTML,/Jordan/);
  console.log('Canonical privacy-safe Store support route validation passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
