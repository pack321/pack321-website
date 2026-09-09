const CALENDAR_ICS_URL = 'https://calendar.google.com/calendar/ical/wicubscoutpack321%40gmail.com/public/basic.ics';

export async function onRequestGet() {
  try {
    const response = await fetch(CALENDAR_ICS_URL, {
      headers: { Accept: 'text/calendar' },
      cf: { cacheEverything: true, cacheTtl: 300 }
    });
    const calendar = await response.text();
    if (!response.ok || !calendar.includes('BEGIN:VCALENDAR')) {
      throw new Error(`Google Calendar returned ${response.status}`);
    }
    return new Response(calendar, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=300',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    return new Response('Calendar temporarily unavailable.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }
}
