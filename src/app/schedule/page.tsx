import type { Metadata } from "next";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import ScheduleTable from "@/components/site/ScheduleTable";
import CTA from "@/components/site/CTA";
import Link from "next/link";
import { saturdaySchedule, sundaySchedule } from "@/content/schedule";
import { bookingNote } from "@/content/copy";
import { tasterSlots, TASTER_PRICE_LABEL } from "@/content/taster";

export const metadata: Metadata = {
  title: "Weekend Schedule | Professor Dr Munir Ahmed",
  description:
    "Weekend tuition available Saturdays and Sundays. Up to 8 teaching sessions per day, 08:00–17:15. One-to-one and small group.",
  alternates: { canonical: "/schedule" },
};

const notesSentences = bookingNote.split(". ");
const introNote = notesSentences.slice(0, 2).join(". ") + ".";
const remainderNote = notesSentences.slice(2).join(". ");

export default function SchedulePage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-bg">
        <Container>
          <SectionHeading title="Weekend schedule" subtitle={introNote} />

          <div className="mt-12 space-y-10">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-ink mb-4">Saturday</h2>
              <ScheduleTable slots={saturdaySchedule} day="saturday" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-ink mb-4">Sunday</h2>
              <ScheduleTable slots={sundaySchedule} day="sunday" />
            </div>
          </div>

          {/* New-student taster slots (weekend evenings, taster-only) */}
          <div className="mt-12 rounded-xl border border-accent/40 bg-accent/5 p-6">
            <h2 className="font-heading text-xl font-semibold text-ink">New students — Initial Assessment &amp; Taster</h2>
            <p className="mt-1 text-sm text-ink-muted">
              A one-off 60-minute introductory session for new students ({TASTER_PRICE_LABEL}), on Saturday and Sunday evenings:
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {tasterSlots.map((s) => (
                <li key={s.value} className="rounded-lg border border-brand-border bg-surface px-3 py-1.5 text-sm text-ink">{s.label}</li>
              ))}
            </ul>
            <Link
              href="/taster"
              className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2"
            >
              Book initial assessment / taster
            </Link>
          </div>

          <p className="mt-10 text-sm text-ink-muted max-w-2xl leading-relaxed">{remainderNote}</p>
        </Container>
      </section>
      <CTA />
    </>
  );
}
