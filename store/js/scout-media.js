(function(){
  'use strict';
  const campaignKey=campaign=>campaign?.templateId==='holiday-wreaths'?'holiday-wreaths':campaign?.templateId;
  const requestedCode=()=>String(new URLSearchParams(location.search).get('code')||location.pathname.split('/').filter(Boolean).pop()||'').trim().toUpperCase();
  const publicActive=scout=>Boolean(scout&&scout.fundraisingEnabled&&scout.visibility==='public'&&scout.guardianApproved&&scout.status!=='expired');
  document.addEventListener('DOMContentLoaded',async()=>{
    const host=document.querySelector('[data-scout-profile]');if(!host)return;
    try{
      const [scouts,campaigns,products,manifest]=await Promise.all([StoreUtils.loadData('scouts'),StoreUtils.loadData('campaigns'),StoreUtils.loadData('products'),StoreUtils.loadMedia()]);
      const scout=scouts.find(item=>item.fundraisingCode===requestedCode());if(!publicActive(scout))return;
      const enrolled=campaigns.filter(c=>scout.campaignIds.includes(c.id)&&['active','scheduled'].includes(c.status)&&c.visibility==='public');
      const requestedCampaign=new URLSearchParams(location.search).get('campaign');
      const current=enrolled.find(c=>c.id===requestedCampaign)||enrolled.find(c=>c.status==='active')||enrolled[0];
      const apply=()=>{
        const placeholder=host.querySelector('.scout-photo-placeholder');if(!placeholder)return false;
        const privacyCopy=host.querySelectorAll('.privacy-card p');
        if(privacyCopy[0])privacyCopy[0].textContent='This public page uses only guardian-approved public profile information. Private profile and family data remain protected.';
        if(privacyCopy[1])privacyCopy[1].textContent='Visibility, photos, messages, goals, enrollment, and sharing tools remain subject to guardian controls.';
        const campaignMedia=manifest.campaigns[campaignKey(current)]?.hero;
        const mayShowScoutPhoto=Boolean(scout.photoEnabled&&scout.photoConsentPublic&&scout.approvedPhoto);
        const selected=mayShowScoutPhoto?{src:scout.approvedPhoto,alt:`Guardian-approved photo of ${scout.publicDisplayName}`}:(campaignMedia?.publicApproved?campaignMedia:manifest.scoutFallback);
        placeholder.className='scout-media-fallback';placeholder.setAttribute('aria-label',selected.alt);placeholder.innerHTML=`<img src="${StoreUtils.escapeHtml(selected.src)}" alt="${StoreUtils.escapeHtml(selected.alt)}" width="1200" height="800" fetchpriority="high"><span>${mayShowScoutPhoto?'Guardian-approved Scout photo':'Pack campaign photo shown because no public Scout photo is approved.'}</span>`;
        const currentProducts=products.filter(item=>item.campaignId===current?.id);host.querySelectorAll('.product-card img').forEach((image,index)=>{const product=currentProducts[index];const media=manifest.products[product?.id];if(media){image.src=media.primary;image.alt=`${product.name} product view`;image.width=600;image.height=450;image.loading='lazy';}});
        return true;
      };
      if(apply())return;const observer=new MutationObserver(()=>{if(apply())observer.disconnect();});observer.observe(host,{childList:true,subtree:true});
    }catch(error){console.error('Scout media unavailable',error);}
  });
})();
