import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { blockRecurringSlot, parseSlotValue } from "@/lib/calendar";
import { createRecurringMeeting } from "@/lib/zoom";
import { getResend, FROM_EMAIL, TUTOR_EMAIL } from "@/lib/email";
import { cancellationPolicy } from "@/content/copy";
import { sessionTimes } from "@/lib/enquiry-schema";
import { render } from "react-email";
import BookingConfirmation from "@/components/emails/BookingConfirmation";
import TutorBookingNotification from "@/components/emails/TutorBookingNotification";
import React from "react";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await req.text();

  let event: Stripe.Event;
  const stripe = getStripe();

  if (webhookSecret) {
    // Secret configured → a valid signature is REQUIRED. Never trust an unsigned body.
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // No secret → only tolerate the unsigned path in local dev, never in production.
    if (process.env.NODE_ENV === "production") {
      console.error("STRIPE_WEBHOOK_SECRET is not set — refusing to process webhook in production.");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }
    event = JSON.parse(rawBody) as Stripe.Event;
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const m = session.metadata ?? {};

  const slot = m.slot;
  const startDate = m.startDate;
  const occurrences = parseInt(m.occurrences ?? "0", 10);

  if (!slot || !startDate || !occurrences) {
    console.error("Stripe webhook: missing booking metadata on session", session.id);
    return NextResponse.json({ received: true });
  }

  const { day, time } = parseSlotValue(slot);
  const slotLabel = sessionTimes.find((s) => s.value === slot)?.label ?? slot;

  let joinUrl = "https://zoom.us/j/placeholder";
  try {
    const meeting = await createRecurringMeeting({
      topic: m.description || "Tuition session",
      day,
      time,
      startDateISO: startDate,
      occurrences,
    });
    joinUrl = meeting.joinUrl;
  } catch (err) {
    console.error("Failed to create Zoom meeting for session", session.id, err);
  }

  try {
    await blockRecurringSlot({
      day,
      time,
      startDateISO: startDate,
      occurrences,
      summary: `${m.description ?? "Tuition session"} — ${m.studentName ?? ""}`,
      description: `Booked by ${m.name} (${m.email}). Student: ${m.studentName}. Zoom: ${joinUrl}${m.topicList ? `\nTopics: ${m.topicList}` : ""}`,
    });
  } catch (err) {
    console.error("Failed to block recurring calendar slot for session", session.id, err);
  }

  const emailData = {
    name: m.name ?? "",
    studentName: m.studentName ?? "",
    description: m.description ?? "",
    slotLabel,
    startDate,
    occurrences,
    joinUrl,
    groupSize: m.groupSize || undefined,
    cancellationPolicy,
  };

  try {
    const resend = getResend();
    const [enquirerHtml, tutorHtml] = await Promise.all([
      render(React.createElement(BookingConfirmation, { data: emailData })),
      render(React.createElement(TutorBookingNotification, { data: { ...emailData, email: m.email ?? "", topicList: m.topicList } })),
    ]);

    await Promise.allSettled([
      resend.emails.send({
        from: FROM_EMAIL,
        to: m.email,
        subject: "Your booking is confirmed — Dr Munir Ahmed Tuition",
        html: enquirerHtml,
      }),
      TUTOR_EMAIL
        ? resend.emails.send({
            from: FROM_EMAIL,
            to: TUTOR_EMAIL,
            replyTo: m.email ? `${m.name ?? ""} <${m.email}>`.trim() : undefined,
            subject: `New paid booking — ${m.description ?? ""} — ${m.name ?? ""}`,
            html: tutorHtml,
          })
        : Promise.resolve(),
    ]);
  } catch (err) {
    console.error("Failed to send booking confirmation emails for session", session.id, err);
  }

  return NextResponse.json({ received: true });
}
