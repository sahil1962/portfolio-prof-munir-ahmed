"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, Controller, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/lib/checkout-schema";
import { sessionTimes } from "@/lib/enquiry-schema";
import {
  getPricingRowsForSubject,
  getSessionPricing,
  getPackage,
  isGroupFormat,
  isGroupPackage,
  isInstantBookableSubject,
  isInstantBookablePackage,
} from "@/lib/pricing-lookup";
import { packages } from "@/content/packages";
import { cancellationPolicy } from "@/content/copy";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format as formatDate } from "date-fns";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, Mail } from "lucide-react";

interface CheckoutFormProps {
  defaultValues?: {
    itemType?: string;
    subject?: string;
    packageId?: string;
  };
  /** When provided, the "by request" banner switches the page to enquiry mode instead of linking away. */
  onEnquireInstead?: (subject?: string) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
    };
  }
}

const TIME_SLOTS = sessionTimes.filter((s) => s.value.startsWith("sat-")).map((s) => s.value.slice(4));
const MORNING = TIME_SLOTS.slice(0, 4);
const AFTERNOON = TIME_SLOTS.slice(4);

// Pricing levels embed the subject (e.g. "KS3 Maths"); the subject is already chosen,
// so strip it for a cleaner label while keeping the full value for the price lookup.
const SUBJECT_WORD: Record<string, string> = {
  maths: "Maths",
  science: "Science",
  "a-level-physics": "Physics",
  "research-methods": "Research Methods",
};
function cleanLevelLabel(level: string, subject?: string): string {
  const word = subject ? SUBJECT_WORD[subject] : undefined;
  if (!word) return level;
  return level.replace(word, "").replace(/\s+/g, " ").trim() || level;
}

