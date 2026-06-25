"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { enquirySchema, levelsBySubject, sessionTimes, type EnquiryInput } from "@/lib/enquiry-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface BookingFormProps {
  defaultValues?: {
    subject?: string;
    format?: string;
    package?: string;
    day?: string;
    time?: string;
  };
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
    };
  }
}

export default function BookingForm({ defaultValues }: BookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(null);

  const validSubjects = ["maths", "science", "a-level-physics", "research-methods"] as const;
  const defaultSubject = validSubjects.find((s) => s === defaultValues?.subject) ?? "maths";
  const defaultFormat = defaultValues?.format === "group" ? "group" : "1-to-1";

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      subject: defaultSubject,
      level: "",
      format: defaultFormat,
      package: defaultValues?.package ?? "",
      preferredTimes: [],
      consent: undefined as unknown as true,
      turnstileToken: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? "" : "dev-bypass",
    },
  });

  const subject = watch("subject");
  const format = watch("format");
  const isGroup = format === "group";

  // Reset level when subject changes
  useEffect(() => {
    setValue("level", "");
  }, [subject, setValue]);

  // Turnstile — load the widget script client-side only. Rendering next/script in
  // the JSX tree shifts SSR siblings and breaks hydration, so we inject it here instead.
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    const renderWidget = () => {
      if (!window.turnstile || turnstileWidgetId) return;
      const el = document.getElementById("turnstile-container");
      if (!el || el.childElementCount > 0) return;
      const id = window.turnstile.render("#turnstile-container", {
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

  async function onSubmit(data: EnquiryInput) {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setErrorMsg(json.error ?? "Something went wrong. Please try again.");
          if (window.turnstile && turnstileWidgetId) {
            window.turnstile.reset(turnstileWidgetId);
            setValue("turnstileToken", "");
          }
          return;
        }
        router.push("/thank-you");
      } catch {
        setErrorMsg("A network error occurred. Please check your connection and try again.");
      }
    });
  }

  const levels = levelsBySubject[subject] ?? [];
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Contact info */}
        <fieldset className="space-y-4">
          <legend className="font-heading text-lg font-semibold text-ink">Your details</legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name *</Label>
              <Input id="name" {...register("name")} className="mt-1" aria-describedby={errors.name ? "name-error" : undefined} />
              {errors.name && <p id="name-error" role="alert" className="mt-1 text-xs text-danger">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email address *</Label>
              <Input id="email" type="email" {...register("email")} className="mt-1" aria-describedby={errors.email ? "email-error" : undefined} />
              {errors.email && <p id="email-error" role="alert" className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone number (optional)</Label>
            <Input id="phone" type="tel" {...register("phone")} className="mt-1" />
          </div>
        </fieldset>

        <hr className="border-brand-border" />

        {/* Student info */}
        <fieldset className="space-y-4">
          <legend className="font-heading text-lg font-semibold text-ink">Student details</legend>

          <div>
            <Label htmlFor="studentYear">Year / age *</Label>
            <Input id="studentYear" {...register("studentYear")} placeholder="e.g. Year 11, Age 16" className="mt-1" aria-describedby={errors.studentYear ? "studentYear-error" : undefined} />
            {errors.studentYear && <p id="studentYear-error" role="alert" className="mt-1 text-xs text-danger">{errors.studentYear.message}</p>}
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="subject" className="mt-1 w-full" aria-describedby={errors.subject ? "subject-error" : undefined}>
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
            {errors.subject && <p id="subject-error" role="alert" className="mt-1 text-xs text-danger">{errors.subject.message}</p>}
          </div>

          {/* Level */}
          <div>
            <Label htmlFor="level">Level *</Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="level" className="mt-1 w-full" aria-describedby={errors.level ? "level-error" : undefined}>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.level && <p id="level-error" role="alert" className="mt-1 text-xs text-danger">{errors.level.message}</p>}
          </div>

          {/* Format */}
          <div>
            <Label>Format *</Label>
            <div className="mt-2 flex gap-4">
              {(["1-to-1", "group"] as const).map((f) => (
                <label key={f} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={f}
                    {...register("format")}
                    className="text-primary-fg focus:ring-primary-fg"
                  />
                  <span className="text-sm font-medium text-ink capitalize">{f === "1-to-1" ? "One-to-one" : "Small group"}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="examBoard">Exam board (optional)</Label>
            <Input id="examBoard" {...register("examBoard")} placeholder="e.g. AQA, Edexcel, OCR" className="mt-1" />
          </div>
        </fieldset>

        {/* Group fields */}
        <div
          className={`space-y-4 overflow-hidden transition-all duration-300 ${isGroup ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
          inert={!isGroup}
        >
          <hr className="border-brand-border" />
          <fieldset className="space-y-4">
            <legend className="font-heading text-lg font-semibold text-ink">Group details</legend>
            <p className="text-sm text-accent font-medium">Minimum 5 lessons required for group tuition.</p>

            <div>
              <Label htmlFor="groupSize">Group size *</Label>
              <Input
                id="groupSize"
                type="number"
                min={4}
                max={6}
                {...register("groupSize", { setValueAs: (v) => (v === "" ? undefined : v) })}
                placeholder="4–6 students"
                className="mt-1"
                aria-describedby={errors.groupSize ? "groupSize-error" : undefined}
              />
              {errors.groupSize && <p id="groupSize-error" role="alert" className="mt-1 text-xs text-danger">{errors.groupSize.message}</p>}
            </div>

            <div>
              <Label htmlFor="groupMembers">Group members (optional)</Label>
              <Textarea id="groupMembers" {...register("groupMembers")} placeholder="Names of students in the group" className="mt-1" rows={2} />
            </div>

            <div>
              <Label htmlFor="topicList">Topic list *</Label>
              <Textarea
                id="topicList"
                {...register("topicList")}
                placeholder="List the topics you want to be covered"
                className="mt-1"
                rows={3}
                aria-describedby={errors.topicList ? "topicList-error" : undefined}
              />
              {errors.topicList && <p id="topicList-error" role="alert" className="mt-1 text-xs text-danger">{errors.topicList.message}</p>}
            </div>
          </fieldset>
        </div>

        <hr className="border-brand-border" />

        {/* Preferred times */}
        <fieldset>
          <legend className="font-heading text-lg font-semibold text-ink">Preferred session times *</legend>
          <p className="mt-1 text-sm text-ink-muted">Select all that work for you.</p>
          {errors.preferredTimes && (
            <p role="alert" className="mt-1 text-xs text-danger">{errors.preferredTimes.message}</p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {sessionTimes.map((slot) => (
              <label key={slot.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={slot.value}
                  {...register("preferredTimes")}
                  className="rounded text-primary-fg focus:ring-primary-fg"
                />
                <span className="text-sm text-ink">{slot.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <hr className="border-brand-border" />

        {/* Message */}
        <div>
          <Label htmlFor="message">Additional information (optional)</Label>
          <Textarea
            id="message"
            {...register("message")}
            placeholder="Any other details you'd like to share…"
            className="mt-1"
            rows={4}
          />
        </div>

        {/* Consent */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("consent")}
              className="mt-0.5 rounded text-primary-fg focus:ring-primary-fg"
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <span className="text-sm text-ink-muted">
              I consent to Dr Munir Ahmed using the information provided above to respond to my tuition enquiry.
              Your data will not be shared with third parties or used for marketing.
            </span>
          </label>
          {errors.consent && <p id="consent-error" role="alert" className="mt-1 text-xs text-danger">{errors.consent.message}</p>}
        </div>

        {/* Turnstile */}
        {siteKey ? (
          <div id="turnstile-container" />
        ) : (
          <input type="hidden" {...register("turnstileToken")} />
        )}
        {errors.turnstileToken && (
          <p role="alert" className="text-xs text-danger">{errors.turnstileToken.message}</p>
        )}

        {/* Error summary */}
        {errorMsg && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? "Sending…" : "Send enquiry"}
        </button>
      </form>
    </>
  );
}
