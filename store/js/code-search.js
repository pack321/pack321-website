(function(){
  'use strict';
  const CODE_PATTERN=/^[A-Z0-9]{6}$/;
  const analyticsEvent=(event,campaignId=null)=>window.dispatchEvent(new CustomEvent('pack321:analytics',{detail:{event,component:'fundraising_code_search',campaignId}}));
  const campaignContext=host=>{const params=new URLSearchParams(location.search);return host.dataset.campaign||params.get('campaign')||params.get('id')||null;};
  const publicActive=scout=>Boolean(scout&&scout.fundraisingEnabled&&scout.visibility==='public'&&scout.guardianApproved&&scout.status!=='expired');
  const rateLimitCheck=async context=>{const hook=window.Pack321CodeSearchRateLimit?.beforeLookup;if(typeof hook!=='function')return{allowed:true};return await hook(context);};
  function render(host,index){
    const inputId=`fundraising-code-${index}`;const helperId=`${inputId}-helper`;const resultId=`${inputId}-result`;const summaryId=`${inputId}-summary`;
    host.innerHTML=`<div class="wrap"><div class="code-search-card"><div class="code-search-copy"><p class="eyebrow">Private code lookup</p><h2>Support a Scout</h2><p>Use a fundraising code to open a guardian-approved public Scout page. No directory or name search is provided.</p></div><form class="code-search-form" data-code-search-form novalidate><div class="code-search-error" id="${summaryId}" data-code-search-error role="alert" tabindex="-1" hidden></div><div class="form-field"><label for="${inputId}">Fundraising code</label><div class="code-search-controls"><input id="${inputId}" name="fundraisingCode" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" placeholder="Enter code" aria-describedby="${helperId} ${resultId}"><button class="button gold" type="submit">Find Scout</button></div><p class="field-helper" id="${helperId}">Enter the code shared by the Scout or family.</p><p class="code-search-result" id="${resultId}" data-code-search-result aria-live="polite"></p></div></form></div></div>`;
    const form=host.querySelector('[data-code-search-form]');const input=form.elements.fundraisingCode;const error=host.querySelector('[data-code-search-error]');const result=host.querySelector('[data-code-search-result]');const campaignId=campaignContext(host);
    const fail=(message,event)=>{error.textContent=message;error.hidden=false;result.textContent='';input.setAttribute('aria-invalid','true');analyticsEvent(event,campaignId);error.focus();};
    input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();form.requestSubmit();}});
    form.addEventListener('submit',async event=>{
      event.preventDefault();const code=String(input.value||'').trim().toUpperCase();input.value=code;error.hidden=true;error.textContent='';input.removeAttribute('aria-invalid');result.textContent='';analyticsEvent('code_search_started',campaignId);
      if(!code){fail('Enter a fundraising code to continue.','code_search_invalid');return;}
      if(!CODE_PATTERN.test(code)){fail('Enter a valid six-character fundraising code.','code_search_invalid');return;}
      result.textContent='Checking fundraising code…';
      try{const limit=await rateLimitCheck({campaignId,sourcePage:location.pathname});if(limit?.allowed===false){fail('We could not complete the lookup. Please try again later.','code_search_unavailable');return;}const scouts=await StoreUtils.loadData('scouts');const scout=scouts.find(item=>item.fundraisingCode===code);if(!publicActive(scout)){fail('We could not find an active public fundraising page for that code. Check the code or support Pack 321 generally.','code_search_not_found');return;}analyticsEvent('code_search_success',campaignId);result.textContent='Scout fundraising page found. Redirecting…';const query=campaignId?`?campaign=${encodeURIComponent(campaignId)}`:'';location.assign(`/scout/${encodeURIComponent(code)}${query}`);}catch{fail('Fundraising code lookup is temporarily unavailable. Please try again later.','code_search_unavailable');}
    });
  }
  const init=()=>document.querySelectorAll('[data-code-search]').forEach((host,index)=>{if(!host.dataset.codeSearchReady){host.dataset.codeSearchReady='true';render(host,index);}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.Pack321CodeSearch={normalize:value=>String(value||'').trim().toUpperCase(),isValid:value=>CODE_PATTERN.test(String(value||'').trim().toUpperCase()),isPublicActive:publicActive,init};
})();
