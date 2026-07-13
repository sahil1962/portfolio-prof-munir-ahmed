import { google } from "googleapis";
import { fromZonedTime } from "date-fns-tz";
import { saturdaySchedule, sundaySchedule } from "@/content/schedule";
import { tasterSlots, tasterSlotEndTime } from "@/content/taster";

const TIMEZONE = "Europe/London";

export type SlotDay = "saturday" | "sunday";

function getCalendarClient() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) return null;
  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(keyJson);
  } catch {
    console.error("GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON — calendar features disabled.");
    return null;
  }
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

// "sat-08:00" -> { day: "saturday", time: "08:00" }
export function parseSlotValue(slot: string): { day: SlotDay; time: string } {
  const [prefix, time] = slot.split("-");
  return { day: prefix === "sat" ? "saturday" : "sunday", time };
}

function findScheduleSlot(day: SlotDay, time: string) {
  const slots = day === "saturday" ? saturdaySchedule : sundaySchedule;
  const match = slots.find((s) => s.bookable && s.time.startsWith(time));
  if (!match) throw new Error(`Unknown bookable session slot: ${day} ${time}`);
  const [start, end] = match.time.split("–");
  return { start, end };
}

function firstOccurrenceDate(startDateISO: string, day: SlotDay): string {
  const targetDow = day === "saturday" ? 6 : 0;
  const d = new Date(`${startDateISO}T00:00:00Z`);
  while (d.getUTCDay() !== targetDow) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

type OccurrenceRange = { startUtc: Date; endUtc: Date };

export function buildOccurrenceRanges(
  day: SlotDay,
  time: string,
  startDateISO: string,
  occurrences: number
): OccurrenceRange[] {
  const { start, end } = findScheduleSlot(day, time);
  const firstDateStr = firstOccurrenceDate(startDateISO, day);
  const firstDate = new Date(`${firstDateStr}T00:00:00Z`);

  const ranges: OccurrenceRange[] = [];
  for (let i = 0; i < occurrences; i++) {
    const occurrenceDateStr = new Date(firstDate.getTime() + i * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    ranges.push({
      startUtc: fromZonedTime(`${occurrenceDateStr}T${start}:00`, TIMEZONE),
      endUtc: fromZonedTime(`${occurrenceDateStr}T${end}:00`, TIMEZONE),
    });
  }
  return ranges;
}

export async function checkAvailability(
  day: SlotDay,
  time: string,
  startDateISO: string,
  occurrences: number
): Promise<boolean> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendar || !calendarId) return true; // Dev bypass when not configured

  const ranges = buildOccurrenceRanges(day, time, startDateISO, occurrences);

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: ranges[0].startUtc.toISOString(),
      timeMax: ranges[ranges.length - 1].endUtc.toISOString(),
      items: [{ id: calendarId }],
    },
  });

  const busy = res.data.calendars?.[calendarId]?.busy ?? [];
  if (busy.length === 0) return true;

  return !ranges.some((range) =>
    busy.some((b) => {
      const busyStart = new Date(b.start!).getTime();
      const busyEnd = new Date(b.end!).getTime();
      return range.startUtc.getTime() < busyEnd && range.endUtc.getTime() > busyStart;
    })
  );
}

/** Bookable session start times (identical for Sat and Sun), e.g. "08:00". */
export const bookableTimes: string[] = saturdaySchedule
  .filter((s) => s.bookable)
  .map((s) => s.time.split("–")[0]);

/** Availability for every bookable time on a weekend day → { "08:00": true, "09:00": false, … }. */
export async function checkDayAvailability(
  day: SlotDay,
  startDateISO: string,
  occurrences: number
): Promise<Record<string, boolean>> {
  const perTime = bookableTimes.map((time) => ({
    time,
    ranges: buildOccurrenceRanges(day, time, startDateISO, occurrences),
  }));

  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendar || !calendarId) {
    return Object.fromEntries(bookableTimes.map((t) => [t, true])); // Dev bypass
  }

  // One freebusy query across the whole span, then test each time's occurrences against it.
  let min = Infinity;
  let max = -Infinity;
  for (const { ranges } of perTime) {
    min = Math.min(min, ranges[0].startUtc.getTime());
    max = Math.max(max, ranges[ranges.length - 1].endUtc.getTime());
  }
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: new Date(min).toISOString(),
      timeMax: new Date(max).toISOString(),
      items: [{ id: calendarId }],
    },
  });
  const busy = res.data.calendars?.[calendarId]?.busy ?? [];

  const out: Record<string, boolean> = {};
  for (const { time, ranges } of perTime) {
    out[time] = !ranges.some((r) =>
      busy.some((b) => {
        const bs = new Date(b.start!).getTime();
        const be = new Date(b.end!).getTime();
        return r.startUtc.getTime() < be && r.endUtc.getTime() > bs;
      })
    );
  }
  return out;
}

