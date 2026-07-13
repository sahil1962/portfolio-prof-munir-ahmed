import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/checkout-schema";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkLessonsAvailable } from "@/lib/calendar";
import { getSessionPricing, getPackage, getLessonBounds, isGroupFormat, isGroupPackage, isInstantBookableSubject, isInstantBookablePackage } from "@/lib/pricing-lookup";
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

  // Enforce the lesson-count bounds server-side (client can't relax them).
  const bounds = getLessonBounds({
    itemType: data.itemType,
    format: data.itemType === "session" ? data.format : undefined,
    packageId: data.itemType === "package" ? data.packageId : undefined,
  });
  const count = data.lessons.length;
  if (count < bounds.min || count > bounds.max) {
    return NextResponse.json({ error: `Please choose between ${bounds.min} and ${bounds.max} lessons.` }, { status: 400 });
  }

  // Compute the authoritative price server-side.
  let amountPence: number;
  let description: string;

  if (data.itemType === "session") {
    const pricing = getSessionPricing(data.subject, data.level, data.format);
    if (!pricing) {
      return NextResponse.json({ error: "Unknown subject/level/format combination" }, { status: 400 });
    }
    // Group fees are per student, and one member pays for the whole group → rate × lessons × group size.
    const isGroup = isGroupFormat(data.format);
    if (isGroup && !data.groupSize) {
      return NextResponse.json({ error: "Group size is required for group tuition" }, { status: 400 });
    }
    const students = isGroup ? data.groupSize! : 1;
    amountPence = pricing.unitAmountPence * count * students;
    description = `${subjectLabel[data.subject] ?? data.subject} — ${data.level} — ${data.format} × ${count} lesson${count > 1 ? "s" : ""}${
      students > 1 ? ` (group of ${students})` : ""
    }`;
  } else {
    const pkg = getPackage(data.packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Unknown package" }, { status: 400 });
    }
    amountPence = isGroupPackage(pkg.id) ? pkg.amountPence * (data.groupSize ?? 0) : pkg.amountPence;
    description = `${pkg.name} (${pkg.structure})`;
  }

  if (!amountPence || amountPence <= 0) {
    return NextResponse.json({ error: "Could not determine a valid price for this booking" }, { status: 400 });
  }

  // Re-validate every lesson is still free at the point of payment (closes the race window).
  const { allFree, taken } = await checkLessonsAvailable(data.lessons);
  if (!allFree) {
    const list = taken.map((l) => `${l.date} ${l.time}`).join(", ");
    return NextResponse.json(
      { error: `Some lessons are no longer available (${list}). Please pick different times.`, taken },
      { status: 409 }
    );
  }

  // Use the configured site URL rather than the request's own Host header.
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const stripe = getStripe();

  // Compact list of lessons for the webhook (well under Stripe's 500-char metadata limit for ≤10 lessons).
  const lessonsMeta = data.lessons.map((l) => `${l.date} ${l.time}`).join(", ");

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
    cancel_url: `${origin}/book`,
    metadata: {
      itemType: data.itemType,
      name: data.name,
      email: data.email,
      studentName: data.studentName?.trim() || data.name,
      lessons: lessonsMeta,
      groupSize: data.groupSize ? String(data.groupSize) : "",
      topicList: (data.topicList ?? "").slice(0, 500),
      description,
      ...(data.itemType === "session"
        ? { subject: data.subject, level: data.level, format: data.format }
        : { packageId: data.packageId }),
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
