"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tasterSchema, type TasterInput } from "@/lib/taster-schema";
import { tasterSlots, TASTER_PRICE_LABEL } from "@/content/taster";
import { cancellationPolicy } from "@/content/copy";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format as formatDate } from "date-fns";
import { Loader2, CreditCard } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
    };
  }
}

export default function TasterForm() {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(null);
  const [dayAvail, setDayAvail] = useState<Record<string, boolean> | null>(null);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TasterInput>({
    resolver: zodResolver(tasterSchema),
    defaultValues: {
      subject: "maths",
      studentYear: "",
      examBoard: "",
      focus: "",
      slot: "" as unknown as TasterInput["slot"],
      startDate: "",
      cancellationAck: undefined as unknown as true,
      turnstileToken: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? "" : "dev-bypass",
    },
  });

  const startDate = watch("startDate");
  const slot = watch("slot");

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const dayDisabled = useMemo(
    () => (date: Date) => date < today || (date.getDay() !== 0 && date.getDay() !== 6),
    [today],
  );
  const formattedDate = startDate ? formatDate(new Date(`${startDate}T00:00:00`), "EEE d MMMM yyyy") : "";

  // Load taster-slot availability for the chosen date.
  useEffect(() => {
    if (!startDate) { setDayAvail(null); return; }
    setLoadingTimes(true);
    const controller = new AbortController();
    fetch(`/api/availability/taster?startDate=${startDate}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setDayAvail(data.times ?? null))
      .catch((err) => { if (err.name !== "AbortError") setDayAvail(null); })
      .finally(() => setLoadingTimes(false));
    return () => controller.abort();
  }, [startDate]);

  // Clear the chosen time if it's no longer available.
  useEffect(() => {
    if (slot && dayAvail && dayAvail[slot] === false) setValue("slot", "" as unknown as TasterInput["slot"]);
  }, [slot, dayAvail, setValue]);

  // Turnstile — inject the widget script client-side only (avoids SSR hydration mismatch).
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    const renderWidget = () => {
      if (!window.turnstile || turnstileWidgetId) return;
      const el = document.getElementById("turnstile-container-taster");
      if (!el || el.childElementCount > 0) return;
      const id = window.turnstile.render("#turnstile-container-taster", {
        sitekey: siteKey,
        callback: (token: string) => setValue("turnstileToken", token),
      });
      setTurnstileWidgetId(id);
    };

    if (window.turnstile) { renderWidget(); return; }

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

  async function onSubmit(data: TasterInput) {
    setErrorMsg(null);
    setAlreadyBooked(false);
    startTransition(async () => {
      try {
        const res = await fetch("/api/taster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (json.code === "TASTER_ALREADY_BOOKED") setAlreadyBooked(true);
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

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Your details */}
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

      {/* What to prepare */}
      <fieldset className="space-y-4">
        <legend className="font-heading text-lg font-semibold text-ink">What should we prepare?</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            {errors.subject && <p role="alert" className="mt-1 text-xs text-danger">{errors.subject.message}</p>}
          </div>
          <div>
            <Label htmlFor="studentYear">Year / level *</Label>
            <Input id="studentYear" {...register("studentYear")} placeholder="e.g. Year 11, GCSE, MSc" className="mt-1" />
            {errors.studentYear && <p role="alert" className="mt-1 text-xs text-danger">{errors.studentYear.message}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="examBoard">Exam board / syllabus (optional)</Label>
          <Input id="examBoard" {...register("examBoard")} placeholder="e.g. AQA, Edexcel, OCR" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="focus">Topic &amp; areas of difficulty *</Label>
          <Textarea id="focus" {...register("focus")} rows={3} placeholder="Tell us the topic and what you'd like to focus on, so the session can be prepared properly." className="mt-1" />
          {errors.focus && <p role="alert" className="mt-1 text-xs text-danger">{errors.focus.message}</p>}
        </div>
      </fieldset>

      <hr className="border-brand-border" />

      {/* Date & time */}
      <fieldset className="space-y-4">
        <legend className="font-heading text-lg font-semibold text-ink">Choose a time</legend>
        <p className="text-sm text-ink-muted">The taster runs on weekends. Times are UK time.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label>Date *</Label>
            <div className="mt-1 inline-block rounded-lg border border-brand-border">
              <Calendar
                selected={startDate ? new Date(`${startDate}T00:00:00`) : undefined}
                defaultMonth={startDate ? new Date(`${startDate}T00:00:00`) : undefined}
                disabledDay={dayDisabled}
                onSelect={(d) => {
                  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  setValue("startDate", iso, { shouldValidate: true });
                  setValue("slot", "" as unknown as TasterInput["slot"]);
                }}
              />
            </div>
            {errors.startDate && <p role="alert" className="mt-1 text-xs text-danger">{errors.startDate.message}</p>}
          </div>

          <div>
            <Label>Time *</Label>
            {!startDate ? (
              <p className="mt-2 text-sm text-ink-muted">Pick a date first.</p>
            ) : loadingTimes ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted"><Loader2 size={14} className="animate-spin" /> Checking availability…</p>
            ) : (
              <div className="mt-1 space-y-2">
                {tasterSlots.map((s) => {
                  const taken = dayAvail ? dayAvail[s.value] === false : false;
                  const active = slot === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      disabled={taken}
                      onClick={() => setValue("slot", s.value, { shouldValidate: true })}
                      className={`w-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "border-primary-fg bg-primary text-white"
                          : taken
                            ? "cursor-not-allowed border-brand-border bg-surface-2 text-ink-muted line-through opacity-60"
                            : "border-brand-border bg-surface hover:border-primary-fg hover:text-primary-fg"
                      }`}
                    >
                      {s.label}{taken ? " — booked" : ""}
                    </button>
                  );
                })}
                {formattedDate && <p className="text-xs text-ink-muted">Selected: {formattedDate}</p>}
              </div>
            )}
            {errors.slot && <p role="alert" className="mt-1 text-xs text-danger">{errors.slot.message}</p>}
          </div>
        </div>
      </fieldset>

      <hr className="border-brand-border" />

      {/* Price + cancellation */}
      <div className="rounded-lg border border-brand-border bg-surface p-4">
        <p className="text-sm text-ink">
          <strong>Initial Assessment &amp; Taster Lesson — {TASTER_PRICE_LABEL}</strong> (one 60-minute session, available once per student).
        </p>
      </div>
      <div className="rounded-lg border border-brand-border bg-bg p-4">
        <p className="text-sm text-ink-muted">{cancellationPolicy}</p>
        <label className="mt-3 flex items-start gap-3 cursor-pointer">
          <input type="checkbox" {...register("cancellationAck")} className="mt-0.5 rounded text-primary-fg focus:ring-primary-fg" />
          <span className="text-sm text-ink">I understand and accept the cancellation policy.</span>
        </label>
        {errors.cancellationAck && <p role="alert" className="mt-1 text-xs text-danger">{errors.cancellationAck.message}</p>}
      </div>

      {/* Turnstile */}
      {siteKey ? <div id="turnstile-container-taster" /> : <input type="hidden" {...register("turnstileToken")} />}
      {errors.turnstileToken && <p role="alert" className="text-xs text-danger">{errors.turnstileToken.message}</p>}

      {errorMsg && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          {errorMsg}
          {alreadyBooked && (
            <>
              {" "}
              <Link href="/book" className="font-medium underline">Book lessons →</Link>
            </>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {isPending ? <><Loader2 size={16} className="animate-spin" /> Redirecting…</> : <><CreditCard size={16} /> Pay {TASTER_PRICE_LABEL} &amp; book</>}
      </button>
    </form>
  );
}
