import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/checkout-schema";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkAvailability, parseSlotValue } from "@/lib/calendar";
import { getSessionPricing, getPackage, isGroupPackage, isInstantBookableSubject, isInstantBookablePackage } from "@/lib/pricing-lookup";
import { getStripe } from "@/lib/stripe";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const subjectLabel: Record<string, string> = {
  maths: "Mathematics",
  science: "Science",
  "a-level-physics": "A-level Physics",
  "research-methods": "Research Methods",
};

export async function POST(req: Request) {
  // Throttle: 10 checkout attempts per IP per 10 minutes.
  const limit = rateLimit(`checkout:${getClientIp(req)}`, 10, 10 * 60 * 1000);
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

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Hard gate: only instantly-bookable items (Maths) may be paid through checkout.
  // Everything else is by request — confirmed and paid for via a separate arrangement after enquiry.
  const instant =
    data.itemType === "session"
      ? isInstantBookableSubject(data.subject)
      : (() => {
          const pkg = getPackage(data.packageId);
          return pkg ? isInstantBookablePackage(pkg) : false;
        })();
  if (!instant) {
    return NextResponse.json(
      { error: "This subject is available by request only. Please send an enquiry to confirm availability first." },
      { status: 403 }
    );
  }

  const turnstileOk = await verifyTurnstile(data.turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Captcha verification failed. Please try again." }, { status: 400 });
  }

  // Compute authoritative price + occurrences server-side
  let amountPence: number;
  let occurrences: number;
  let description: string;

  if (data.itemType === "session") {
    const pricing = getSessionPricing(data.subject, data.level, data.format);
    if (!pricing) {
      return NextResponse.json({ error: "Unknown subject/level/format combination" }, { status: 400 });
    }
    occurrences = data.quantity;
    amountPence = pricing.unitAmountPence * data.quantity;
    description = `${subjectLabel[data.subject] ?? data.subject} — ${data.level} — ${data.format} × ${data.quantity}`;
  } else {
    const pkg = getPackage(data.packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Unknown package" }, { status: 400 });
    }
    occurrences = pkg.occurrences;
    amountPence = isGroupPackage(pkg.id) ? pkg.amountPence * (data.groupSize ?? 0) : pkg.amountPence;
    description = `${pkg.name} (${pkg.structure})`;
  }

  if (!amountPence || amountPence <= 0) {
    return NextResponse.json({ error: "Could not determine a valid price for this booking" }, { status: 400 });
  }

  // Re-validate availability at the point of payment to close the race window
  const { day, time } = parseSlotValue(data.slot);
  const available = await checkAvailability(day, time, data.startDate, occurrences);
  if (!available) {
    return NextResponse.json({ error: "This slot is no longer available. Please choose another." }, { status: 409 });
  }

  // Use the configured site URL rather than the request's own Host header,
  // which is attacker-controllable when the route is called directly (not via the browser).
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
          unit_amount: amountPence,
        },
        quantity: 1,
      },
    ],
    customer_email: data.email,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
    metadata: {
      itemType: data.itemType,
      name: data.name,
      email: data.email,
      studentName: data.studentName?.trim() || data.name,
      slot: data.slot,
      startDate: data.startDate,
      occurrences: String(occurrences),
      groupSize: data.groupSize ? String(data.groupSize) : "",
      topicList: (data.topicList ?? "").slice(0, 500),
      description,
      ...(data.itemType === "session"
        ? { subject: data.subject, level: data.level, format: data.format, quantity: String(data.quantity) }
        : { packageId: data.packageId }),
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
