(function(){
  'use strict';
  let correcting=false;
  window.addEventListener('pack321:attribution',event=>{
    if(correcting||event.detail?.type!=='scout')return;
    const campaignId=new URLSearchParams(location.search).get('campaign');
    if(!campaignId||event.detail.campaignId===campaignId)return;
    correcting=true;StoreUtils.setAttribution({...event.detail,campaignId});correcting=false;
  });
})();
