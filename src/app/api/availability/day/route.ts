import { NextResponse } from "next/server";
import { checkDayAvailability, type SlotDay } from "@/lib/calendar";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Availability for all bookable times on the weekend date in `startDate`.
// Returns { times: { "08:00": true, "09:00": false, … } }.
export async function GET(req: Request) {
  // Throttle: 60 day-availability checks per IP per minute.
  const limit = rateLimit(`avail-day:${getClientIp(req)}`, 60, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const occurrencesRaw = searchParams.get("occurrences");

  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return NextResponse.json({ error: "Invalid or missing startDate" }, { status: 400 });
  }
  const occurrences = parseInt(occurrencesRaw ?? "1", 10);
  if (!Number.isInteger(occurrences) || occurrences < 1 || occurrences > 52) {
    return NextResponse.json({ error: "Invalid occurrences" }, { status: 400 });
  }

  const dow = new Date(`${startDate}T00:00:00Z`).getUTCDay();
  if (dow !== 6 && dow !== 0) {
    return NextResponse.json({ error: "startDate must be a Saturday or Sunday" }, { status: 400 });
  }
  const day: SlotDay = dow === 6 ? "saturday" : "sunday";

  const times = await checkDayAvailability(day, startDate, occurrences);
  return NextResponse.json({ times });
}
