import { NextResponse } from "next/server";
import { checkTasterAvailability } from "@/lib/calendar";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Availability for the taster times on a specific weekend date → { times: { "17:30": true, "18:30": false } }.
export async function GET(req: Request) {
  const limit = rateLimit(`avail-taster:${getClientIp(req)}`, 60, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return NextResponse.json({ error: "Invalid or missing startDate" }, { status: 400 });
  }
  const dow = new Date(`${startDate}T00:00:00Z`).getUTCDay();
  if (dow !== 6 && dow !== 0) {
    return NextResponse.json({ error: "startDate must be a Saturday or Sunday" }, { status: 400 });
  }

  const times = await checkTasterAvailability(startDate);
  return NextResponse.json({ times });
}
