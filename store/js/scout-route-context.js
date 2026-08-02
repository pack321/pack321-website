(function(){
  'use strict';
  let correcting=false;
  window.addEventListener('pack321:attribution',event=>{
    if(correcting||event.detail?.type!=='scout')return;
    const params=new URLSearchParams(location.search);const campaignId=params.get('campaign');const attributionSource=params.get('source')==='code-search'?'code-search':event.detail.attributionSource||'scout-link';
    if((!campaignId||event.detail.campaignId===campaignId)&&event.detail.attributionSource===attributionSource)return;
    correcting=true;StoreUtils.setAttribution({...event.detail,campaignId:campaignId||event.detail.campaignId,attributionSource});correcting=false;
  });
})();
