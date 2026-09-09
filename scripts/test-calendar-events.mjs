import assert from 'node:assert/strict';
import { loadUpcomingEvents, parseICalendar, selectUpcomingEvents } from '../js/calendar.js';

const fixture = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:expired
DTSTART:20260907T230000Z
DTEND:20260908T000000Z
SUMMARY:Expired event
END:VEVENT
BEGIN:VEVENT
UID:future-later
DTSTART;TZID=America/Chicago:20260910T190000
DTEND;TZID=America/Chicago:20260910T200000
SUMMARY:Future later
LOCATION:Pack Hall
DESCRIPTION:Details are available.
END:VEVENT
BEGIN:VEVENT
UID:ongoing
DTSTART;VALUE=DATE:20260901
DTEND;VALUE=DATE:20260912
SUMMARY:Ongoing fundraiser
END:VEVENT
BEGIN:VEVENT
UID:future-first
DTSTART:20260909T230000Z
DTEND:20260910T010000Z
SUMMARY:Future first
END:VEVENT
END:VCALENDAR`;

const parsed = parseICalendar(fixture);
const upcoming = selectUpcomingEvents(parsed, new Date('2026-09-08T18:00:00Z'));
assert.deepEqual(upcoming.map((event) => event.id), ['ongoing', 'future-first', 'future-later']);
assert.equal(upcoming[0].allDay, true);
assert.equal(upcoming[0].location, '');
assert.equal(upcoming[0].description, '');
assert.equal(upcoming.some((event) => event.id === 'expired'), false);

const timezoneFixture = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:dst
DTSTART;TZID=America/Chicago:20260308T013000
DTEND;TZID=America/Chicago:20260308T033000
SUMMARY:DST test
END:VEVENT
END:VCALENDAR`;
const [dstEvent] = parseICalendar(timezoneFixture);
assert.equal(dstEvent.start.toISOString(), '2026-03-08T07:30:00.000Z');
assert.equal(dstEvent.end.toISOString(), '2026-03-08T08:30:00.000Z');

const allDayFixture = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:all-day
DTSTART;VALUE=DATE:20261101
DTEND;VALUE=DATE:20261102
SUMMARY:All-day event
END:VEVENT
END:VCALENDAR`;
const [allDay] = parseICalendar(allDayFixture);
assert.equal(allDay.start.toISOString(), '2026-11-01T05:00:00.000Z');
assert.equal(allDay.end.toISOString(), '2026-11-02T06:00:00.000Z');

const unavailableMount = { dataset: {}, innerHTML: '' };
const unavailableEvents = await loadUpcomingEvents(unavailableMount, {
  fetchImpl: async () => ({ ok: false, status: 503 })
});
assert.deepEqual(unavailableEvents, []);
assert.match(unavailableMount.innerHTML, /calendar is temporarily unavailable/i);
assert.doesNotMatch(unavailableMount.innerHTML, /event-card/);

console.log('Calendar event tests passed: ordering, expiration, ongoing multi-day, America/Chicago DST, all-day, optional fields, and unavailable state.');
