(function(){
  'use strict';
  const key=()=>new URLSearchParams(location.search).get('campaign')||new URLSearchParams(location.search).get('id')||new URLSearchParams(location.search).get('slug')||'wreaths-2026';
  document.addEventListener('DOMContentLoaded',async()=>{
    try{
      const campaigns=await StoreUtils.loadData('campaigns');const wanted=String(key()).toLowerCase();const campaign=campaigns.find(item=>[item.id,item.slug,...(item.aliases||[])].some(value=>String(value).toLowerCase()===wanted));
      if(!campaign||!['closed','archived'].includes(StoreUtils.campaignStatus(campaign)))return;
      const host=document.querySelector('[data-campaign-page]');const apply=()=>{const hero=host.querySelector('.campaign-hero');if(!hero)return false;hero.querySelector('.campaign-actions')?.remove();host.querySelector('#products')?.remove();const state=campaign.status==='archived'?'This campaign is archived and no longer accepts orders.':'This campaign is closed and no longer accepts orders.';hero.insertAdjacentHTML('afterend',`<section class="page-section"><div class="wrap notice"><strong>${state}</strong> Visit Current Fundraisers to support an open campaign.</div></section>`);return true;};
      if(apply())return;const observer=new MutationObserver(()=>{if(apply())observer.disconnect();});observer.observe(host,{childList:true,subtree:true});
    }catch{}
  });
})();
