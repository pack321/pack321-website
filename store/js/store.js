(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded',()=>{
    const toggle=document.querySelector('[data-menu-toggle]');
    const nav=document.querySelector('[data-store-nav]');
    toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});
    StoreUtils.updateCartBadge();
    document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  });
})();
