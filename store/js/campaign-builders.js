(function () {
  'use strict';
  const e = value => StoreUtils.escapeHtml(value);
  const money = (price, currency = 'usd') => StoreUtils.formatCurrency(price, currency);
  const detailUrl = id => StoreUtils.getProductUrl(id);
  const display = window.PackCampaignDisplay || {};
  const renderBadges = (ids, definitions) => {
    const map = new Map(definitions.map(item => [item.id, item]));
    const badges = (ids || []).map(id => map.get(id)).filter(Boolean).map(item => `<li class="product-badge"><span class="product-badge__short">${e(item.shortLabel)}</span><span class="product-badge__name">${e(item.displayName)}</span></li>`).join('');
    return badges ? `<ul class="product-badges" aria-label="Dietary information">${badges}</ul>` : '';
  };
  function saleable(product, campaign) {
    return StoreUtils.campaignStatus(campaign) === 'active' && product.active && product.availableForSale === true && product.priceStatus === 'approved' && product.price > 0;
  }
  function row(product, campaign, symbols) {
    const enabled = saleable(product, campaign);
    const price = product.priceStatus === 'pending' || product.price === 0 ? '<strong class="product-card__price product-card__price--pending">Pricing Pending</strong>' : `<strong>${money(product.price, product.currency)}</strong>`;
    const fulfillment = product.fulfillmentType === 'program-direct-shipment' ? '<p><small>Direct shipment through the popcorn program; no customer pickup.</small></p>' : product.fulfillmentType === 'ceremony-placement' ? '<p><small>Placed during the approved remembrance ceremony; not delivered to the purchaser.</small></p>' : '';
    const unavailable = enabled ? '' : `<span class="button button--disabled" aria-disabled="true">${product.priceStatus === 'pending' ? 'Available When Pricing Is Final' : 'Ordering Unavailable'}</span>`;
    const wreathClass = campaign.renderer === 'wreath-builder' ? ' wreath-product-row' : '';
    const url=detailUrl(product.id);
    return `<article class="builder-product product-row${wreathClass}" id="product-${e(product.id)}" data-builder-product="${e(product.id)}"><div class="product-row__media product-thumbnail-wrap"><a href="${e(url)}" aria-label="View ${e(product.name)}"><img class="product-row__image product-card__image product-thumbnail" src="${e(product.image)}" alt="${e(product.imageAlt || product.name)}" width="96" height="96" loading="lazy"></a></div><div><h4><a href="${e(url)}">${e(product.name)}</a></h4>${product.weight ? `<p><strong>${e(product.weight)}</strong></p>` : ''}<p>${e(product.vendorDescription || product.description)}</p>${renderBadges(product.dietaryAttributes, symbols)}${price}${fulfillment}${unavailable}</div><label class="quantity-control"><span>Quantity</span><button type="button" data-quantity-change="-1" ${enabled ? '' : 'disabled'} aria-label="Decrease ${e(product.name)} quantity">−</button><input type="number" min="0" max="99" value="0" data-quantity ${enabled ? '' : 'disabled'} aria-label="${e(product.name)} quantity"><button type="button" data-quantity-change="1" ${enabled ? '' : 'disabled'} aria-label="Increase ${e(product.name)} quantity">+</button></label></article>`;
  }
  function legend(symbols) {
    if (!symbols.length) return '';
    return `<button class="symbol-legend-trigger" type="button" data-open-symbol-legend>What do these symbols mean?</button><dialog class="symbol-legend-dialog" id="campaign-symbol-legend"><div class="symbol-legend-dialog__header"><div><p class="eyebrow">Product Information</p><h2>Dietary and Product Symbols</h2></div><button class="icon-button" type="button" data-close-symbol-legend aria-label="Close symbol legend">×</button></div><div class="symbol-legend-dialog__body"><ul class="symbol-legend">${symbols.filter(item => item.visible !== false).map(item => `<li class="symbol-legend__item"><span class="symbol-legend__badge">${e(item.shortLabel || item.displayName)}</span><div><strong>${e(item.displayName)}</strong><p>${e(item.description || 'Vendor designation. Additional information is pending.')}</p></div></li>`).join('')}</ul></div></dialog>`;
  }
  function render(campaign, products, symbols = []) {
    const status = StoreUtils.campaignStatus(campaign);
    const hasSaleable = products.some(product => saleable(product, campaign));
    const presets = campaign.renderer === 'candy-builder' ? '<div class="builder-toolbar"><span>Quick quantities:</span><button type="button" class="button outline" data-preset="7">Sampler: 7 / $14</button><button type="button" class="button outline" data-preset="12">Family assortment: 12 / $24</button><button type="button" class="button outline" data-preset="25">Party assortment: 25 / $50</button></div>' : '';
    let state = '';
    if (status === 'scheduled') state = '<div class="notice"><strong>Coming Soon</strong><br>This scheduled campaign cannot accept quantities yet.</div>';
    else if (['closed', 'archived'].includes(status)) state = '<div class="notice"><strong>Ordering Closed</strong><br>This campaign no longer accepts orders.</div>';
    else if (campaign.priceStatus === 'pending') state = '<div class="notice"><strong>Pricing Pending</strong><br>Products are visible for review but cannot be added until Pack 321 approves prices.</div>';
    const attribution = StoreUtils.readAttribution();
    const support = attribution?.type === 'scout' ? `Supporting ${e(attribution.displayName || 'a Pack 321 Scout')}` : 'Supporting Pack 321';
    const groups = products.reduce((output, product) => ((output[product.category || 'Products'] ??= []).push(product), output), {});
    const definitions=campaign.renderer==='popcorn-builder'?[['Featured',/Popcorn Favorites/i],['Classic',/Pop at Home/i],['Microwave',/Microwave/i],['Sweet',/Chocolate|Specialty/i],['Savory',/Savory|Snack Mix/i],['Gourmet',/Premium Gourmet|Gift Tin/i],['Variety',/Variety/i],['Military',/Military/i]]:campaign.renderer==='wreath-builder'?[['Traditional',/Front Door/i],['Large',/Large Display/i],['Double Face',/Double-Face/i],['Trees',/Holiday Trees/i],['Greenery',/Holiday Greenery/i],['Centerpieces',/Centerpieces/i],['Memorial',/Memorial|Religious/i],['Accessories',/Accessories/i]]:[];
    const entries=definitions.length?definitions.map(([label,pattern])=>[label,Object.entries(groups).filter(([name])=>pattern.test(name)).flatMap(([,items])=>items)]).filter(([,items])=>items.length):Object.entries(groups);
    const aliases = definitions.map(([label])=>label);
    const tabs = aliases.length && entries.length > 1 ? `<div class="store-tabs builder-tabs" role="tablist" aria-label="Product categories">${entries.map(([name],index)=>`<button type="button" role="tab" id="builder-tab-${index}" aria-controls="builder-panel-${index}" aria-selected="${index===0}" tabindex="${index===0?0:-1}">${e(aliases[index]||name)}</button>`).join('')}</div>` : '';
    const panels = entries.map(([name,items],index)=>`<section class="builder-group" ${tabs?`role="tabpanel" id="builder-panel-${index}" aria-labelledby="builder-tab-${index}"${index?' hidden':''}`:''}><h3>${e(name)}</h3><div class="builder-product-grid">${items.map(product=>row(product,campaign,symbols)).join('')}</div></section>`).join('') || '<div class="empty-state"><h3>Products coming soon</h3></div>';
    return `<div class="builder-shell builder-shell--${e(campaign.renderer)}" data-campaign-builder>${state}<div class="builder-workspace"><div class="builder-catalog">${presets}${campaign.renderer === 'popcorn-builder' ? legend(symbols) : ''}${tabs}<div class="builder-groups store-scroll-region">${panels}</div></div><aside class="builder-summary persistent-summary" aria-label="Live order summary"><span>${support}</span><span><strong data-builder-count>0</strong> items selected</span><strong data-builder-total>${money(0)}</strong><button class="button gold" type="button" data-add-everything ${hasSaleable ? '' : 'disabled'}>${e(campaign.renderer === 'sponsorship-builder' ? campaign.primaryAction : 'Add Everything to Cart')}</button><p data-builder-message aria-live="polite"></p></aside></div></div>`;
  }
  function bind(host, campaign, products) {
    const builder = host.querySelector('[data-campaign-builder]'); if (!builder) return;
    const dialog = builder.querySelector('#campaign-symbol-legend');
    const legendTrigger = builder.querySelector('[data-open-symbol-legend]');
    const closeLegend = () => { dialog?.close(); legendTrigger?.focus(); };
    legendTrigger?.addEventListener('click', () => dialog.showModal());
    dialog?.querySelector('[data-close-symbol-legend]')?.addEventListener('click', closeLegend);
    dialog?.addEventListener('cancel', event => { event.preventDefault(); closeLegend(); });
    dialog?.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); closeLegend(); } });
    dialog?.addEventListener('click', event => { if (event.target === dialog) closeLegend(); });
    const values = () => [...builder.querySelectorAll('[data-builder-product]')].map(element => ({ row: element, product: products.find(product => product.id === element.dataset.builderProduct), quantity: Number(element.querySelector('[data-quantity]').value) || 0 }));
    const tabs=[...builder.querySelectorAll('[role="tab"]')];
    const selectTab=tab=>tabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;const panel=builder.querySelector(`#${item.getAttribute('aria-controls')}`);if(panel)panel.hidden=!selected;});
    tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();selectTab(tabs[next]);});});
    const update = () => { const list = values(); builder.querySelector('[data-builder-count]').textContent = list.reduce((sum, item) => sum + item.quantity, 0); builder.querySelector('[data-builder-total]').textContent = money(list.reduce((sum, item) => sum + item.quantity * item.product.price, 0)); };
    builder.addEventListener('input', update);
    builder.addEventListener('click', event => {
      const step = event.target.closest('[data-quantity-change]');
      if (step) { const input = step.parentElement.querySelector('[data-quantity]'); StoreUtils.stepQuantity(input,step.dataset.quantityChange,{min:0,max:99}); update(); return; }
      const preset = event.target.closest('[data-preset]');
      if (preset) { let left = Number(preset.dataset.preset); values().filter(item => !item.row.querySelector('[data-quantity]').disabled).forEach((item, index, array) => { const amount = Math.ceil(left / (array.length - index)); item.row.querySelector('[data-quantity]').value = amount; left -= amount; }); update(); return; }
      if (!event.target.closest('[data-add-everything]')) return;
      const selected = values().filter(item => item.quantity > 0 && saleable(item.product, campaign));
      const message = builder.querySelector('[data-builder-message]');
      if (!selected.length) { message.textContent = 'Choose at least one available quantity.'; return; }
      const attribution = StoreUtils.readAttribution() || { type: 'pack', attributionSource: 'pack-wide', sourcePage: location.pathname };
      selected.forEach(({ product, quantity }) => StoreUtils.addCartItem({ productId: product.id, quantity, campaignId: campaign.id, campaignYear: campaign.year, campaignType: campaign.campaignType, selectedOptions: [], options: {}, fundraisingCode: attribution.type === 'scout' ? attribution.scoutCode : null, publicScoutDisplayName: attribution.type === 'scout' ? attribution.displayName : null, attributionType: attribution.type, attributionSource: attribution.attributionSource || 'campaign-builder', fulfillmentType: product.fulfillmentType, pickupLocationId: null, attribution }));
      message.textContent = `${selected.reduce((sum, item) => sum + item.quantity, 0)} items added to the cart.`; StoreUtils.showToast('Campaign selections added to cart.');
    });
    update();
  }
  window.PackCampaignBuilders = { render, bind, saleable };
})();
