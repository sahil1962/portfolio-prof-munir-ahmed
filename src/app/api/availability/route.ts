import { NextResponse } from "next/server";
import { checkAvailability, parseSlotValue, type SlotDay } from "@/lib/calendar";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  // Throttle: 60 availability checks per IP per minute (the slot picker is chatty).
  const limit = rateLimit(`avail:${getClientIp(req)}`, 60, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const slot = searchParams.get("slot");
  const startDate = searchParams.get("startDate");
  const occurrencesRaw = searchParams.get("occurrences");

  if (!slot || !startDate || !occurrencesRaw) {
    return NextResponse.json({ error: "Missing slot, startDate, or occurrences" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return NextResponse.json({ error: "Invalid startDate" }, { status: 400 });
  }
  const occurrences = parseInt(occurrencesRaw, 10);
  if (!Number.isInteger(occurrences) || occurrences < 1 || occurrences > 52) {
    return NextResponse.json({ error: "Invalid occurrences" }, { status: 400 });
  }

  let day: SlotDay, time: string;
  try {
    ({ day, time } = parseSlotValue(slot));
  } catch {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  const available = await checkAvailability(day, time, startDate, occurrences);
  return NextResponse.json({ available });
}
