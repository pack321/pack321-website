(function(){
  'use strict';
  function renderShell(){
    if(!document.querySelector('link[href="css/revision-1.css"]'))document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="css/revision-1.css">');
    const page=location.pathname.split('/').pop()||'index.html';
    const active=(files)=>files.includes(page)?' aria-current="page"':'';
    if(!document.querySelector('.site-header'))document.querySelector('.preview-banner')?.insertAdjacentHTML('afterend','<header class="site-header"></header>');
    const header=document.querySelector('.site-header');
    if(header)header.outerHTML=`<header class="site-header"><div class="wrap header-inner"><a class="brand" href="index.html" aria-label="Support Pack 321 home"><img src="../assets/logos/cub-scout-logo.svg" alt="Pack 321 logo" width="58" height="58"><span class="brand-copy"><strong>Pack 321</strong><span>Support our adventures</span></span></a><button class="menu-toggle" type="button" data-menu-toggle aria-controls="store-nav" aria-expanded="false">Menu</button><nav class="nav" id="store-nav" data-store-nav aria-label="Support Pack 321 navigation"><a${active(['index.html',''])} href="index.html">Support Pack 321</a><a${active(['campaign.html'])} href="campaign.html?id=wreaths-2026">Current Fundraisers</a><a${active(['shop.html'])} href="shop.html?category=Pack%20Merchandise">Pack Merchandise</a><a${active(['fundraising.html'])} href="fundraising.html">Fundraising Center</a><a${active(['order-lookup.html'])} href="order-lookup.html">Order Lookup</a><a${active(['help.html'])} href="help.html">Help &amp; Contact</a><a href="../index.html">Return to Pack321WI.org</a><a class="cart-link"${active(['cart.html','checkout.html'])} href="cart.html" aria-label="Shopping cart">Cart <span class="cart-badge" data-cart-count>0</span></a></nav></div></header>`;
    if(!document.querySelector('.site-footer'))document.body.insertAdjacentHTML('beforeend','<footer class="site-footer"></footer>');
    const footer=document.querySelector('.site-footer');
    if(footer)footer.outerHTML=`<footer class="site-footer"><div class="wrap footer-grid"><div><a class="brand" href="index.html"><img src="../assets/logos/cub-scout-logo.svg" alt="Pack 321 logo" width="58" height="58"><span class="brand-copy"><strong>Support Pack 321</strong><span>Invest in the next adventure</span></span></a><p>Every purchase helps local Scouts build character, friendships, and lifelong memories.</p></div><div><h3>Support</h3><a href="campaign.html?id=wreaths-2026">Current campaigns</a><a href="fundraising.html">Fundraising center</a><a href="shop.html?category=Pack%20Merchandise">Pack merchandise</a><a href="order-lookup.html">Order lookup</a></div><div><h3>Help</h3><a href="help.html">Help &amp; contact</a><a href="help.html#refunds">Refund policy</a><a href="help.html#donations">Donation questions</a><a href="../contact/index.html">Pack contact</a></div><div><h3>Pack 321</h3><a href="../index.html">Pack website</a><a href="https://www.facebook.com/Pack321WI">Facebook</a><a href="../contact/index.html">Contact</a><a href="../index.html#privacy">Privacy</a></div></div><div class="wrap footer-bottom">© <span data-year></span> Cub Scout Pack 321 · Oak Creek, Wisconsin · Storefront preview</div></footer>`;
  }
  document.addEventListener('DOMContentLoaded',()=>{
    renderShell();
    const toggle=document.querySelector('[data-menu-toggle]');
    const nav=document.querySelector('[data-store-nav]');
    toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});
    StoreUtils.updateCartBadge();
    document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  });
})();
