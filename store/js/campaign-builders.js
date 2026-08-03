(function () {
  'use strict';
  const e = value => StoreUtils.escapeHtml(value);
  const money = (price, currency = 'usd') => StoreUtils.formatCurrency(price, currency);
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
    return `<article class="builder-product" data-builder-product="${e(product.id)}"><img src="${e(product.image)}" alt="${e(product.imageAlt || product.name)}" width="${product.imageWidth || 800}" height="${product.imageHeight || 600}" loading="lazy"><div><h4>${e(product.name)}</h4>${product.weight ? `<p><strong>${e(product.weight)}</strong></p>` : ''}<p>${e(product.vendorDescription || product.description)}</p>${renderBadges(product.dietaryAttributes, symbols)}${price}${fulfillment}${unavailable}</div><label class="quantity-control"><span>Quantity</span><button type="button" data-quantity-change="-1" ${enabled ? '' : 'disabled'} aria-label="Decrease ${e(product.name)} quantity">−</button><input type="number" min="0" max="99" value="0" data-quantity ${enabled ? '' : 'disabled'} aria-label="${e(product.name)} quantity"><button type="button" data-quantity-change="1" ${enabled ? '' : 'disabled'} aria-label="Increase ${e(product.name)} quantity">+</button></label></article>`;
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
    return `<div class="builder-shell" data-campaign-builder>${state}${presets}${campaign.renderer === 'popcorn-builder' ? legend(symbols) : ''}<div class="builder-groups">${Object.entries(groups).map(([name, items]) => `<section class="builder-group"><h3>${e(name)}</h3>${items.map(product => row(product, campaign, symbols)).join('')}</section>`).join('') || '<div class="empty-state"><h3>Products coming soon</h3></div>'}</div><div class="builder-summary"><span>${support}</span><span><strong data-builder-count>0</strong> items</span><strong data-builder-total>${money(0)}</strong><button class="button gold" type="button" data-add-everything ${hasSaleable ? '' : 'disabled'}>${e(campaign.renderer === 'sponsorship-builder' ? campaign.primaryAction : 'Add Everything to Cart')}</button></div><p data-builder-message aria-live="polite"></p></div>`;
  }
  function bind(host, campaign, products) {
    const builder = host.querySelector('[data-campaign-builder]'); if (!builder) return;
    const dialog = builder.querySelector('#campaign-symbol-legend');
    builder.querySelector('[data-open-symbol-legend]')?.addEventListener('click', () => dialog.showModal());
    dialog?.querySelector('[data-close-symbol-legend]')?.addEventListener('click', () => dialog.close());
    dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    const values = () => [...builder.querySelectorAll('[data-builder-product]')].map(element => ({ row: element, product: products.find(product => product.id === element.dataset.builderProduct), quantity: Number(element.querySelector('[data-quantity]').value) || 0 }));
    const update = () => { const list = values(); builder.querySelector('[data-builder-count]').textContent = list.reduce((sum, item) => sum + item.quantity, 0); builder.querySelector('[data-builder-total]').textContent = money(list.reduce((sum, item) => sum + item.quantity * item.product.price, 0)); };
    builder.addEventListener('input', update);
    builder.addEventListener('click', event => {
      const step = event.target.closest('[data-quantity-change]');
      if (step) { const input = step.parentElement.querySelector('[data-quantity]'); input.value = Math.max(0, Math.min(99, Number(input.value || 0) + Number(step.dataset.quantityChange))); update(); return; }
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
