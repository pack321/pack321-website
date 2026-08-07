(function(){
  'use strict';
  if(!document.querySelector('link[href="/css/store-v3-donations.css"]'))document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="/css/store-v3-donations.css">');
  const init=()=>{
    const buttons=[...document.querySelectorAll('.donation-amounts button')];
    if(buttons.length!==4||buttons[0].dataset.donationReady)return;
    const values=['25','50','100','custom'];
    buttons.forEach((button,index)=>{button.dataset.donationReady='true';button.dataset.donationAmount=values[index];button.setAttribute('aria-pressed','false');});
    const note=document.querySelector('#donation-note')?.closest('.form-field');
    note?.insertAdjacentHTML('beforebegin','<div class="form-field donation-custom" data-donation-custom hidden><label for="donation-custom-amount">Custom donation amount</label><input id="donation-custom-amount" name="donationAmount" type="number" min="1" step="1" inputmode="decimal" placeholder="Enter amount in dollars" aria-describedby="donation-status"></div>');
    const continueLink=document.querySelector('.donation-amounts')?.parentElement?.querySelector('a.button.gold');
    continueLink?.setAttribute('data-donation-continue','');
    continueLink?.closest('p')?.insertAdjacentHTML('afterend','<p class="inline-message" id="donation-status" data-donation-status aria-live="polite"></p>');
    const custom=document.querySelector('[data-donation-custom]');
    const customInput=custom?.querySelector('input');
    const status=document.querySelector('[data-donation-status]');
    let selection='';
    buttons.forEach(button=>button.addEventListener('click',()=>{
      selection=button.dataset.donationAmount;
      buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      const customSelected=selection==='custom';
      custom.hidden=!customSelected;
      custom.style.display=customSelected?'grid':'none';
      status.textContent='';
      status.className='inline-message';
      if(customSelected)customInput.focus();
    }));
    continueLink?.addEventListener('click',event=>{
      const invalidCustom=selection==='custom'&&(!customInput.value||Number(customInput.value)<1);
      if(!selection||invalidCustom){
        event.preventDefault();
        status.textContent=!selection?'Choose a donation amount to continue.':'Enter a custom donation amount of at least $1.';
        status.className='inline-message error';
        (invalidCustom?customInput:buttons[0])?.focus();
      }
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
