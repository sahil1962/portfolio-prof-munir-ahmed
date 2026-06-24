import type { Metadata } from "next";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import ScheduleTable from "@/components/site/ScheduleTable";
import CTA from "@/components/site/CTA";
import { saturdaySchedule, sundaySchedule } from "@/content/schedule";
import { bookingNote } from "@/content/copy";

export const metadata: Metadata = {
  title: "Weekend Schedule | Dr Munir Ahmed",
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

          <p className="mt-10 text-sm text-ink-muted max-w-2xl leading-relaxed">{remainderNote}</p>
        </Container>
      </section>
      <CTA />
    </>
  );
}
