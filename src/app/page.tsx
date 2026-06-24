import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import SubjectCard from "@/components/site/SubjectCard";
import TestimonialCard from "@/components/site/TestimonialCard";
import StrengthRow from "@/components/site/StrengthRow";
import CTA from "@/components/site/CTA";
import { heroHeadline, heroSubhead } from "@/content/copy";
import { strengths } from "@/content/strengths";
import { testimonials } from "@/content/testimonials";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Dr Munir Ahmed Tuition | Online Maths, Science, Physics & Research Methods",
  description:
    "Online tuition in Maths, Science, A-level Physics and Research Methods by Professor Dr Munir Ahmed. Over 40 years of experience. One-to-one from £50/hour.",
  alternates: { canonical: "/" },
};

const subjects = [
  {
    title: "Mathematics",
    description: "KS2 to A-level Maths tuition, covering all major exam boards with structured progression and personalised support.",
    fromPrice: "£50/hour",
    href: "/subjects/maths",
  },
  {
    title: "Science",
    description: "KS2 to GCSE Science across Biology, Chemistry and Physics, including Combined and Triple Science.",
    fromPrice: "£50/hour",
    href: "/subjects/science",
  },
  {
    title: "A-level Physics",
    description: "Specialist A-level Physics tuition, exam preparation and practical skills support from Year 12 to final exams.",
    fromPrice: "£100/hour",
    href: "/subjects/a-level-physics",
  },
  {
    title: "Research Methods",
    description: "Undergraduate to PhD research methods support — proposal, dissertation, methodology and mixed methods.",
    fromPrice: "£75/hour",
    href: "/subjects/research-methods",
  },
];

const featuredTestimonials = testimonials.filter((t) => t.featured);

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-32 bg-bg">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl lg:text-6xl">
              {heroHeadline}
            </h1>
            <p className="mt-6 text-lg text-ink-muted leading-relaxed md:text-xl">
              {heroSubhead}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/book"
                className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2"
              >
                Book a lesson
              </Link>
              <Link
                href="/packages"
                className="rounded-lg border border-brand-border bg-surface px-6 py-3 font-medium text-ink hover:border-primary-fg hover:text-primary-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg"
              >
                See pricing
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Subjects grid */}
      <section className="py-16 md:py-24 bg-surface">
        <Container>
          <SectionHeading title="Subjects" subtitle="Expert tuition across four subject areas, from KS2 through to postgraduate level." />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject) => (
              <SubjectCard key={subject.href} {...subject} />
            ))}
          </div>
        </Container>
      </section>

      {/* Why Dr Munir */}
      <section className="py-16 md:py-24 bg-bg">
        <Container>
          <SectionHeading title="Why study with Dr Munir?" />
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {strengths.slice(0, 3).map((s) => (
              <StrengthRow key={s.strength} strength={s} />
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/about"
              className="text-sm font-medium text-primary-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg rounded"
            >
              Read more about Dr Munir →
            </Link>
          </div>
        </Container>
      </section>

      {/* Featured testimonials */}
      <section className="py-16 md:py-24 bg-surface">
        <Container>
          <SectionHeading title="What students say" />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredTestimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
          <div className="mt-8">
            <Link href="/testimonials" className="text-sm font-medium text-primary-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg rounded">
              Read all testimonials →
            </Link>
          </div>
        </Container>
      </section>

      {/* Schedule teaser */}
      <section className="py-16 md:py-24 bg-bg">
        <Container>
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-lg bg-primary/10 p-3 text-primary-fg">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-ink">
                Available Saturdays and Sundays, 08:00–17:15
              </h2>
              <p className="mt-2 text-ink-muted">
                Up to 8 teaching sessions each day. One-to-one and small-group bookings accepted.
              </p>
              <Link href="/schedule" className="mt-4 inline-block text-sm font-medium text-primary-fg hover:underline">
                View full schedule →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <CTA />
    </>
  );
}
