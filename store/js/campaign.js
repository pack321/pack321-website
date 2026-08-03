(function(){
  'use strict';
  const stat=(value,label)=>`<div class="stat"><strong>${value}</strong><span>${label}</span></div>`;
  const mediaKey=campaign=>campaign.templateId==='holiday-wreaths'?'holiday-wreaths':campaign.templateId;
  const programYear=campaign=>{
    const start=Number(campaign.year)||new Date().getFullYear();
    return `${start}–${start+1}`;
  };
  const campaignLabel=campaign=>{
    const labels={
      'candy-builder':'Candy Fundraiser',
      'popcorn-builder':'Popcorn Fundraiser',
      'wreath-builder':'Holiday Wreath Fundraiser',
      'sponsorship-builder':'Veterans Wreath Sponsorship'
    };
    if(labels[campaign.renderer])return labels[campaign.renderer];
    return String(campaign.shortName||campaign.name||'Fundraiser')
      .replace(/^\d{4}(?:[–-]\d{4})?\s+/,'')
      .replace(/^(?:Seroogy(?:’|')s|Three Harbors Council)\s+/i,'');
  };
  const heroTitle=campaign=>`${programYear(campaign)} ${campaignLabel(campaign)}`;
  const vendorLine=campaign=>campaign.vendorName?`<p class="campaign-hero__vendor">Presented in partnership with ${StoreUtils.escapeHtml(campaign.vendorName)}</p>`:'';
  const normalizeCampaignKey=value=>String(value||'').trim().toLowerCase();
  const requestedCampaignKey=()=>{
    const params=new URLSearchParams(location.search);
    return params.get('campaign')||params.get('id')||params.get('slug')||'wreaths-2026';
  };
  const findCampaign=(campaigns,key)=>{
    const aliases={'seasonal':'spring-2027','seasonal-preview':'spring-2027','merchandise':'pack-merchandise','merchandise-campaign':'pack-merchandise'};
    const requested=aliases[normalizeCampaignKey(key)]||normalizeCampaignKey(key);
    return campaigns.find(item=>item.published!==false&&item.visibility==='public'&&[item.id,item.slug,...(item.aliases||[])].some(value=>normalizeCampaignKey(value)===requested));
  };
  document.addEventListener('DOMContentLoaded',async()=>{
    const host=document.querySelector('[data-campaign-page]');if(!host)return;
    try{
      const [campaigns,products,locations,manifest]=await Promise.all([StoreUtils.loadData('campaigns'),StoreUtils.loadData('products'),StoreUtils.loadData('pickup-locations'),StoreUtils.loadMedia()]);
      const campaign=findCampaign(campaigns,requestedCampaignKey());
      if(!campaign){host.innerHTML='<section class="page-section"><div class="wrap empty-state"><h1>Campaign Not Found</h1><p>This campaign may have ended, moved, or the link may be incorrect.</p><a class="button" href="fundraising.html">Visit the Fundraising Center</a></div></section>';return;}
      const media=manifest.campaigns?.[mediaKey(campaign)]||{hero:{src:campaign.image,alt:`Pack 321 adventure supported by ${campaign.name}`},gallery:[]};const progress=campaign.progress||{};const percent=progress.goal?Math.min(100,Math.round(progress.raised/progress.goal*100)):0;const place=locations.find(item=>campaign.pickupLocationIds?.includes(item.id));const productIds=new Set(campaign.productIds||[]);const campaignProducts=products.filter(item=>productIds.has(item.id)||item.campaignId===campaign.id);const standardizedHeroTitle=heroTitle(campaign);document.title=`${standardizedHeroTitle} | Support Pack 321`;
      const gallery=(media.gallery||[]).filter(item=>item.publicApproved!==false).map((item,index)=>`<figure><img src="${StoreUtils.escapeHtml(item.src)}" alt="${StoreUtils.escapeHtml(item.alt)}" width="900" height="675" loading="lazy" decoding="async"><figcaption>${index===0?'The Pack moments this campaign helps make possible.':'Real families, traditions, and adventures supported by our community.'}</figcaption></figure>`).join('');
      host.innerHTML=`<section class="campaign-hero campaign-hero--fundraiser"><div class="wrap campaign-hero-grid"><div class="campaign-hero__copy"><p class="eyebrow">Current Fundraiser</p><h1>${StoreUtils.escapeHtml(standardizedHeroTitle)}</h1>${vendorLine(campaign)}<p>${StoreUtils.escapeHtml(campaign.story||campaign.description)}</p><p><strong>${StoreUtils.formatDate(campaign.startDate)} – ${StoreUtils.formatDate(campaign.endDate)}</strong></p><div class="campaign-actions"><a class="button gold" href="#products">Shop Campaign</a><a class="button light" href="#story">Why It Matters</a></div></div><img src="${StoreUtils.escapeHtml(media.hero.src)}" alt="${StoreUtils.escapeHtml(media.hero.alt)}" width="1200" height="800" fetchpriority="high"></div></section>
      <section class="page-section soft-section"><div class="wrap"><div class="section-heading"><p class="eyebrow">Campaign progress</p><h2>Every order moves us forward</h2></div><div class="stat-grid">${stat(StoreUtils.formatCurrency((progress.raised||0)*100),'Raised')}${stat(`${percent}%`,'of our goal')}${stat(StoreUtils.formatCurrency((progress.goal||0)*100),'Goal')}${stat(progress.scoutsParticipating||0,'Scouts participating')}${stat(progress.daysRemaining??'—','Days remaining')}</div><div class="progress" aria-label="${percent}% of fundraising goal reached"><span style="width:${percent}%"></span></div><p style="text-align:center">${progress.orders||0} community orders and counting</p></div></section>
      <section class="page-section" id="story"><div class="wrap story-band"><p class="eyebrow" style="color:#ffc72c">Who you’re helping</p><h2>Fundraising turns into real Pack moments</h2><p>${StoreUtils.escapeHtml(campaign.description)} Your support helps fund camping, Pack traditions, awards, leader training, program supplies, and community events.</p></div></section>
      <section class="page-section"><div class="wrap"><div class="section-heading"><p class="eyebrow">Pack 321 stories</p><h2>What support makes possible</h2></div><div class="campaign-gallery">${gallery}</div></div></section>
      <section class="page-section soft-section" id="products"><div class="wrap"><div class="section-heading"><p class="eyebrow">Campaign products</p><h2>Choose your way to support</h2></div>${window.PackCampaignBuilders.render(campaign,campaignProducts)}</div></section>
      <section class="page-section"><div class="wrap"><div class="contact-grid"><article class="contact-card"><h3>Volunteer moments</h3><p>Pack volunteers organize products, family communication, and pickup so campaign proceeds can stay focused on Scouts.</p></article><article class="contact-card" id="pickup"><h3>Pickup</h3><p><strong>${StoreUtils.escapeHtml(place?.name||'Location to be confirmed')}</strong><br>${StoreUtils.escapeHtml(campaign.pickupInstructions||place?.instructions||'Instructions will be emailed.')}</p></article><article class="contact-card"><h3>Questions?</h3><p>Our volunteer leaders can help with products, Scout support, or pickup.</p><a href="help.html#contact">Contact campaign support</a></article></div></div></section>
      <section class="page-section soft-section"><div class="wrap"><div class="section-heading"><h2>Campaign FAQ</h2></div><div class="faq-list">${(campaign.faq||[]).map(item=>`<details><summary>${StoreUtils.escapeHtml(item.question)}</summary><p>${StoreUtils.escapeHtml(item.answer)}</p></details>`).join('')||'<details><summary>How do I support this campaign?</summary><p>Choose a product or share the campaign with friends and family.</p></details>'}</div></div></section>`;
      window.PackCampaignBuilders.bind(host,campaign,campaignProducts);const searchSection=document.createElement('section');searchSection.className='page-section code-search-section';searchSection.dataset.codeSearch='';searchSection.dataset.campaign=campaign.id;host.querySelector('.campaign-hero')?.insertAdjacentElement('afterend',searchSection);window.Pack321CodeSearch?.init();
    }catch(error){console.error('Campaign data unavailable',error);host.innerHTML='<section class="page-section"><div class="wrap empty-state"><h1>Campaign Data Unavailable</h1><p>The campaign service or one of its required data files could not be loaded. Please refresh or visit the Fundraising Center.</p></div></section>';}
  });
})();
