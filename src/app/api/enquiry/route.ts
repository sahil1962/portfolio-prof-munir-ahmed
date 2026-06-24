import { NextResponse } from "next/server";
import { enquirySchema, subjectLabels } from "@/lib/enquiry-schema";
import { getResend, FROM_EMAIL, TUTOR_EMAIL } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { render } from "react-email";
import TutorNotification from "@/components/emails/TutorNotification";
import EnquirerConfirmation from "@/components/emails/EnquirerConfirmation";
import React from "react";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Verify Turnstile
  const turnstileOk = await verifyTurnstile(data.turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Captcha verification failed. Please try again." }, { status: 400 });
  }

  // Render emails (default the student name to the booker's name when left blank)
  const emailData = { ...data, studentName: data.studentName?.trim() || data.name };
  const [tutorHtml, enquirerHtml] = await Promise.all([
    render(React.createElement(TutorNotification, { data: emailData })),
    render(React.createElement(EnquirerConfirmation, { data: emailData })),
  ]);

  const subjectLabel = subjectLabels[data.subject] ?? data.subject;

  const resend = getResend();

  // Send emails in parallel
  const [tutorResult, enquirerResult] = await Promise.allSettled([
    TUTOR_EMAIL
      ? resend.emails.send({
          from: FROM_EMAIL,
          to: TUTOR_EMAIL,
          replyTo: `${data.name} <${data.email}>`,
          subject: `New enquiry — ${subjectLabel} (${data.level}) — ${data.name}`,
          html: tutorHtml,
        })
      : Promise.resolve({ data: null, error: null }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: "We've received your enquiry — Dr Munir Ahmed Tuition",
      html: enquirerHtml,
    }),
  ]);

  // A Resend send "fails" if the promise rejected OR it resolved with an { error } payload
  // (the SDK returns auth/validation errors as a resolved { error }, not a throw).
  const sendFailed = (r: PromiseSettledResult<unknown>): boolean =>
    r.status === "rejected" || !!(r.value as { error?: unknown }).error;
  const failureReason = (r: PromiseSettledResult<unknown>): unknown =>
    r.status === "rejected" ? r.reason : (r.value as { error?: unknown }).error;

  const tutorFailed = !!TUTOR_EMAIL && sendFailed(tutorResult);
  if (tutorFailed) console.error("Tutor notification failed:", failureReason(tutorResult));
  if (sendFailed(enquirerResult)) console.error("Enquirer confirmation failed:", failureReason(enquirerResult));

  // The enquiry only counts as received if Dr Ahmed was actually notified.
  // The enquirer's confirmation email is best-effort — a failure there is logged, not fatal.
  if (tutorFailed) {
    return NextResponse.json(
      { error: "We couldn't submit your enquiry right now. Please try again, or email us directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
