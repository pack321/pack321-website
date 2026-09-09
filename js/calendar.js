const CALENDAR_TIME_ZONE = 'America/Chicago';
const DEFAULT_EVENTS_ENDPOINT = '/api/calendar-events';

function unfoldICalendar(value) {
  return String(value || '').replace(/\r?\n[ \t]/g, '');
}

function decodeICalendarText(value) {
  return String(value || '')
    .replace(/\\[nN]/g, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function zonedDateTimeToUtc(parts, timeZone) {
  let instant = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23'
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = Object.fromEntries(formatter.formatToParts(new Date(instant))
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]));
    const represented = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    const desired = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const adjustment = desired - represented;
    instant += adjustment;
    if (!adjustment) break;
  }
  return new Date(instant);
}

function parseDateProperty(property, fallbackTimeZone = CALENDAR_TIME_ZONE) {
  if (!property?.value) return null;
  const value = property.value.trim();
  const allDay = property.params.VALUE === 'DATE' || /^\d{8}$/.test(value);
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?(Z)?$/);
  if (!match) return null;

  const parts = {
    year: Number(match[1]), month: Number(match[2]), day: Number(match[3]),
    hour: Number(match[4] || 0), minute: Number(match[5] || 0), second: Number(match[6] || 0)
  };
  const date = match[7]
    ? new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second))
    : zonedDateTimeToUtc(parts, property.params.TZID || fallbackTimeZone);
  return Number.isNaN(date.getTime()) ? null : { date, allDay };
}

function parseProperty(line) {
  const colon = line.indexOf(':');
  if (colon < 0) return null;
  const [name, ...parameterParts] = line.slice(0, colon).split(';');
  const params = {};
  parameterParts.forEach((part) => {
    const separator = part.indexOf('=');
    if (separator > 0) params[part.slice(0, separator).toUpperCase()] = part.slice(separator + 1).replace(/^"|"$/g, '');
  });
  return { name: name.toUpperCase(), params, value: line.slice(colon + 1) };
}

export function parseICalendar(ics, { timeZone = CALENDAR_TIME_ZONE } = {}) {
  const lines = unfoldICalendar(ics).split(/\r?\n/);
  const events = [];
  let current = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current && current.STATUS?.value !== 'CANCELLED') {
        const start = parseDateProperty(current.DTSTART, timeZone);
        const parsedEnd = parseDateProperty(current.DTEND, timeZone);
        if (start) {
          const defaultDuration = start.allDay ? 86400000 : 3600000;
          events.push({
            id: current.UID?.value || `${start.date.toISOString()}-${current.SUMMARY?.value || ''}`,
            title: decodeICalendarText(current.SUMMARY?.value) || 'Pack 321 Event',
            description: decodeICalendarText(current.DESCRIPTION?.value),
            location: decodeICalendarText(current.LOCATION?.value),
            start: start.date,
            end: parsedEnd?.date || new Date(start.date.getTime() + defaultDuration),
            allDay: start.allDay
          });
        }
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const property = parseProperty(line);
    if (property && !current[property.name]) current[property.name] = property;
  }
  return events;
}

export function selectUpcomingEvents(events, now = new Date(), limit = 3) {
  const nowTime = now.getTime();
  return events
    .filter((event) => event.start instanceof Date && event.end instanceof Date && event.end.getTime() > nowTime)
    .sort((left, right) => left.start - right.start || left.end - right.end || left.title.localeCompare(right.title))
    .slice(0, limit);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function shortDescription(value) {
  if (!value) return '';
  return value.length > 180 ? `${value.slice(0, 177).trimEnd()}…` : value;
}

function iconForEvent(event) {
  const text = `${event.title} ${event.description}`.toLowerCase();
  if (text.includes('visit') || text.includes('new famil')) return 'visitMeeting';
  if (text.includes('meeting') || text.includes('gathering')) return 'packMeeting';
  return 'calendar';
}

function formatEvent(event, timeZone) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', month: 'short', day: 'numeric' });
  const timeFormatter = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' });
  const date = dateFormatter.format(event.start);
  if (event.allDay) {
    const inclusiveEnd = new Date(event.end.getTime() - 1);
    const multiDay = dateFormatter.format(inclusiveEnd) !== date;
    return { date, time: multiDay ? `All day · Through ${dateFormatter.format(inclusiveEnd)}` : 'All day' };
  }
  const sameDay = dateFormatter.format(event.end) === date;
  return {
    date,
    time: sameDay
      ? `${timeFormatter.format(event.start)}–${timeFormatter.format(event.end)}`
      : `${timeFormatter.format(event.start)}–${dateFormatter.format(event.end)}, ${timeFormatter.format(event.end)}`
  };
}

function renderCard(event, mount) {
  const formatted = formatEvent(event, mount.dataset.timeZone || CALENDAR_TIME_ZONE);
  const meta = [formatted.time, event.location].filter(Boolean)
    .map((item) => `<span>${escapeHtml(item)}</span>`).join('');
  const description = shortDescription(event.description);
  const body = `<span class="event-card-icon" data-card-icon="${iconForEvent(event)}" aria-hidden="true"></span>` +
    `<strong>${escapeHtml(formatted.date)}</strong><h3>${escapeHtml(event.title)}</h3>` +
    `<div class="event-meta">${meta}</div>${description ? `<p>${escapeHtml(description)}</p>` : ''}`;
  return mount.dataset.cardLink
    ? `<a class="event-card upcoming-card" href="${escapeHtml(mount.dataset.cardLink)}">${body}</a>`
    : `<article class="event-card">${body}</article>`;
}

export async function loadUpcomingEvents(mount, { fetchImpl = fetch, now = new Date() } = {}) {
  try {
    const response = await fetchImpl(mount.dataset.eventsSrc || DEFAULT_EVENTS_ENDPOINT, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Calendar request failed (${response.status})`);
    const events = selectUpcomingEvents(parseICalendar(await response.text(), {
      timeZone: mount.dataset.timeZone || CALENDAR_TIME_ZONE
    }), now);
    mount.innerHTML = events.length
      ? events.map((event) => renderCard(event, mount)).join('')
      : '<p class="event-status" role="status">No upcoming events are currently listed. Please check the full calendar for updates.</p>';
    if (window.Pack321Icons) window.Pack321Icons.hydrate(mount);
    return events;
  } catch (error) {
    mount.innerHTML = '<p class="event-status event-status--error" role="alert">Pack 321’s calendar is temporarily unavailable. Please try again later.</p>';
    return [];
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-upcoming-events]').forEach((mount) => loadUpcomingEvents(mount));
  });
}
