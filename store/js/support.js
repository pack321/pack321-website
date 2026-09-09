(function(){
  'use strict';
  const normalize=value=>{const code=String(value||'').trim().toUpperCase().replace(/[\s-]/g,'');return /^[0-9A-HJKMNP-TV-Z]{8}$/.test(code)?code:null;};
  const unavailable=host=>{host.innerHTML='<div class="wrap"><section class="panel empty-state"><p class="eyebrow">Fundraising link unavailable</p><h1>This fundraiser is unavailable.</h1><p>Check the link or support Pack 321 generally. No private Scout information is shown.</p><a class="button gold" href="/fundraising.html">Support Pack 321</a></section></div>';};
  const openCampaign=(code,result,campaignId)=>{StoreUtils.setAttribution({type:'scout',scoutCode:code,displayName:result.displayName||'a Pack 321 Scout',campaignId,sourcePage:location.pathname,attributionSource:'support-route',timestamp:new Date().toISOString()});location.replace(`/campaign.html?${new URLSearchParams({id:campaignId,scout:code,source:'support-route'})}`);};
  document.addEventListener('DOMContentLoaded',async()=>{
    const host=document.querySelector('[data-support-route]');const segments=location.pathname.split('/').filter(Boolean);const code=normalize(segments.at(-1));const requested=new URLSearchParams(location.search).get('campaign')||'';const api=String(window.PACK321_API_BASE||'').replace(/\/$/,'');
    if(!host||!code||!api){if(host)unavailable(host);return;}
    try{const query=requested?`?campaign=${encodeURIComponent(requested)}`:'';const response=await fetch(`${api}/api/fundraising-code/${encodeURIComponent(code)}${query}`);if(!response.ok)throw new Error();const result=await response.json();
      if(result.campaignId){openCampaign(code,result,result.campaignId);return;}
      if(result.campaigns?.length>1){host.innerHTML=`<div class="wrap"><div class="section-heading"><p class="eyebrow">Choose a fundraiser</p><h1>Support this Pack 321 Scout</h1><p>Select an active fundraiser. Privacy-safe Scout attribution continues automatically.</p></div><div class="campaign-grid">${result.campaigns.map(item=>`<article class="campaign-card"><div class="campaign-content"><h2>${StoreUtils.escapeHtml(item.title)}</h2><button class="button gold" data-campaign="${StoreUtils.escapeHtml(item.id)}" type="button">Open fundraiser</button></div></article>`).join('')}</div></div>`;host.addEventListener('click',event=>{const button=event.target.closest('[data-campaign]');if(button)openCampaign(code,result,button.dataset.campaign);});return;}
      unavailable(host);
    }catch{unavailable(host);}
  });
})();
