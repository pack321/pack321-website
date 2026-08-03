(function () {
  'use strict';
  const escape = value => StoreUtils.escapeHtml(value);
  function formatProgramYear(campaign) {
    if (campaign?.programYearLabel) return campaign.programYearLabel;
    const start = Number(campaign?.programYearStart ?? campaign?.year);
    const end = Number(campaign?.programYearEnd ?? (Number.isFinite(start) ? start + 1 : NaN));
    return Number.isFinite(start) && Number.isFinite(end) ? `${start}–${end}` : '';
  }
  function campaignName(campaign) {
    return String(campaign?.cardTitle || campaign?.name || 'Fundraiser').replace(/^\d{4}(?:[–-]\d{4})?\s+/, '');
  }
  function getCampaignProducts(campaign, allProducts) {
    const productMap = new Map(allProducts.map(product => [product.id, product]));
    return (Array.isArray(campaign?.productIds) ? campaign.productIds : [])
      .map(id => productMap.get(id)).filter(Boolean)
      .sort((a, b) => (Number.isFinite(a.sortOrder) ? a.sortOrder : 9999) - (Number.isFinite(b.sortOrder) ? b.sortOrder : 9999));
  }
  function renderDietaryBadges(attributeIds, definitions) {
    if (!Array.isArray(attributeIds) || !attributeIds.length) return '';
    const map = new Map(definitions.map(definition => [definition.id, definition]));
    const badges = attributeIds.map(id => map.get(id)).filter(Boolean).map(definition => `<li class="product-badge"><span class="product-badge__short">${escape(definition.shortLabel)}</span><span class="product-badge__name">${escape(definition.displayName)}</span></li>`).join('');
    return badges ? `<ul class="product-badges" aria-label="Dietary information">${badges}</ul>` : '';
  }
  function renderLegend(definitions) {
    const visible = definitions.filter(symbol => symbol.visible !== false);
    if (!visible.length) return '';
    return `<button class="symbol-legend-trigger" type="button" data-open-symbol-legend>What do these symbols mean?</button><dialog class="symbol-legend-dialog" id="campaign-symbol-legend"><div class="symbol-legend-dialog__header"><div><p class="eyebrow">Product Information</p><h2>Dietary and Product Symbols</h2></div><button class="icon-button" type="button" data-close-symbol-legend aria-label="Close symbol legend">×</button></div><div class="symbol-legend-dialog__body"><ul class="symbol-legend">${visible.map(symbol => `<li class="symbol-legend__item"><span class="symbol-legend__badge">${escape(symbol.shortLabel || symbol.displayName)}</span><div><strong>${escape(symbol.displayName)}</strong><p>${escape(symbol.description || 'Vendor designation. Additional information is pending.')}</p></div></li>`).join('')}</ul></div></dialog>`;
  }
  function initializeSymbolLegend(root = document) {
    const dialog = root.querySelector('#campaign-symbol-legend');
    if (!dialog) return;
    root.querySelectorAll('[data-open-symbol-legend]').forEach(button => button.addEventListener('click', () => dialog.showModal()));
    dialog.querySelector('[data-close-symbol-legend]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  }
  window.PackCampaignDisplay = { formatProgramYear, campaignName, getCampaignProducts, renderDietaryBadges, renderLegend, initializeSymbolLegend };
})();
