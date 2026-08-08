(function(){
  'use strict';
  if(!document.querySelector('link[href$="store-v3-phase2.css"]'))document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="/css/store-v3-phase2.css">');
  const stat=(value,label)=>`<div class="stat"><strong>${value}</strong><span>${label}</span></div>`;
  const mediaKey=campaign=>campaign.templateId==='holiday-wreaths'?'holiday-wreaths':campaign.templateId;
  const programYear=campaign=>PackCampaignDisplay.formatProgramYear(campaign);
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
    return params.get('campaign')||params.get('id')||params.get('slug')||'';
  };
  const findCampaign=(campaigns,key)=>{
    const aliases={'seasonal':'spring-2027','seasonal-preview':'spring-2027','merchandise':'pack-merchandise','merchandise-campaign':'pack-merchandise'};
    const requested=aliases[normalizeCampaignKey(key)]||normalizeCampaignKey(key);
    return campaigns.find(item=>item.published!==false&&item.visibility==='public'&&[item.id,item.slug,...(item.aliases||[])].some(value=>normalizeCampaignKey(value)===requested));
  };
  document.addEventListener('DOMContentLoaded',async()=>{
    const host=document.querySelector('[data-campaign-page]');if(!host)return;
    try{
      const [campaigns,products,locations,manifest,symbols]=await Promise.all([StoreUtils.loadData('campaigns'),StoreUtils.loadData('products'),StoreUtils.loadData('pickup-locations'),StoreUtils.loadMedia(),StoreUtils.loadData('product-symbols')]);
      const requested=requestedCampaignKey();
      if(!requested){host.innerHTML='<section class="page-section"><div class="wrap empty-state campaign-state campaign-state--missing"><h1>Choose a fundraiser to continue.</h1><p>Select a current or upcoming campaign from the Fundraising Center.</p><a class="button" href="fundraising.html#current">Back to All Fundraisers</a></div></section>';return;}
      const campaign=findCampaign(campaigns,requested);
      if(!campaign){host.innerHTML='<section class="page-section"><div class="wrap empty-state campaign-state campaign-state--unknown"><h1>We couldn’t find that fundraiser.</h1><p>Check the campaign link or choose another fundraiser.</p><a class="button" href="fundraising.html#current">Back to All Fundraisers</a></div></section>';return;}
      document.body.classList.add('phase2-commerce-page','phase2-campaign-page');document.body.dataset.campaignRenderer=campaign.renderer;
      const attribution=StoreUtils.readAttribution();if(attribution?.type==='scout')StoreUtils.setAttribution({...attribution,campaignId:campaign.id});
      const media={hero:{src:campaign.cardImage||campaign.image,alt:campaign.cardImageAlt||campaign.name},gallery:manifest.campaigns?.[mediaKey(campaign)]?.gallery||[]};const progress=StoreUtils.getFundraisingProgress(campaign.progress,campaign);const progressStats=progress.hasValidGoal?`${stat(StoreUtils.formatCurrency(progress.raised*100),'Raised')}${stat(`${progress.percent}%`,'of our goal')}${stat(StoreUtils.formatCurrency(progress.goal*100),'Goal')}`:`${stat(StoreUtils.formatCurrency(progress.raised*100),'Raised')}${stat('Goal Pending','Goal')}`;const progressBar=progress.hasValidGoal?`<div class="progress" aria-label="${progress.percent}% of fundraising goal reached"><span style="width:${progress.percent}%"></span></div>`:'<p class="inline-message" style="text-align:center">Goal will appear when finalized.</p>';const place=locations.find(item=>campaign.pickupLocationIds?.includes(item.id));const campaignProducts=PackCampaignDisplay.getCampaignProducts(campaign,products);const standardizedHeroTitle=heroTitle(campaign);document.title=`${standardizedHeroTitle} | Support Pack 321`;
      const gallery=(media.gallery||[]).filter(item=>item.publicApproved!==false).map((item,index)=>`<figure><img src="${StoreUtils.escapeHtml(item.src)}" alt="${StoreUtils.escapeHtml(item.alt)}" width="900" height="675" loading="lazy" decoding="async"><figcaption>${index===0?'The Pack moments this campaign helps make possible.':'Real families, traditions, and adventures supported by our community.'}</figcaption></figure>`).join('');
      host.innerHTML=`<section class="campaign-hero campaign-hero--fundraiser"><div class="campaign-hero__content"><p class="campaign-hero__eyebrow">Current Fundraiser</p><p class="campaign-hero__year">${StoreUtils.escapeHtml(programYear(campaign))}</p><h1 class="campaign-hero__title fundraiser-hero-title">${StoreUtils.escapeHtml(campaignLabel(campaign))}</h1>${vendorLine(campaign)}<p class="campaign-hero__description">${StoreUtils.escapeHtml(campaign.story||campaign.description)}</p><div class="campaign-hero__actions"><a class="button gold" href="#products">Shop Products</a><a class="button light" href="#story">Why It Matters</a></div></div><div class="campaign-hero__media"><img src="${StoreUtils.escapeHtml(media.hero.src)}" alt="${StoreUtils.escapeHtml(media.hero.alt)}" width="1400" height="800" fetchpriority="high"></div></section>
      <section class="page-section soft-section"><div class="wrap"><div class="section-heading"><p class="eyebrow">Campaign progress</p><h2>Every order moves us forward</h2></div><div class="stat-grid">${progressStats}${stat(campaign.progress?.scoutsParticipating||0,'Scouts participating')}${stat(campaign.progress?.daysRemaining??'—','Days remaining')}</div>${progressBar}<p style="text-align:center">${campaign.progress?.orders||0} community orders and counting</p></div></section>
      <section class="page-section" id="story"><div class="wrap story-band"><p class="eyebrow" style="color:#ffc72c">Who you’re helping</p><h2>Fundraising turns into real Pack moments</h2><p>${StoreUtils.escapeHtml(campaign.description)} Your support helps fund camping, Pack traditions, awards, leader training, program supplies, and community events.</p></div></section>
      <section class="page-section"><div class="wrap"><div class="section-heading"><p class="eyebrow">Pack 321 stories</p><h2>What support makes possible</h2></div><div class="campaign-gallery">${gallery}</div></div></section>
      <section class="page-section soft-section" id="products"><div class="wrap"><div class="section-heading"><p class="eyebrow">Campaign products</p><h2 class="fundraiser-section-title">Choose your way to support</h2></div>${window.PackCampaignBuilders.render(campaign,campaignProducts,symbols)}</div></section>
      <section class="page-section"><div class="wrap"><div class="contact-grid"><article class="contact-card"><h3>Volunteer moments</h3><p>Pack volunteers organize products, family communication, and pickup so campaign proceeds can stay focused on Scouts.</p></article><article class="contact-card" id="pickup"><h3>Pickup</h3><p><strong>${StoreUtils.escapeHtml(place?.name||'Location to be confirmed')}</strong><br>${StoreUtils.escapeHtml(campaign.pickupInstructions||place?.instructions||'Instructions will be emailed.')}</p></article><article class="contact-card"><h3>Questions?</h3><p>Our volunteer leaders can help with products, Scout support, or pickup.</p><a href="help.html#contact">Contact campaign support</a></article></div></div></section>
      <section class="page-section soft-section"><div class="wrap"><div class="section-heading"><h2 class="fundraiser-section-title">Campaign FAQ</h2></div><div class="faq-list">${(campaign.faq||[]).map(item=>`<details><summary>${StoreUtils.escapeHtml(item.question)}</summary><p>${StoreUtils.escapeHtml(item.answer)}</p></details>`).join('')||'<details><summary>How do I support this campaign?</summary><p>Choose a product or share the campaign with friends and family.</p></details>'}</div></div></section>`;
      const about=host.querySelector('#story');if(about)about.id='about';host.querySelector('a[href="#story"]')?.setAttribute('href','#about');const context=document.createElement('div');context.className='wrap campaign-context';context.innerHTML=`<a href="fundraising.html#current">← Back to All Fundraisers</a><span>${StoreUtils.escapeHtml(programYear(campaign))} · ${StoreUtils.escapeHtml(campaign.status)}</span>`;host.prepend(context);window.PackCampaignBuilders.bind(host,campaign,campaignProducts);const searchSection=document.createElement('section');searchSection.className='page-section code-search-section';searchSection.dataset.codeSearch='';searchSection.dataset.campaign=campaign.id;host.querySelector('.campaign-hero')?.insertAdjacentElement('afterend',searchSection);window.Pack321CodeSearch?.init();
    }catch(error){console.error('Campaign data unavailable',error);host.innerHTML='<section class="page-section"><div class="wrap empty-state campaign-state campaign-state--failure"><h1>Campaign information is temporarily unavailable.</h1><p>Please refresh or return to the Fundraising Center.</p><a class="button" href="fundraising.html#current">Back to All Fundraisers</a></div></section>';}
  });
})();
