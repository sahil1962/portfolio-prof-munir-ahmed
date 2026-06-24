import type { Metadata } from "next";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import StrengthRow from "@/components/site/StrengthRow";
import CTA from "@/components/site/CTA";
import { tutorIntroParagraphs } from "@/content/copy";
import { strengths } from "@/content/strengths";

export const metadata: Metadata = {
  title: "About Professor Dr Munir Ahmed",
  description:
    "Over 40 years of teaching experience across schools, colleges, universities and industry. Expert tuition in Maths, Science, Physics and Research Methods.",
  alternates: { canonical: "/about" },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Professor Dr Munir Ahmed",
  jobTitle: "Tutor",
  description:
    "Over 40 years of teaching experience in Maths, Science, Physics and Research Methods.",
  knowsAbout: ["Mathematics", "Physics", "Science", "Research Methods"],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <section className="py-16 md:py-24 bg-bg">
        <Container>
          <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">
            About Professor Dr Munir Ahmed
          </h1>

          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-5">
            {/* Photo placeholder */}
            <div className="md:col-span-2">
              <div
                className="w-full rounded-xl bg-brand-border"
                style={{ aspectRatio: "4/5" }}
                aria-label="Photo placeholder"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-3 space-y-5">
              {tutorIntroParagraphs.map((para, i) => (
                <p key={i} className="text-ink-muted leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-surface">
        <Container>
          <SectionHeading title="Why study with Dr Munir?" />
          <div className="mt-10 space-y-8 max-w-3xl">
            {strengths.map((s) => (
              <StrengthRow key={s.strength} strength={s} />
            ))}
          </div>
        </Container>
      </section>

      <CTA />
    </>
  );
}