export default function CheckoutForm({ defaultValues, onEnquireInstead }: CheckoutFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(null);
  const [dayAvail, setDayAvail] = useState<Record<string, boolean> | null>(null);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const defaultItemType = defaultValues?.packageId ? "package" : "session";
  const validSubjects = ["maths", "science", "a-level-physics", "research-methods"] as const;
  const defaultSubject = validSubjects.find((s) => s === defaultValues?.subject) ?? "maths";

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors: rawErrors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      itemType: defaultItemType,
      subject: defaultSubject,
      level: "",
      format: "",
      quantity: 1,
      packageId: defaultValues?.packageId ?? "",
      slot: "",
      startDate: "",
      cancellationAck: undefined as unknown as true,
      turnstileToken: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? "" : "dev-bypass",
    } as DefaultValues<CheckoutInput>,
  });

  const errors = rawErrors as Record<string, { message?: string } | undefined>;

  const itemType = watch("itemType");
  const subject = itemType === "session" ? watch("subject") : undefined;
  const level = itemType === "session" ? watch("level") : undefined;
  const format = itemType === "session" ? watch("format") : undefined;
  const quantity = itemType === "session" ? watch("quantity") : undefined;
  const packageId = itemType === "package" ? watch("packageId") : undefined;
  const slot = watch("slot");
  const startDate = watch("startDate");
  const groupSize = watch("groupSize");

  const isGroup =
    (itemType === "session" && format ? isGroupFormat(format) : false) ||
    (itemType === "package" && packageId ? isGroupPackage(packageId) : false);

  const selectedTime = slot ? slot.split("-")[1] : "";
  const occurrences = useMemo(() => {
    if (itemType === "package") return getPackage(packageId ?? "")?.occurrences ?? 10;
    return quantity ?? 1;
  }, [itemType, packageId, quantity]);
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const dayDisabled = useMemo(
    () => (date: Date) => date < today || (date.getDay() !== 0 && date.getDay() !== 6),
    [today],
  );
  const formattedDate = startDate ? formatDate(new Date(`${startDate}T00:00:00`), "EEE d MMMM yyyy") : "";

  // Reset level/format when subject changes
  useEffect(() => {
    if (itemType === "session") {
      setValue("level", "");
      setValue("format", "");
    }
  }, [subject, itemType, setValue]);

  // Load availability for every time on the chosen date (one batched calendar query).
  useEffect(() => {
    if (!startDate) { setDayAvail(null); return; }
    setLoadingTimes(true);
    const controller = new AbortController();
    fetch(`/api/availability/day?startDate=${startDate}&occurrences=${occurrences}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setDayAvail(data.times ?? null))
      .catch((err) => { if (err.name !== "AbortError") setDayAvail(null); })
      .finally(() => setLoadingTimes(false));
    return () => controller.abort();
  }, [startDate, occurrences]);

  // Clear the chosen time if it's no longer available (e.g. the lesson count changed).
  useEffect(() => {
    if (selectedTime && dayAvail && dayAvail[selectedTime] === false) setValue("slot", "");
  }, [selectedTime, dayAvail, setValue]);

  // Turnstile — load the widget script client-side only. Rendering next/script in
  // the JSX tree shifts SSR siblings and breaks hydration, so we inject it here instead.
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    const renderWidget = () => {
      if (!window.turnstile || turnstileWidgetId) return;
      const el = document.getElementById("turnstile-container-checkout");
      if (!el || el.childElementCount > 0) return;
      const id = window.turnstile.render("#turnstile-container-checkout", {
        sitekey: siteKey,
        callback: (token: string) => setValue("turnstileToken", token),
      });
      setTurnstileWidgetId(id);
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const SCRIPT_ID = "cf-turnstile-script";
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", renderWidget);
    return () => script?.removeEventListener("load", renderWidget);
  }, [setValue, turnstileWidgetId]);

  async function onSubmit(data: CheckoutInput) {
    // Non-Maths is by request only — never pay through checkout; hand off to enquiry.
    const itemByRequest =
      data.itemType === "session"
        ? !isInstantBookableSubject(data.subject)
        : (() => {
            const pkg = getPackage(data.packageId);
            return pkg ? !isInstantBookablePackage(pkg) : false;
          })();
    if (itemByRequest) {
      onEnquireInstead?.(data.itemType === "session" ? data.subject : undefined);
      return;
    }
    if (!data.slot || !data.startDate) {
      setErrorMsg("Please choose a date and time.");
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErrorMsg(json.error ?? "Something went wrong. Please try again.");
          if (window.turnstile && turnstileWidgetId) {
            window.turnstile.reset(turnstileWidgetId);
            setValue("turnstileToken", "");
          }
          return;
        }
        window.location.href = json.url;
      } catch {
        setErrorMsg("A network error occurred. Please check your connection and try again.");
      }
    });
  }

  // Build the level options from the pricing data so each value matches the
  // pricing rows used to look up the format + fee (e.g. "KS3 Maths", not "KS3").
  const levels = useMemo(() => {
    if (!subject) return [];
    return [...new Set(getPricingRowsForSubject(subject).map((row) => row.level))];
  }, [subject]);
  const formatsForLevel = useMemo(() => {
    if (itemType !== "session" || !subject || !level) return [];
    return getPricingRowsForSubject(subject).filter((row) => row.level === level);
  }, [itemType, subject, level]);

  const selectedSessionPricing =
    itemType === "session" && subject && level && format ? getSessionPricing(subject, level, format) : undefined;
  const selectedPackage = itemType === "package" && packageId ? getPackage(packageId) : undefined;

  const estimatedTotalPence = useMemo(() => {
    if (itemType === "session" && selectedSessionPricing && quantity) {
      // Group sessions are per-student and one member pays for the whole group,
      // so multiply by group size (matches the server + the package path below).
      const students = isGroupFormat(selectedSessionPricing.format) ? (groupSize ?? 0) : 1;
      return selectedSessionPricing.unitAmountPence * quantity * students;
    }
    if (itemType === "package" && selectedPackage) {
      const isGroupPkg = isGroupPackage(selectedPackage.id);
      return isGroupPkg ? selectedPackage.amountPence * (groupSize ?? 0) : selectedPackage.amountPence;
    }
    return 0;
  }, [itemType, selectedSessionPricing, quantity, selectedPackage, groupSize]);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const byRequest =
    (itemType === "session" && !!subject && !isInstantBookableSubject(subject)) ||
    (itemType === "package" && !!selectedPackage && !isInstantBookablePackage(selectedPackage));

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {byRequest && (
          <div className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4">
            <Mail size={18} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-sm text-ink-muted">
              This subject is available <span className="font-medium text-ink">by request</span>. Send a quick
              enquiry and Dr Ahmed will confirm availability — you&apos;ll be able to pay once he confirms.
            </p>
          </div>
        )}

        {/* Item type toggle */}
        <fieldset className="space-y-3">
          <legend className="font-heading text-lg font-semibold text-ink">What are you booking?</legend>
          <div className="flex gap-4">
            {(["session", "package"] as const).map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={t} {...register("itemType")} className="text-primary-fg focus:ring-primary-fg" />
                <span className="text-sm font-medium text-ink">{t === "session" ? "Single session(s)" : "Package"}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <hr className="border-brand-border" />

        {itemType === "session" ? (
          <fieldset className="space-y-4">
            <legend className="font-heading text-lg font-semibold text-ink">Session details</legend>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="subject" className="mt-1 w-full">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maths">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="a-level-physics">A-level Physics</SelectItem>
                      <SelectItem value="research-methods">Research Methods</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="level">Level *</Label>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="level" className="mt-1 w-full">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((l) => (
                        <SelectItem key={l} value={l}>{cleanLevelLabel(l, subject)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.level && <p role="alert" className="mt-1 text-xs text-danger">{errors.level.message}</p>}
            </div>

            <div>
              <Label htmlFor="format">Format *</Label>
              <Controller
                name="format"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!level}>
                    <SelectTrigger id="format" className="mt-1 w-full">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {formatsForLevel.map((row) => (
                        <SelectItem key={row.format} value={row.format}>
                          {row.format} — {row.fee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.format && <p role="alert" className="mt-1 text-xs text-danger">{errors.format.message}</p>}
            </div>

            <div>
              <Label htmlFor="quantity">Number of lessons (1–10) *</Label>
              <Input id="quantity" type="number" min={format && isGroupFormat(format) ? 5 : 1} max={10} {...register("quantity")} className="mt-1 w-32" />
              {format && isGroupFormat(format) && (
                <p className="mt-1 text-xs text-ink-muted">A minimum of 5 lessons must be booked for group tuition.</p>
              )}
              {errors.quantity && <p role="alert" className="mt-1 text-xs text-danger">{errors.quantity.message}</p>}
            </div>
          </fieldset>
        ) : (
          <fieldset className="space-y-4">
            <legend className="font-heading text-lg font-semibold text-ink">Package details</legend>
            <div>
              <Label htmlFor="packageId">Package *</Label>
              <Controller
                name="packageId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="packageId" className="mt-1 w-full">
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>{pkg.name} — {pkg.fee}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.packageId && <p role="alert" className="mt-1 text-xs text-danger">{errors.packageId.message}</p>}
            </div>
          </fieldset>
        )}

        {/* Group fields */}
        <div
          className={`space-y-4 overflow-hidden transition-all duration-300 ${isGroup ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
          inert={!isGroup}
        >
          <hr className="border-brand-border" />
          <fieldset className="space-y-4">
            <legend className="font-heading text-lg font-semibold text-ink">Group details</legend>
            <div>
              <Label htmlFor="groupSize">Group size *</Label>
              <Input id="groupSize" type="number" min={4} max={6} {...register("groupSize", { setValueAs: (v) => (v === "" ? undefined : v) })} placeholder="4–6 students" className="mt-1 w-32" />
              {errors.groupSize && <p role="alert" className="mt-1 text-xs text-danger">{errors.groupSize.message}</p>}
            </div>
            <div>
              <Label htmlFor="topicList">Topic list *</Label>
              <Textarea id="topicList" {...register("topicList")} placeholder="List the topics you want to be covered" className="mt-1" rows={3} />
              {errors.topicList && <p role="alert" className="mt-1 text-xs text-danger">{errors.topicList.message}</p>}
            </div>
            <p className="text-xs text-ink-muted">
              Maths topics can be booked at any time; for other subjects the topic list is subject to Dr Ahmed&apos;s email confirmation.
            </p>
          </fieldset>
        </div>

        {byRequest ? (
          <>
            <hr className="border-brand-border" />
            <button
              type="button"
              onClick={() => onEnquireInstead?.(typeof subject === "string" ? subject : undefined)}
              className="w-full rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2 flex items-center justify-center gap-2"
            >
              <Mail size={16} />
              Send an enquiry to confirm availability
            </button>
            <p className="text-center text-xs text-ink-muted">
              You&apos;ll be able to pay once Dr Ahmed confirms availability.
            </p>
          </>
        ) : (
          <>
        <hr className="border-brand-border" />

        {/* Contact info */}
        <fieldset className="space-y-4">
          <legend className="font-heading text-lg font-semibold text-ink">Your details</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name *</Label>
              <Input id="name" {...register("name")} className="mt-1" />
              {errors.name && <p role="alert" className="mt-1 text-xs text-danger">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email address *</Label>
              <Input id="email" type="email" {...register("email")} className="mt-1" />
              {errors.email && <p role="alert" className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>
          </div>
        </fieldset>

        <hr className="border-brand-border" />

        {/* Schedule */}
        <fieldset className="space-y-4">
          <legend className="font-heading text-lg font-semibold text-ink">Weekly slot</legend>
          <p className="text-sm text-ink-muted">
            Pick your first lesson date, then a time. Lessons recur weekly at that day &amp; time. Times are UK time.
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>First lesson date *</Label>
              <div className="mt-1 inline-block rounded-lg border border-brand-border">
                <Calendar
                  selected={startDate ? new Date(`${startDate}T00:00:00`) : undefined}
                  defaultMonth={startDate ? new Date(`${startDate}T00:00:00`) : undefined}
                  disabledDay={dayDisabled}
                  onSelect={(d) => {
                    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                    setValue("startDate", iso, { shouldValidate: true });
                    setValue("slot", "");
                  }}
                />
              </div>
              {errors.startDate && <p role="alert" className="mt-1 text-xs text-danger">{errors.startDate.message}</p>}
            </div>

            <div>
              <Label>Time {startDate && <span className="font-normal text-ink-muted">— {formattedDate}</span>} *</Label>
              {!startDate && <p className="mt-2 text-sm text-ink-muted">Choose a date to see available times.</p>}
              {startDate && loadingTimes && (
                <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted"><Loader2 size={16} className="animate-spin" /> Checking availability…</p>
              )}
              {startDate && !loadingTimes && dayAvail && (
                <div className="mt-2 space-y-3">
                  {([["Morning", MORNING], ["Afternoon", AFTERNOON]] as const).map(([label, times]) => (
                    <div key={label}>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {times.map((t) => {
                          const free = dayAvail[t] ?? true;
                          const sel = selectedTime === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={!free}
                              onClick={() => {
                                const prefix = new Date(`${startDate}T00:00:00`).getDay() === 6 ? "sat" : "sun";
                                setValue("slot", `${prefix}-${t}`, { shouldValidate: true });
                              }}
                              className={cn(
                                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                                sel
                                  ? "border-primary bg-primary text-white"
                                  : free
                                    ? "border-brand-border bg-surface text-ink hover:border-primary-fg"
                                    : "pointer-events-none border-brand-border bg-surface-2 text-ink-muted/40 line-through",
                              )}
                            >
                              {t}{!free && " ✗"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.slot && <p role="alert" className="mt-1 text-xs text-danger">Please choose a time</p>}
            </div>
          </div>

          {slot && startDate && (
            <p className="flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 size={16} /> {formattedDate} at {selectedTime} (UK) — recurring weekly.
            </p>
          )}
        </fieldset>

        <hr className="border-brand-border" />

        {estimatedTotalPence > 0 && (
          <p className="text-lg font-semibold text-primary-fg">
            Estimated total: £{(estimatedTotalPence / 100).toFixed(2)}
          </p>
        )}

        {/* Cancellation policy */}
        <div className="rounded-lg border border-brand-border bg-bg p-4">
          <p className="text-sm text-ink-muted">{cancellationPolicy}</p>
          <label className="mt-3 flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register("cancellationAck")} className="mt-0.5 rounded text-primary-fg focus:ring-primary-fg" />
            <span className="text-sm text-ink">I understand and accept the cancellation policy.</span>
          </label>
          {errors.cancellationAck && <p role="alert" className="mt-1 text-xs text-danger">{errors.cancellationAck.message}</p>}
        </div>

        {/* Turnstile */}
        {siteKey ? (
          <div id="turnstile-container-checkout" />
        ) : (
          <input type="hidden" {...register("turnstileToken")} />
        )}
        {errors.turnstileToken && <p role="alert" className="text-xs text-danger">{errors.turnstileToken.message}</p>}

        {errorMsg && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !slot || !startDate}
          className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? "Redirecting to payment…" : "Continue to payment"}
        </button>
          </>
        )}
      </form>
    </>
  );
}
