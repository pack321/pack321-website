document.addEventListener('DOMContentLoaded', () => {
  const tabs = Array.from(document.querySelectorAll('[data-uniform-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-uniform-panel]'));
  if (!tabs.length || !panels.length) return;

  const showPanel = (id, updateHash = true) => {
    const target = panels.find((panel) => panel.dataset.uniformPanel === id) || panels[0];
    panels.forEach((panel) => panel.classList.toggle('is-active', panel === target));
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.uniformTab === target.dataset.uniformPanel));
    if (updateHash) history.replaceState(null, '', '#' + target.id);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      showPanel(tab.dataset.uniformTab);
    });
  });

  const hash = window.location.hash.replace('#', '');
  const hashedPanel = panels.find((panel) => panel.id === hash);
  if (hashedPanel) showPanel(hashedPanel.dataset.uniformPanel, false);
});
