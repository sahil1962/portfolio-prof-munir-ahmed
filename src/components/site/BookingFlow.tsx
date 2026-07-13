"use client";

import { useState } from "react";
import { CreditCard, MessageSquare } from "lucide-react";
import CheckoutForm from "./CheckoutForm";
import BookingForm from "./BookingForm";
import { getPackage, isInstantBookablePackage, isInstantBookableSubject } from "@/lib/pricing-lookup";

type Mode = "pay" | "enquiry";

interface BookingFlowProps {
  defaultValues?: {
    subject?: string;
    format?: string;
    package?: string;
    packageId?: string;
    itemType?: string;
    intent?: string;
    day?: string;
    time?: string;
  };
}

export default function BookingFlow({ defaultValues = {} }: BookingFlowProps) {
  const packageId = defaultValues.packageId ?? defaultValues.package;
  const subjectParam = defaultValues.subject;

  // Is the requested thing instantly bookable (Maths)? Packages follow the same rule.
  const instant = packageId
    ? (() => {
        const pkg = getPackage(packageId);
        return pkg ? isInstantBookablePackage(pkg) : true;
      })()
    : isInstantBookableSubject(subjectParam ?? "maths");

  const initialMode: Mode =
    defaultValues.intent === "enquire"
      ? "enquiry"
      : defaultValues.intent === "pay"
        ? "pay"
        : instant
          ? "pay"
          : "enquiry";

  const [mode, setMode] = useState<Mode>(initialMode);
  // Carry the chosen subject across a pay -> enquiry handoff so it stays prefilled.
  const [carrySubject, setCarrySubject] = useState<string | undefined>(subjectParam);

  const tabBase =
    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg";

  return (
    <div>
      <div role="tablist" aria-label="How would you like to book?" className="mb-8 inline-flex rounded-lg border border-brand-border bg-surface-2 p-1">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "pay"}
          onClick={() => setMode("pay")}
          className={`${tabBase} ${mode === "pay" ? "bg-primary text-white" : "text-ink-muted hover:text-ink"}`}
        >
          <CreditCard size={16} />
          Book &amp; pay
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "enquiry"}
          onClick={() => setMode("enquiry")}
          className={`${tabBase} ${mode === "enquiry" ? "bg-primary text-white" : "text-ink-muted hover:text-ink"}`}
        >
          <MessageSquare size={16} />
          Ask a question
        </button>
      </div>

      <p className="mb-8 text-sm text-ink-muted">
        {mode === "pay"
          ? "Choose your session or package, pick a weekly slot, and pay securely online. Maths can be booked instantly; other subjects need email confirmation first."
          : "Send a quick enquiry and Professor Dr Munir Ahmed will confirm availability — no payment yet. Best for Science, A-level Physics and Research Methods, or any question before booking."}
      </p>

      {mode === "pay" ? (
        <CheckoutForm
          defaultValues={{ itemType: defaultValues.itemType, subject: carrySubject, packageId }}
          onEnquireInstead={(subject) => {
            if (subject) setCarrySubject(subject);
            setMode("enquiry");
          }}
        />
      ) : (
        <BookingForm
          defaultValues={{
            subject: carrySubject,
            format: defaultValues.format,
            package: packageId,
            day: defaultValues.day,
            time: defaultValues.time,
          }}
        />
      )}
    </div>
  );
}
