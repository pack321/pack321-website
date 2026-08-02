(function(){
  'use strict';
  async function start(){try{const manifest=await StoreUtils.loadMedia();const hero=document.querySelector('.campaign-hero img');if(hero){hero.src=manifest.events.hiking.src;hero.alt=manifest.events.hiking.alt;hero.width=1200;hero.height=800;hero.fetchPriority='high';}const keys=['camping','pinewoodDerby','recognition','service'];document.querySelectorAll('.reason-card').forEach((card,index)=>{const media=manifest.events[keys[index]];if(!media?.publicApproved)return;card.insertAdjacentHTML('afterbegin',`<img src="${StoreUtils.escapeHtml(media.src)}" alt="${StoreUtils.escapeHtml(media.alt)}" width="640" height="400" loading="lazy" decoding="async">`);});}catch(error){console.error(error);}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
