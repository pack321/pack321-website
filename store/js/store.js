(function(){
  'use strict';
  async function hydrateAttribution(){
    const code=new URLSearchParams(location.search).get('scout');if(!code)return;
    try{const scouts=await StoreUtils.loadData('scouts');const scout=scouts.find(item=>item.fundraisingCode===code.toUpperCase()&&item.fundraisingEnabled&&item.visibility==='public'&&item.guardianApproved);if(scout)StoreUtils.setAttribution({type:'scout',scoutCode:scout.fundraisingCode,displayName:scout.publicDisplayName,campaignId:new URLSearchParams(location.search).get('campaign')||new URLSearchParams(location.search).get('id'),sourcePage:location.pathname,attributionSource:'scout-link',timestamp:new Date().toISOString()});}catch(error){console.error('Unable to restore Scout attribution.',error);}
  }
  function renderSupportContext(){
    const context=StoreUtils.readAttribution();if(context?.type!=='scout'||!context.displayName)return;
    const banner=document.createElement('div');banner.className='support-context';banner.innerHTML=`<div class="wrap"><strong>Supporting: ${StoreUtils.escapeHtml(context.displayName)}</strong><span>Attribution follows this order through checkout.</span><button type="button" data-clear-support>Change this order to Pack-wide support</button></div>`;document.querySelector('.site-header')?.insertAdjacentElement('afterend',banner);
    banner.querySelector('[data-clear-support]').addEventListener('click',()=>{const cart=StoreUtils.readCart();const packAttribution={type:'pack',value:'Pack 321 generally',scoutCode:null,campaignId:null,sourcePage:location.pathname,attributionSource:'pack-wide',timestamp:new Date().toISOString()};cart.attribution=packAttribution;cart.items=cart.items.map(item=>({...item,attribution:packAttribution}));StoreUtils.writeCart(cart);StoreUtils.clearAttribution();location.reload();});
  }
  function placeCodeSearch(page){
    if(document.querySelector('[data-code-search]'))return;
    const section='<section class="page-section code-search-section" data-code-search></section>';
    if(page==='index.html'||page==='')document.querySelector('[data-campaigns]')?.closest('section')?.insertAdjacentHTML('afterend',section);
    if(page==='fundraising.html')document.querySelector('#scout-support')?.insertAdjacentHTML('afterend',section);
    if(page==='help.html')document.querySelector('#order-help')?.insertAdjacentHTML('afterend',section);
  }
  function renderShell(){
    if(!document.querySelector('link[href="/css/revision-1.css"]'))document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="/css/revision-1.css"><link rel="stylesheet" href="/css/revision-2.css"><link rel="stylesheet" href="/css/revision-3.css"><link rel="stylesheet" href="/css/revision-3-scout.css"><link rel="stylesheet" href="/css/visual-regression.css"><link rel="stylesheet" href="/css/grj-store-009.css">');
    if(!document.querySelector('script[src="/js/code-search.js"]')){const searchScript=document.createElement('script');searchScript.src='/js/code-search.js';document.head.append(searchScript);}
    const page=location.pathname.split('/').pop()||'index.html';
    placeCodeSearch(page);
    if(page==='fundraising.html'&&!document.querySelector('script[src="/js/fundraising-media.js"]')){const script=document.createElement('script');script.src='/js/fundraising-media.js';script.defer=true;document.head.append(script);}
    const active=files=>files.includes(page)?' aria-current="page"':'';
    if(!document.querySelector('.site-header'))document.querySelector('.preview-banner')?.insertAdjacentHTML('afterend','<header class="site-header"></header>');
    const header=document.querySelector('.site-header');
    if(header)header.outerHTML=`<header class="site-header"><div class="wrap header-inner"><a class="brand" href="/" aria-label="Support Pack 321 home"><img src="/assets/logos/cub-scout-logo.svg" alt="Pack 321 logo" width="64" height="64"><span class="brand-copy"><strong>Pack 321</strong><span>Support our adventures</span></span></a><button class="menu-toggle" type="button" data-menu-toggle aria-controls="store-nav" aria-expanded="false">Menu</button><nav class="nav" id="store-nav" data-store-nav aria-label="Support Pack 321 navigation"><a${active(['index.html',''])} href="/">Support Pack 321</a><details class="nav-group"${active(['campaign.html','scout.html','find-a-scout.html','fundraising.html','donations.html'])?' data-current="true"':''}><summary>Fundraising</summary><div class="nav-menu"><a${active(['campaign.html'])} href="/campaign.html?id=wreaths-2026">Current Fundraisers</a><a${active(['find-a-scout.html'])} href="/find-a-scout.html">Find a Scout</a><a${active(['scout.html'])} href="/scout/AB12CD">Scout Fundraising Pages</a><a${active(['fundraising.html'])} href="/fundraising.html">Fundraising Center</a><a${active(['donations.html'])} href="/donations.html">Donations</a></div></details><a href="/shop.html?category=Pack%20Merchandise">Pack Merchandise</a><details class="nav-group"${active(['order-lookup.html','help.html'])?' data-current="true"':''}><summary>Help &amp; Orders</summary><div class="nav-menu"><a${active(['order-lookup.html'])} href="/order-lookup.html">Order Lookup</a><a${active(['help.html'])} href="/help.html">Help &amp; Contact</a><a href="https://pack321wi.org/">Return to Pack321WI.org</a></div></details><a class="cart-link"${active(['cart.html','checkout.html'])} href="/cart.html" aria-label="Shopping cart">Cart <span class="cart-badge" data-cart-count>0</span></a></nav></div></header>`;
    if(!document.querySelector('.site-footer'))document.body.insertAdjacentHTML('beforeend','<footer class="site-footer"></footer>');
    const footer=document.querySelector('.site-footer');
    if(footer)footer.outerHTML=`<footer class="site-footer"><div class="wrap footer-grid"><div><a class="brand" href="/"><img src="/assets/logos/cub-scout-logo.svg" alt="Pack 321 logo" width="58" height="58"><span class="brand-copy"><strong>Support Pack 321</strong><span>Invest in the next adventure</span></span></a><p>Every purchase helps local Scouts build character, friendships, and lifelong memories.</p></div><div><h3>Support</h3><a href="/campaign.html?id=wreaths-2026">Current campaigns</a><a href="/find-a-scout.html">Find a Scout</a><a href="/fundraising.html">Fundraising center</a><a href="/shop.html?category=Pack%20Merchandise">Pack merchandise</a><a href="/order-lookup.html">Order lookup</a></div><div><h3>Help</h3><a href="/help.html">Help &amp; contact</a><a href="/help.html#refunds">Refund policy</a><a href="/help.html#donations">Donation questions</a><a href="https://pack321wi.org/contact/">Pack contact</a></div><div><h3>Pack 321</h3><a href="https://pack321wi.org/">Pack website</a><a href="https://www.facebook.com/Pack321WI">Facebook</a><a href="https://pack321wi.org/contact/">Contact</a><a href="https://pack321wi.org/#privacy">Privacy</a></div></div><div class="wrap footer-bottom">© <span data-year></span> Cub Scout Pack 321 · Oak Creek, Wisconsin · Storefront preview</div></footer>`;
  }
  function applyFundraiserTypography(root=document){
    root.querySelectorAll('.campaign-hero--fundraiser h1').forEach(heading=>heading.classList.add('fundraiser-hero-title'));
    root.querySelectorAll('main h1:not(.fundraiser-hero-title),.section-heading h2,.story-band h2,.builder-group h3,.symbol-legend-dialog h2').forEach(heading=>heading.classList.add('fundraiser-section-title'));
    root.querySelectorAll('.eyebrow,.campaign-hero__eyebrow').forEach(label=>label.classList.add('fundraiser-eyebrow'));
  }
  window.PackStoreTypography={apply:applyFundraiserTypography};
  document.addEventListener('DOMContentLoaded',()=>{
    hydrateAttribution().then(renderSupportContext);renderShell();applyFundraiserTypography();
    const toggle=document.querySelector('[data-menu-toggle]');const nav=document.querySelector('[data-store-nav]');
    toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});
    StoreUtils.updateCartBadge();document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  });
})();
