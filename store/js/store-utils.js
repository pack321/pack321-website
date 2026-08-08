(function(){
  'use strict';
  const CART_KEY='pack321_store_cart_v1';
  const ATTRIBUTION_KEY='pack321_fundraising_attribution_v1';
  const cache={};
  const escapeHtml=(value='')=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const formatCurrency=(cents,currency='usd')=>new Intl.NumberFormat('en-US',{style:'currency',currency:currency.toUpperCase()}).format((Number(cents)||0)/100);
  function getFundraisingProgress(progress={},owner={}){
    const goal=Number(progress?.goal);
    const raised=Number(progress?.raised);
    const approval=progress?.goalApprovalStatus??owner?.goalApprovalStatus;
    const explicitlyUnapproved=approval!==undefined&&approval!==null&&approval!==true&&String(approval).toLowerCase()!=='approved';
    const publiclyVisible=owner?.visibility===undefined||owner.visibility==='public';
    const hasValidGoal=Number.isFinite(goal)&&goal>0&&!explicitlyUnapproved&&publiclyVisible;
    return{hasValidGoal,goal:hasValidGoal?goal:null,raised:Number.isFinite(raised)?raised:0,percent:hasValidGoal?Math.min(100,Math.max(0,Math.round((Number.isFinite(raised)?raised:0)/goal*100))):null};
  }
  const formatDate=value=>value?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(`${value}T12:00:00`)):'';
  async function fetchJson(url,label){const response=await fetch(url,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error(`${label} unavailable (${response.status})`);try{return await response.json();}catch{throw new Error(`${label} contains invalid JSON`);}}
  async function loadData(name){if(!cache[name])cache[name]=fetchJson(`/data/${name}.json`,name);return cache[name];}
  async function loadMedia(){if(!cache.media)cache.media=fetchJson('/assets/media/manifest.json','media manifest');return cache.media;}
  function emptyCart(){return{version:1,attribution:{type:'pack',value:'',scoutCode:null,campaignId:null,sourcePage:null,timestamp:null},items:[]};}
  function readCart(){try{const cart=JSON.parse(localStorage.getItem(CART_KEY));return cart&&cart.version===1&&Array.isArray(cart.items)?cart:emptyCart();}catch{return emptyCart();}}
  function writeCart(cart){localStorage.setItem(CART_KEY,JSON.stringify(cart));updateCartBadge(cart);window.dispatchEvent(new CustomEvent('pack321:cart',{detail:cart}));}
  function cartCount(cart=readCart()){return cart.items.reduce((sum,item)=>sum+item.quantity,0);}
  function updateCartBadge(cart=readCart()){document.querySelectorAll('[data-cart-count]').forEach(el=>{el.textContent=cartCount(cart);el.setAttribute('aria-label',`${cartCount(cart)} items in cart`);});}
  function lineKey(item){return [item.productId,JSON.stringify(item.options||{}),item.attribution?.type||'',item.attribution?.scoutCode||item.attribution?.value||''].join('|');}
  function readAttribution(){try{const value=JSON.parse(localStorage.getItem(ATTRIBUTION_KEY));return value&&value.version===1?value:null;}catch{return null;}}
  function setAttribution(value){const safe={version:1,type:value?.type==='scout'?'scout':'pack',scoutCode:value?.scoutCode||null,displayName:value?.displayName||null,campaignId:value?.campaignId||null,sourcePage:value?.sourcePage||location.pathname,attributionSource:value?.attributionSource||null,timestamp:value?.timestamp||new Date().toISOString()};localStorage.setItem(ATTRIBUTION_KEY,JSON.stringify(safe));window.dispatchEvent(new CustomEvent('pack321:attribution',{detail:safe}));return safe;}
  function clearAttribution(){localStorage.removeItem(ATTRIBUTION_KEY);}
  function addCartItem(item){const cart=readCart();const context=readAttribution();if(context?.type==='scout')item.attribution={type:'scout',value:context.displayName,scoutCode:context.scoutCode,campaignId:context.campaignId,sourcePage:context.sourcePage,timestamp:context.timestamp};const key=lineKey(item);const existing=cart.items.find(line=>lineKey(line)===key);if(existing)existing.quantity+=item.quantity;else cart.items.push({...item,id:`line-${Date.now()}-${Math.random().toString(16).slice(2)}`});cart.attribution=context||cart.attribution;writeCart(cart);return cart;}
  function showToast(message){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),3200);}
  function campaignStatus(campaign){return String(campaign?.status||'').toLowerCase();}
  function getCampaignUrl(campaign,{section='',scoutCode=''}={}){let id=typeof campaign==='string'?campaign:campaign?.id;if(id==='seroogy-candy-2026')id='candy-2026';if(id==='rose-wreaths-2026')id='wreaths-2027';if(!id)return'';const base=location.pathname.startsWith('/store/')?'/store':'';const params=new URLSearchParams({id});if(scoutCode)params.set('scout',scoutCode);return`${base}/campaign.html?${params}${section?`#${section}`:''}`;}
  function getProductUrl(product,{attribution=readAttribution()}={}){const id=typeof product==='string'?product:product?.id;if(!id)return'';const base=location.pathname.startsWith('/store/')?'/store':'';const params=new URLSearchParams({id});if(attribution?.type==='scout'&&attribution.scoutCode)params.set('scout',attribution.scoutCode);else if(attribution?.type==='pack')params.set('support','pack');return`${base}/product.html?${params}`;}
  function isAvailable(product,campaign){if(!product?.active||product.availableForSale===false||product.priceStatus!=='approved'||Number(product.price)<=0)return false;if(product.inventoryMode==='sold out'||product.inventoryQuantity===0)return false;if(campaign&&campaignStatus(campaign)!=='active')return false;return true;}
  function stepQuantity(input,delta,{min=0,max=99}={}){const value=Math.max(min,Math.min(max,(Number(input?.value)||0)+Number(delta||0)));if(input)input.value=String(value);return value;}
  window.StoreUtils={CART_KEY,ATTRIBUTION_KEY,escapeHtml,formatCurrency,getFundraisingProgress,formatDate,loadData,loadMedia,readCart,writeCart,updateCartBadge,addCartItem,showToast,campaignStatus,getCampaignUrl,getProductUrl,isAvailable,stepQuantity,readAttribution,setAttribution,clearAttribution};
})();
