(function () {
  const storageKey = 'scouthq:ryn:orb-position';
  const sessionKey = 'scouthq:ryn:active-context';

  const pageContexts = [
    {
      match: /\/portal\/admin\/users\/?$/,
      module: 'User Access',
      workspace: 'Admin',
      permissions: ['admin.users.manage', 'admin.roles.manage', 'admin.audit.view'],
      suggestions: ['Review pending access requests', 'Add a Google user', 'Explain inactive access', 'Show user audit history'],
      actions: [
        { label: 'Add User', response: 'I can start the add-user workflow. I will need the Google email, display name, family link, and role assignment before anything is saved.' },
        { label: 'Review Requests', response: 'Open access requests, compare each request to existing families, then approve or deny with an audit note.' },
        { label: 'Assign Role', confirm: true, response: 'Role changes affect permissions. Review the selected user and role before saving.' },
      ],
      notifications: ['2 access requests are waiting for admin review.', 'Inactive users should remain in history instead of being deleted.'],
    },
    {
      match: /\/portal\/admin\/roles\/?$/,
      module: 'Roles & Permissions',
      workspace: 'Admin',
      permissions: ['admin.roles.manage', 'admin.security.view'],
      suggestions: ['Explain this permission', 'Compare Den Leader and Parent access', 'Find finance permissions', 'Prepare role review'],
      actions: [
        { label: 'Find Permission', response: 'Tell me a capability, such as finance exports or event management, and I will point to the matching permission key.' },
        { label: 'Review Role Map', response: 'Start with Admin, Treasurer, Committee Chair, Den Leader, and Parent. Then confirm least-privilege access for each role.' },
        { label: 'Change Permission', confirm: true, response: 'Permission changes can expose sensitive data. Confirm the role, permission key, and reason before saving.' },
      ],
      notifications: ['Permission changes should be reviewed with the Committee Chair.', 'Finance permissions should remain separate from general leadership access.'],
    },
    {
      match: /\/portal\/admin\/security\/?$/,
      module: 'Security',
      workspace: 'Admin',
      permissions: ['admin.security.view', 'admin.settings.manage'],
      suggestions: ['Why is backend enforcement required?', 'Check session timeout', 'Explain Google OAuth only', 'List security risks'],
      actions: [
        { label: 'Review Security', response: 'Check OAuth, active-user matching, permission checks, session timeout, audit logging, and export logging.' },
        { label: 'Open Audit Log', href: '../audit-log/' },
        { label: 'Change Security Setting', confirm: true, response: 'Security settings affect every user. Confirm the setting, impact, and rollback plan before saving.' },
      ],
      notifications: ['Frontend hiding is not security; every API read/write must verify permissions.'],
    },
    {
      match: /\/portal\/admin\/audit-log\/?$/,
      module: 'Audit Log',
      workspace: 'Admin',
      permissions: ['admin.audit.view'],
      suggestions: ['Find role changes', 'Explain before/after values', 'Filter exports', 'Review finance edits'],
      actions: [
        { label: 'Filter Audit Log', response: 'Choose a date range, module, user, or action type. I will keep that filter in this conversation.' },
        { label: 'Export Review', confirm: true, response: 'Exports should create their own audit event. Confirm the scope before exporting.' },
        { label: 'Review Changes', response: 'Focus on user, role, finance, settings, and report export events first.' },
      ],
      notifications: ['Recent export events should be reviewed for scope and business purpose.'],
    },
    {
      match: /\/portal\/admin\/settings\/?$/,
      module: 'System Settings',
      workspace: 'Admin',
      permissions: ['admin.settings.manage'],
      suggestions: ['Explain first admin bootstrap', 'Review deployment settings', 'Plan user preferences', 'Check data boundary'],
      actions: [
        { label: 'Review Settings', response: 'Start with ADMIN_EMAILS, session timeout, audit logging, export logging, and portal defaults.' },
        { label: 'Plan Setup', response: 'Bootstrap the first admin once, then manage all future users from the portal.' },
        { label: 'Change Setting', confirm: true, response: 'Settings changes can affect the entire portal. Confirm the value and impact before saving.' },
      ],
      notifications: ['After bootstrap, do not rely on environment variables for normal role management.'],
    },
    {
      match: /\/portal\/admin\/?$/,
      module: 'Admin Dashboard',
      workspace: 'Admin',
      permissions: ['admin.users.manage', 'admin.roles.manage', 'admin.audit.view', 'admin.security.view'],
      suggestions: ['What should I review first?', 'Show pending access work', 'Explain portal security', 'Prepare admin checklist'],
      actions: [
        { label: 'Open Users', href: 'users/' },
        { label: 'Open Roles', href: 'roles/' },
        { label: 'Open Audit Log', href: 'audit-log/' },
      ],
      notifications: ['Security enforcement still belongs in the backend/API layer.', 'Access request workflow is planned and ready for implementation.'],
    },
  ];

  const fallbackContext = {
    module: 'ScoutHQ',
    workspace: 'Portal',
    permissions: ['portal.view'],
    suggestions: ['What does this page do?', 'What should I do next?', 'Why can I not edit this?', 'Show quick actions'],
    actions: [
      { label: 'Create Event', response: 'I can guide the event workflow: title, date, location, registrations, invitations, and follow-up tasks.' },
      { label: 'Find Member', response: 'Search by scout, parent, den, or email. I will keep the selected member in this conversation.' },
      { label: 'Generate Report', response: 'Choose the report type, date range, and audience. I will ask for confirmation before export.' },
    ],
    notifications: ['No urgent alerts for this workspace.'],
  };

  const sensitiveWords = ['delete', 'archive', 'remove', 'permission', 'financial', 'finance', 'email', 'export', 'calendar'];
  let context = getContext();
  let conversation = [];
  let currentFocus = readSessionContext();
  let pendingConfirmation = null;
  let drag = null;

  document.addEventListener('DOMContentLoaded', initRyn);

  function initRyn() {
    if (!document.body || document.querySelector('[data-ryn-root]')) return;

    const root = document.createElement('div');
    root.className = 'ryn-root';
    root.dataset.rynRoot = '';
    root.dataset.state = navigator.onLine ? 'notification' : 'offline';
    root.innerHTML = `
      <section class="ryn-panel" id="ryn-panel" aria-label="Ryn assistant panel" aria-hidden="true">
        <div class="ryn-panel__header">
          <div>
            <h2 class="ryn-panel__title">Ryn</h2>
            <p data-ryn-greeting></p>
          </div>
          <button class="ryn-panel__close" type="button" data-ryn-close aria-label="Close Ryn">x</button>
        </div>
        <div class="ryn-panel__body">
          <form class="ryn-search" data-ryn-form>
            <label for="ryn-query">Ask Ryn</label>
            <div class="ryn-search__row">
              <input id="ryn-query" name="query" type="search" autocomplete="off" placeholder="Ask about this workspace">
              <button type="submit">Ask</button>
            </div>
          </form>
          <section>
            <div class="ryn-section__label">Context</div>
            <div class="ryn-context-card" data-ryn-context></div>
          </section>
          <section>
            <div class="ryn-section__label">Recent conversations</div>
            <div class="ryn-recent-list" data-ryn-recent></div>
          </section>
          <section>
            <div class="ryn-section__label">Suggestions</div>
            <div class="ryn-chip-list" data-ryn-suggestions></div>
          </section>
          <section>
            <div class="ryn-section__label">Quick actions</div>
            <div class="ryn-action-grid" data-ryn-actions></div>
          </section>
          <section>
            <div class="ryn-section__label">Active notifications</div>
            <div class="ryn-notification-list" data-ryn-notifications></div>
          </section>
          <section>
            <div class="ryn-section__label">Conversation memory</div>
            <div class="ryn-memory-list" data-ryn-memory></div>
          </section>
          <section>
            <div class="ryn-section__label">Conversation</div>
            <div class="ryn-thread" data-ryn-thread></div>
          </section>
        </div>
      </section>
      <button class="ryn-orb" type="button" aria-label="Open Ryn assistant" aria-expanded="false" aria-controls="ryn-panel" data-ryn-orb>
        <span class="ryn-orb__pulse"></span>
        <span class="ryn-orb__mark">Ryn</span>
        <span class="ryn-orb__status" aria-hidden="true"></span>
      </button>
    `;

    const confirm = document.createElement('div');
    confirm.className = 'ryn-confirm';
    confirm.dataset.rynConfirm = '';
    confirm.innerHTML = `
      <div class="ryn-confirm__dialog" role="dialog" aria-modal="true" aria-labelledby="ryn-confirm-title">
        <h2 id="ryn-confirm-title">Confirm action</h2>
        <p data-ryn-confirm-copy></p>
        <div class="ryn-confirm__actions">
          <button class="ryn-confirm__button" type="button" data-ryn-cancel>Cancel</button>
          <button class="ryn-confirm__button ryn-confirm__button--primary" type="button" data-ryn-confirm-action>Confirm</button>
        </div>
      </div>
    `;

    document.body.append(root, confirm);
    applyStoredPosition(root);
    render(root);
    bind(root, confirm);
  }

  function bind(root, confirm) {
    const orb = root.querySelector('[data-ryn-orb]');
    const panel = root.querySelector('#ryn-panel');
    const form = root.querySelector('[data-ryn-form]');
    const input = root.querySelector('#ryn-query');

    orb.addEventListener('click', () => {
      if (drag && drag.moved) return;
      togglePanel(root, panel);
    });
    orb.addEventListener('pointerdown', (event) => startDrag(event, root));
    document.addEventListener('pointermove', (event) => moveDrag(event, root));
    document.addEventListener('pointerup', () => endDrag(root));

    root.querySelector('[data-ryn-close]').addEventListener('click', () => closePanel(root, panel));
    root.querySelector('[data-ryn-suggestions]').addEventListener('click', (event) => {
      const chip = event.target.closest('[data-ryn-prompt]');
      if (chip) handlePrompt(root, chip.dataset.rynPrompt);
    });
    root.querySelector('[data-ryn-actions]').addEventListener('click', (event) => {
      const actionButton = event.target.closest('[data-ryn-action]');
      if (actionButton) runAction(root, confirm, Number(actionButton.dataset.rynAction));
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      input.value = '';
      handlePrompt(root, query);
    });
    confirm.querySelector('[data-ryn-cancel]').addEventListener('click', () => closeConfirm(confirm));
    confirm.querySelector('[data-ryn-confirm-action]').addEventListener('click', () => {
      if (pendingConfirmation) {
        appendMessage(root, 'ryn', pendingConfirmation.response);
        setState(root, 'working', 900);
      }
      closeConfirm(confirm);
    });
    window.addEventListener('online', () => root.dataset.state = 'idle');
    window.addEventListener('offline', () => root.dataset.state = 'offline');
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closePanel(root, panel);
        closeConfirm(confirm);
      }
    });
  }

  function render(root) {
    const greeting = root.querySelector('[data-ryn-greeting]');
    const hour = new Date().getHours();
    const daypart = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    greeting.textContent = `${daypart}. I am ready to help with ${context.module}.`;

    root.querySelector('[data-ryn-suggestions]').innerHTML = context.suggestions
      .map((prompt) => `<button class="ryn-chip" type="button" data-ryn-prompt="${escapeAttr(prompt)}">${escapeHtml(prompt)}</button>`)
      .join('');
    root.querySelector('[data-ryn-context]').innerHTML = [
      ['Organization', 'Cub Scout Pack 321'],
      ['Program', 'ScoutHQ Portal'],
      ['Role', 'Admin preview'],
      ['Workspace', context.workspace],
      ['Module', context.module],
      ['Planning year', String(new Date().getFullYear())],
    ].map(([label, value]) => `<span><strong>${escapeHtml(label)}</strong>${escapeHtml(value)}</span>`).join('');
    root.querySelector('[data-ryn-recent]').innerHTML = '<div class="ryn-card"><strong>Future-ready</strong><span>Recent conversations will appear here when account-backed history is available.</span></div>';
    root.querySelector('[data-ryn-actions]').innerHTML = context.actions
      .map((action, index) => `<button class="ryn-action" type="button" data-ryn-action="${index}">${escapeHtml(action.label)}</button>`)
      .join('');
    root.querySelector('[data-ryn-notifications]').innerHTML = context.notifications
      .map((note) => `<div class="ryn-card"><strong>${escapeHtml(context.module)}</strong><span>${escapeHtml(note)}</span></div>`)
      .join('');
    renderMemory(root);
    appendMessage(root, 'ryn', `You are in ${context.workspace}: ${context.module}. I can explain this page, guide workflows, and help with safe next steps.`);
  }

  function handlePrompt(root, prompt) {
    appendMessage(root, 'user', prompt);
    remember(prompt);
    const response = getResponse(prompt);
    const needsConfirm = sensitiveWords.some((word) => prompt.toLowerCase().includes(word));
    if (needsConfirm) {
      appendMessage(root, 'ryn', 'That may affect people, permissions, communications, or records. I can guide it, but I would ask for confirmation before changing anything.');
      setState(root, 'thinking', 800);
    } else {
      appendMessage(root, 'ryn', response);
      setState(root, 'speaking', 900);
    }
    renderMemory(root);
  }

  function runAction(root, confirm, index) {
    const action = context.actions[index];
    if (!action) return;
    if (action.href) {
      window.location.href = action.href;
      return;
    }
    if (action.confirm) {
      pendingConfirmation = action;
      confirm.querySelector('[data-ryn-confirm-copy]').textContent = `${action.label} can affect ScoutHQ data or access. Review the impact before continuing.`;
      confirm.classList.add('is-open');
      confirm.querySelector('[data-ryn-cancel]').focus();
      root.dataset.state = 'working';
      return;
    }
    appendMessage(root, 'user', action.label);
    appendMessage(root, 'ryn', action.response);
    remember(action.label);
    renderMemory(root);
    setState(root, 'working', 900);
  }

  function getResponse(prompt) {
    const normalized = prompt.toLowerCase();
    if (normalized.includes('what does') || normalized.includes('page do')) {
      return `${context.module} helps leaders understand and manage this part of ScoutHQ. The most useful next step is usually one of the quick actions above.`;
    }
    if (normalized.includes('why') && normalized.includes('edit')) {
      return `Editing depends on your role and permissions. This workspace currently recognizes: ${context.permissions.join(', ')}.`;
    }
    if (normalized.includes('next')) {
      return `Next, review the active notifications, then use the safest matching quick action. I will keep this ${context.module} context during the conversation.`;
    }
    if (normalized.includes('last month')) {
      return `I will apply "last month" to the current thread context. Current focus: ${currentFocus || context.module}.`;
    }
    if (normalized.includes('email')) {
      return 'Email distribution requires confirmation, recipient review, and an audit note before sending.';
    }
    if (normalized.includes('permission')) {
      return `For this workspace, relevant permissions are ${context.permissions.join(', ')}. Permission changes should be reviewed before saving.`;
    }
    return `I can help with "${prompt}" in ${context.module}. I will guide the workflow step by step and ask before any sensitive action.`;
  }

  function remember(value) {
    currentFocus = value;
    conversation = [value, ...conversation.filter((item) => item !== value)].slice(0, 4);
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify({ currentFocus, conversation }));
    } catch (error) {
      return;
    }
  }

  function readSessionContext() {
    try {
      const stored = JSON.parse(sessionStorage.getItem(sessionKey) || '{}');
      conversation = Array.isArray(stored.conversation) ? stored.conversation : [];
      return stored.currentFocus || '';
    } catch (error) {
      conversation = [];
      return '';
    }
  }

  function renderMemory(root) {
    const memory = root.querySelector('[data-ryn-memory]');
    const items = conversation.length ? conversation : [context.module, context.workspace];
    memory.innerHTML = items.map((item) => `<div class="ryn-memory">${escapeHtml(item)}</div>`).join('');
  }

  function appendMessage(root, speaker, text) {
    const thread = root.querySelector('[data-ryn-thread]');
    if (!thread) return;
    const message = document.createElement('div');
    message.className = `ryn-message ryn-message--${speaker}`;
    message.textContent = text;
    thread.appendChild(message);
    thread.scrollTop = thread.scrollHeight;
  }

  function togglePanel(root, panel) {
    const open = !root.classList.contains('is-panel-open');
    root.classList.toggle('is-panel-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    root.querySelector('[data-ryn-orb]').setAttribute('aria-expanded', String(open));
    root.dataset.state = open ? 'idle' : 'notification';
    if (open) root.querySelector('#ryn-query').focus();
  }

  function closePanel(root, panel) {
    root.classList.remove('is-panel-open');
    panel.setAttribute('aria-hidden', 'true');
    root.querySelector('[data-ryn-orb]').setAttribute('aria-expanded', 'false');
    root.dataset.state = 'idle';
  }

  function closeConfirm(confirm) {
    confirm.classList.remove('is-open');
    pendingConfirmation = null;
  }

  function setState(root, state, duration) {
    root.dataset.state = state;
    window.clearTimeout(root._rynStateTimer);
    root._rynStateTimer = window.setTimeout(() => {
      root.dataset.state = root.classList.contains('is-panel-open') ? 'idle' : 'notification';
    }, duration);
  }

  function startDrag(event, root) {
    const orb = event.target.closest('[data-ryn-orb]');
    if (!orb) return;
    const rect = root.getBoundingClientRect();
    drag = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      moved: false,
    };
    orb.setPointerCapture(event.pointerId);
  }

  function moveDrag(event, root) {
    if (!drag) return;
    drag.moved = true;
    const margin = 12;
    const width = root.offsetWidth;
    const height = root.offsetHeight;
    const x = Math.min(Math.max(event.clientX - drag.offsetX, margin), window.innerWidth - width - margin);
    const y = Math.min(Math.max(event.clientY - drag.offsetY, margin), window.innerHeight - height - margin);
    root.style.left = `${x}px`;
    root.style.top = `${y}px`;
    root.style.right = 'auto';
    root.style.bottom = 'auto';
  }

  function endDrag(root) {
    if (!drag) return;
    if (drag.moved) {
      const rect = root.getBoundingClientRect();
      try {
        localStorage.setItem(storageKey, JSON.stringify({ left: rect.left, top: rect.top }));
      } catch (error) {
        return;
      }
    }
    window.setTimeout(() => { drag = null; }, 0);
  }

  function applyStoredPosition(root) {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (Number.isFinite(stored.left) && Number.isFinite(stored.top)) {
        const left = Math.min(Math.max(stored.left, 12), window.innerWidth - 84);
        const top = Math.min(Math.max(stored.top, 12), window.innerHeight - 84);
        root.style.left = `${left}px`;
        root.style.top = `${top}px`;
        root.style.right = 'auto';
        root.style.bottom = 'auto';
      }
    } catch (error) {
      return;
    }
  }

  function getContext() {
    const path = window.location.pathname.replace(/\/index\.html$/, '/');
    return pageContexts.find((item) => item.match.test(path)) || fallbackContext;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, '&#39;');
  }
}());
