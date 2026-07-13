import type { SlotDay } from "@/lib/calendar";

const ZOOM_DAY_NUMBER: Record<SlotDay, number> = { sunday: 1, saturday: 7 };

async function getZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Zoom credentials not configured");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${basicAuth}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Zoom token request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function createRecurringMeeting(opts: {
  topic: string;
  day: SlotDay;
  time: string; // "08:00"
  startDateISO: string;
  occurrences: number;
}): Promise<{ joinUrl: string; meetingId: number }> {
  const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
  if (!zoomAccountId) {
    // Dev bypass when Zoom is not configured
    return { joinUrl: "https://zoom.us/j/placeholder", meetingId: 0 };
  }

  const accessToken = await getZoomAccessToken();

  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: opts.topic,
      type: 8, // recurring meeting with fixed time
      start_time: `${opts.startDateISO}T${opts.time}:00`,
      timezone: "Europe/London",
      duration: 60,
      recurrence: {
        type: 2, // weekly
        repeat_interval: 1,
        weekly_days: String(ZOOM_DAY_NUMBER[opts.day]),
        end_times: opts.occurrences,
      },
      settings: {
        join_before_host: true,
        waiting_room: false,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Zoom meeting creation failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return { joinUrl: data.join_url as string, meetingId: data.id as number };
}

/** A single, non-recurring scheduled meeting (used for the one-off taster session). */
export async function createSingleMeeting(opts: {
  topic: string;
  startDateISO: string;
  time: string; // "17:30"
  durationMinutes?: number;
}): Promise<{ joinUrl: string; meetingId: number }> {
  const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
  if (!zoomAccountId) {
    return { joinUrl: "https://zoom.us/j/placeholder", meetingId: 0 };
  }

  const accessToken = await getZoomAccessToken();

  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: opts.topic,
      type: 2, // scheduled meeting (one-off)
      start_time: `${opts.startDateISO}T${opts.time}:00`,
      timezone: "Europe/London",
      duration: opts.durationMinutes ?? 60,
      settings: {
        join_before_host: true,
        waiting_room: false,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Zoom meeting creation failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return { joinUrl: data.join_url as string, meetingId: data.id as number };
}
