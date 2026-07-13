import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import PricingTable from "@/components/site/PricingTable";
import PackageCard from "@/components/site/PackageCard";
import TestimonialCard from "@/components/site/TestimonialCard";
import ByRequestNotice from "@/components/site/ByRequestNotice";
import { sciencePricing } from "@/content/pricing";
import { packages } from "@/content/packages";
import { testimonials } from "@/content/testimonials";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Science Tuition – KS2 to GCSE | Professor Dr Munir Ahmed",
  description:
    "Online Science tuition from KS2 to GCSE. Biology, Chemistry, Physics and Combined Science. One-to-one from £40/hour.",
  alternates: { canonical: "/subjects/science" },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Science Tuition – KS2 to GCSE",
  description: "Online Science tuition from KS2 to GCSE by Professor Dr Munir Ahmed.",
  provider: { "@type": "Person", name: "Professor Dr Munir Ahmed" },
};

const included = [
  "Personalised assessment of the student's current level, strengths and areas for improvement",
  "Clear explanation of difficult topics using step-by-step teaching",
  "Structured lesson planning based on the student's exam board, syllabus and target grade",
  "Focused support with weak areas, misconceptions and common exam mistakes",
  "Guided practice with exam-style questions and past-paper questions where appropriate",
  "Support with problem-solving, calculations, written answers and subject-specific terminology",
  "Exam strategy, timing techniques and mark-scheme guidance",
  "Notes, worked examples or lesson summaries after each lesson where appropriate",
  "Regular progress monitoring so that lessons remain focused and purposeful",
  "Direct academic mentoring to build confidence, independence and long-term study skills",
];

const relatedPackages = packages.filter((p) => p.id.includes("science") || p.id.includes("gcse"));
const relatedTestimonials = testimonials.filter((t) => t.tags.includes("GCSE"));

export default function SciencePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />

      <section className="py-16 md:py-24 bg-bg">
        <Container>
          <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">Science Tuition</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
            Online Science tuition in Biology, Chemistry and Physics from KS2 to GCSE, including General
            Science, Combined Science and Triple Science. Lessons are tailored to the student&apos;s syllabus,
            exam board and areas of difficulty, helping students build understanding and confidence across
            key science topics.
          </p>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
            For students preparing for tests, mocks or final exams, focused exam preparation lessons are
            available. These include past-paper questions, exam technique, timing, common mistakes and
            mark-scheme guidance.
          </p>
        </Container>
      </section>

      <section className="py-12 bg-surface">
        <Container>
          <SectionHeading title="Fees" subtitle="Available for all UK and international exam boards." />
          <div className="mt-6">
            <ByRequestNotice subject="science" subjectLabel="Science" />
            <PricingTable rows={sciencePricing} showSubjects={true} subject="science" />
          </div>
        </Container>
      </section>

      <section className="py-12 bg-bg">
        <Container>
          <SectionHeading title="What's included" />
          <ul className="mt-6 space-y-4 max-w-lg">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle size={18} className="mt-0.5 shrink-0 text-success" />
                <span className="text-ink-muted">{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {relatedPackages.length > 0 && (
        <section className="py-12 bg-surface">
          <Container>
            <SectionHeading title="Science packages" />
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {relatedTestimonials.length > 0 && (
        <section className="py-12 bg-bg">
          <Container>
            <SectionHeading title="What students say" />
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {relatedTestimonials.slice(0, 4).map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-12 bg-surface">
        <Container>
          <Link
            href="/book?subject=science"
            className="inline-block rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2"
          >
            Email to confirm Science availability
          </Link>
        </Container>
      </section>
    </>
  );
}
