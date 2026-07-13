import type { Metadata } from "next";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import TasterForm from "@/components/site/TasterForm";
import { tasterHeading, tasterParagraphs, TASTER_PRICE_LABEL } from "@/content/taster";

export const metadata: Metadata = {
  title: "Initial Assessment & Taster Lesson | Professor Dr Munir Ahmed",
  description:
    "New students can book a one-off 60-minute Initial Assessment & Taster Lesson for £25 — a 30-minute assessment plus a 30-minute taster lesson. Available weekend evenings.",
  alternates: { canonical: "/taster" },
};

export default function TasterPage() {
  return (
    <section className="py-16 md:py-24 bg-bg">
      <Container>
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            title={tasterHeading}
            subtitle={`A one-off introductory session for new students — ${TASTER_PRICE_LABEL}.`}
          />

          <div className="mt-6 space-y-4">
            {tasterParagraphs.map((para, i) => (
              <p key={i} className="text-ink-muted leading-relaxed">{para}</p>
            ))}
          </div>

          <div className="mt-10">
            <TasterForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
