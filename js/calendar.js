document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('upcoming-events');
  if (!mount) return;

  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const escapeHtml = (value) => String(value || '').replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[char]));

  const parseEventDate = (event) => {
    const dateText = event.date || event.start || '';
    const timeText = event.time || '';
    const date = new Date(timeText ? dateText + ' ' + timeText : dateText + 'T00:00:00');
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const iconForEvent = (event) => {
    const title = (event.title || '').toLowerCase();
    const text = `${title} ${event.description || ''}`.toLowerCase();
    if (title.includes('visit')) return 'user-round-plus';
    if (title.includes('meeting') || text.includes('gathering')) return 'users-round';
    if (text.includes('visit') || text.includes('new famil')) return 'user-round-plus';
    return 'calendar-days';
  };

  const card = (event, date) => {
    const location = event.location ? '<span>' + escapeHtml(event.location) + '</span>' : '';
    const time = event.time ? '<span>' + escapeHtml(event.time) + '</span>' : '';
    const icon = iconForEvent(event);
    return '<article class="event-card">' +
      '<span class="event-card-icon" data-card-icon="' + escapeHtml(icon) + '" aria-hidden="true"></span>' +
      '<strong>' + escapeHtml(formatter.format(date)) + '</strong>' +
      '<h3>' + escapeHtml(event.title || 'Pack Event') + '</h3>' +
      '<div class="event-meta">' + time + location + '</div>' +
      '<p>' + escapeHtml(event.description || 'See the full calendar for details.') + '</p>' +
    '</article>';
  };

  fetch(mount.dataset.eventsSrc || 'assets/data/events.json', { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error('Events file unavailable')))
    .then((events) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcoming = events
        .map((event) => ({ event, date: parseEventDate(event) }))
        .filter((item) => item.date && item.date >= today)
        .sort((a, b) => a.date - b.date)
        .slice(0, 3);

      if (!upcoming.length) {
        return;
      }

      mount.innerHTML = upcoming.map((item) => card(item.event, item.date)).join('');
      if (window.Pack321Icons) window.Pack321Icons.hydrate(mount);
    })
    .catch(() => {
      // Keep the built-in fallback cards visible when local file preview blocks JSON loading.
    });
});