export async function blockRecurringSlot(opts: {
  day: SlotDay;
  time: string;
  startDateISO: string;
  occurrences: number;
  summary: string;
  description: string;
}): Promise<void> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendar || !calendarId) {
    console.warn("Google Calendar not configured — skipping slot block.");
    return;
  }

  const [first] = buildOccurrenceRanges(opts.day, opts.time, opts.startDateISO, opts.occurrences);

  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: opts.summary,
      description: opts.description,
      start: { dateTime: first.startUtc.toISOString(), timeZone: TIMEZONE },
      end: { dateTime: first.endUtc.toISOString(), timeZone: TIMEZONE },
      recurrence: [`RRULE:FREQ=WEEKLY;COUNT=${opts.occurrences}`],
    },
  });
}

// ── Initial Assessment & Taster Lesson — single one-off session ──────────────

function buildTasterRange(dateISO: string, time: string): OccurrenceRange {
  const end = tasterSlotEndTime(time);
  if (!end) throw new Error(`Unknown taster slot: ${time}`);
  return {
    startUtc: fromZonedTime(`${dateISO}T${time}:00`, TIMEZONE),
    endUtc: fromZonedTime(`${dateISO}T${end}:00`, TIMEZONE),
  };
}

/** Availability for each taster time on a specific date → { "17:30": true, "18:30": false }. */
export async function checkTasterAvailability(dateISO: string): Promise<Record<string, boolean>> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendar || !calendarId) {
    return Object.fromEntries(tasterSlots.map((s) => [s.value, true])); // dev bypass
  }

  const ranges = tasterSlots.map((s) => ({ time: s.value, range: buildTasterRange(dateISO, s.value) }));
  const min = Math.min(...ranges.map((r) => r.range.startUtc.getTime()));
  const max = Math.max(...ranges.map((r) => r.range.endUtc.getTime()));

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: new Date(min).toISOString(),
      timeMax: new Date(max).toISOString(),
      items: [{ id: calendarId }],
    },
  });
  const busy = res.data.calendars?.[calendarId]?.busy ?? [];

  const out: Record<string, boolean> = {};
  for (const { time, range } of ranges) {
    out[time] = !busy.some((b) => {
      const bs = new Date(b.start!).getTime();
      const be = new Date(b.end!).getTime();
      return range.startUtc.getTime() < be && range.endUtc.getTime() > bs;
    });
  }
  return out;
}

/** True if the given taster time is free on that date (server-side re-check at checkout). */
export async function checkTasterSlotFree(dateISO: string, time: string): Promise<boolean> {
  const avail = await checkTasterAvailability(dateISO);
  return avail[time] === true;
}

/** Has this email already booked a taster? (Enforces "once per student" — soft, fail-open.) */
export async function hasExistingTaster(email: string): Promise<boolean> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendar || !calendarId) return false; // dev bypass — can't check, allow

  try {
    const res = await calendar.events.list({
      calendarId,
      privateExtendedProperty: [`tasterEmail=${email.trim().toLowerCase()}`],
      maxResults: 1,
      showDeleted: false,
    });
    return (res.data.items?.length ?? 0) > 0;
  } catch (err) {
    // Don't hard-block a paying customer over a calendar API hiccup — Dr Ahmed catches repeats manually.
    console.error("Failed to check existing taster for", email, err);
    return false;
  }
}

/** Block a single taster session and tag it with the student's email for the once-per-student check. */
export async function blockTasterSlot(opts: {
  dateISO: string;
  time: string;
  summary: string;
  description: string;
  tasterEmail: string;
}): Promise<void> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendar || !calendarId) {
    console.warn("Google Calendar not configured — skipping taster block.");
    return;
  }

  const range = buildTasterRange(opts.dateISO, opts.time);
  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: opts.summary,
      description: opts.description,
      start: { dateTime: range.startUtc.toISOString(), timeZone: TIMEZONE },
      end: { dateTime: range.endUtc.toISOString(), timeZone: TIMEZONE },
      extendedProperties: { private: { tasterEmail: opts.tasterEmail.trim().toLowerCase() } },
    },
  });
}
