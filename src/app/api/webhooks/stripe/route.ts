import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { blockLessons, blockTasterSlot } from "@/lib/calendar";
import { createReusableMeeting, createSingleMeeting } from "@/lib/zoom";
import { getResend, FROM_EMAIL, TUTOR_EMAIL } from "@/lib/email";
import { cancellationPolicy } from "@/content/copy";
import { subjectLabels } from "@/lib/enquiry-schema";
import { render } from "react-email";
import BookingConfirmation from "@/components/emails/BookingConfirmation";
import TutorBookingNotification from "@/components/emails/TutorBookingNotification";
import TasterConfirmation from "@/components/emails/TasterConfirmation";
import TasterTutorNotification from "@/components/emails/TasterTutorNotification";
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

  // ── Initial Assessment & Taster Lesson — single one-off session ──
  if (m.itemType === "taster") {
    const tSlot = m.slot;
    const tStartDate = m.startDate;
    if (!tSlot || !tStartDate) {
      console.error("Stripe webhook: missing taster metadata on session", session.id);
      return NextResponse.json({ received: true });
    }
    const subjectLabel = subjectLabels[m.subject ?? ""] ?? m.subject ?? "";
    const slotLabel = m.slotLabel ?? tSlot;

    let joinUrl = "https://zoom.us/j/placeholder";
    try {
      const meeting = await createSingleMeeting({
        topic: m.description || "Initial Assessment & Taster Lesson",
        startDateISO: tStartDate,
        time: tSlot,
        durationMinutes: 60,
      });
      joinUrl = meeting.joinUrl;
    } catch (err) {
      console.error("Failed to create Zoom meeting for taster", session.id, err);
    }

    try {
      await blockTasterSlot({
        dateISO: tStartDate,
        time: tSlot,
        summary: `Taster — ${m.name ?? ""} (${subjectLabel})`,
        description: `Initial Assessment & Taster Lesson. Booked by ${m.name} (${m.email}). Subject: ${subjectLabel}. Year/level: ${m.studentYear ?? ""}. Exam board: ${m.examBoard || "—"}. Focus: ${m.focus ?? ""}. Zoom: ${joinUrl}`,
        tasterEmail: m.email ?? "",
      });
    } catch (err) {
      console.error("Failed to block taster calendar slot", session.id, err);
    }

    try {
      const resend = getResend();
      const [studentHtml, tutorHtml] = await Promise.all([
        render(React.createElement(TasterConfirmation, {
          data: { name: m.name ?? "", subjectLabel, slotLabel, startDate: tStartDate, joinUrl, cancellationPolicy },
        })),
        render(React.createElement(TasterTutorNotification, {
          data: { name: m.name ?? "", email: m.email ?? "", subjectLabel, studentYear: m.studentYear ?? "", examBoard: m.examBoard || undefined, focus: m.focus ?? "", slotLabel, startDate: tStartDate, joinUrl },
        })),
      ]);
      await Promise.allSettled([
        resend.emails.send({
          from: FROM_EMAIL,
          to: m.email,
          subject: "Your Initial Assessment & Taster Lesson is confirmed — Professor Dr Munir Ahmed Tuition",
          html: studentHtml,
        }),
        TUTOR_EMAIL
          ? resend.emails.send({
              from: FROM_EMAIL,
              to: TUTOR_EMAIL,
              replyTo: m.email ? `${m.name ?? ""} <${m.email}>`.trim() : undefined,
              subject: `New taster booking — ${m.name ?? ""}`,
              html: tutorHtml,
            })
          : Promise.resolve(),
      ]);
    } catch (err) {
      console.error("Failed to send taster confirmation emails", session.id, err);
    }

    return NextResponse.json({ received: true });
  }

  // Regular booking — a set of individually-dated lessons ("2026-07-18 08:00, 2026-07-25 09:00, …").
  const lessons = (m.lessons ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [date, time] = s.split(" ");
      return { date, time };
    })
    .filter((l) => l.date && l.time);

  if (lessons.length === 0) {
    console.error("Stripe webhook: missing lessons metadata on session", session.id);
    return NextResponse.json({ received: true });
  }

  let joinUrl = "https://zoom.us/j/placeholder";
  try {
    const meeting = await createReusableMeeting(m.description || "Tuition lessons");
    joinUrl = meeting.joinUrl;
  } catch (err) {
    console.error("Failed to create Zoom meeting for session", session.id, err);
  }

  try {
    await blockLessons(lessons, {
      summary: `${m.description ?? "Tuition"} — ${m.studentName ?? ""}`,
      description: `Booked by ${m.name} (${m.email}). Student: ${m.studentName}. Zoom: ${joinUrl}${m.topicList ? `\nTopics: ${m.topicList}` : ""}`,
    });
  } catch (err) {
    console.error("Failed to block lessons for session", session.id, err);
  }

  const emailData = {
    name: m.name ?? "",
    studentName: m.studentName ?? "",
    description: m.description ?? "",
    lessons,
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
        subject: "Your booking is confirmed — Professor Dr Munir Ahmed Tuition",
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
