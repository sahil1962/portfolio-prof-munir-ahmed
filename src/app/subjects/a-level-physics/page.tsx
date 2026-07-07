import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import PricingTable from "@/components/site/PricingTable";
import PackageCard from "@/components/site/PackageCard";
import TestimonialCard from "@/components/site/TestimonialCard";
import ByRequestNotice from "@/components/site/ByRequestNotice";
import { physicsPricing } from "@/content/pricing";
import { packages } from "@/content/packages";
import { testimonials } from "@/content/testimonials";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "A-level Physics Tuition | Dr Munir Ahmed",
  description:
    "Online A-level Physics tuition, exam preparation and practical skills support. One-to-one from £85/hour. Taught by Professor Dr Munir Ahmed.",
  alternates: { canonical: "/subjects/a-level-physics" },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "A-level Physics Tuition",
  description: "Online A-level Physics tuition by Professor Dr Munir Ahmed.",
  provider: { "@type": "Person", name: "Professor Dr Munir Ahmed" },
};

const included = [
  "Personalised diagnosis of weaknesses",
  "Structured progression with notes after each lesson",
  "Exam strategy and past-paper work",
  "Direct academic mentoring",
];

const relatedPackages = packages.filter((p) => p.id.includes("physics"));
const relatedTestimonials = testimonials.filter((t) =>
  t.tags.some((tag) => ["A-level Physics", "Physics"].includes(tag))
);

export default function ALevelPhysicsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />

      <section className="py-16 md:py-24 bg-bg">
        <Container>
          <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">A-level Physics Tuition</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
            Specialist A-level Physics tuition for Year 12 and Year 13. Includes exam preparation intensives
            and practical skills support, delivered one-to-one or in small groups.
          </p>
        </Container>
      </section>

      <section className="py-12 bg-surface">
        <Container>
          <SectionHeading title="Fees" subtitle="Available for all UK and international exam boards." />
          <div className="mt-6">
            <ByRequestNotice subject="a-level-physics" subjectLabel="A-level Physics" />
            <PricingTable rows={physicsPricing} subject="a-level-physics" />
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
            <SectionHeading title="Physics packages" />
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              {relatedTestimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-12 bg-surface">
        <Container>
          <Link
            href="/book?subject=a-level-physics"
            className="inline-block rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2"
          >
            Email to confirm A-level Physics availability
          </Link>
        </Container>
      </section>
    </>
  );
}
