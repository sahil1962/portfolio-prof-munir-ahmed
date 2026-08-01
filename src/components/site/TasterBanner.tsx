import Link from "next/link";
import { TASTER_PRICE_LABEL } from "@/content/taster";

/** Promo banner for the one-off Initial Assessment & Taster Lesson. */
export default function TasterBanner({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-accent/40 bg-accent/5 p-6 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
    >
      <div>
        <p className="font-heading text-lg font-semibold text-ink">
          New students: Initial Assessment &amp; Taster Lesson
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          A one-off 60-minute introductory session: a 30-minute assessment plus a 30-minute taster lesson.
          {" "}{TASTER_PRICE_LABEL}, available once per student.
        </p>
      </div>
      <Link
        href="/taster"
        className="shrink-0 self-start rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2 sm:self-auto"
      >
        Book taster ({TASTER_PRICE_LABEL})
      </Link>
    </div>
  );
}
