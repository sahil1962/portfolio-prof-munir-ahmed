import { NextResponse } from "next/server";
import { tasterSchema } from "@/lib/taster-schema";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { checkTasterSlotFree, hasExistingTaster } from "@/lib/calendar";
import { TASTER_PRICE_PENCE, tasterSlotLabel } from "@/content/taster";
import { getStripe } from "@/lib/stripe";

const subjectLabel: Record<string, string> = {
  maths: "Mathematics",
  science: "Science",
  "a-level-physics": "A-level Physics",
  "research-methods": "Research Methods",
};

export async function POST(req: Request) {
  const limit = rateLimit(`taster:${getClientIp(req)}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = tasterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const turnstileOk = await verifyTurnstile(data.turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Captcha verification failed. Please try again." }, { status: 400 });
  }

  // Once per student: block if this email already has a taster booked.
  if (await hasExistingTaster(data.email)) {
    return NextResponse.json(
      {
        error:
          "Our records show you've already had an initial assessment. You can book a lesson package on the Book lessons page.",
        code: "TASTER_ALREADY_BOOKED",
      },
      { status: 409 }
    );
  }

  // Re-check the slot is still free at the point of payment (closes the race window).
  const free = await checkTasterSlotFree(data.startDate, data.slot);
  if (!free) {
    return NextResponse.json({ error: "That time is no longer available. Please choose another." }, { status: 409 });
  }

  const description = `Initial Assessment & Taster Lesson — ${subjectLabel[data.subject] ?? data.subject}`;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: { name: description },
          unit_amount: TASTER_PRICE_PENCE,
        },
        quantity: 1,
      },
    ],
    customer_email: data.email,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/taster`,
    metadata: {
      itemType: "taster",
      name: data.name,
      email: data.email,
      subject: data.subject,
      studentYear: data.studentYear,
      examBoard: data.examBoard ?? "",
      focus: data.focus.slice(0, 500),
      slot: data.slot,
      slotLabel: tasterSlotLabel(data.slot),
      startDate: data.startDate,
      description,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
