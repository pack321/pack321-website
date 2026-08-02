(function(){
  'use strict';
  function start(){
    const host=document.querySelector('[data-product-detail]');
    if(!host)return;
    const apply=()=>{const context=StoreUtils.readAttribution();const fieldset=host.querySelector('fieldset');if(!fieldset||context?.type!=='scout'||fieldset.dataset.contextApplied)return false;fieldset.dataset.contextApplied='true';fieldset.hidden=true;fieldset.insertAdjacentHTML('beforebegin',`<div class="notice"><strong>Supporting: ${StoreUtils.escapeHtml(context.displayName||'Pack 321 Scout')}</strong><br>This item is automatically attributed through fundraising code ${StoreUtils.escapeHtml(context.scoutCode)}. No additional Scout selection is needed.</div>`);return true;};
    if(apply())return;
    const observer=new MutationObserver(()=>{if(apply())observer.disconnect();});
    observer.observe(host,{childList:true,subtree:true});
    window.addEventListener('pack321:attribution',()=>{if(apply())observer.disconnect();},{once:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
