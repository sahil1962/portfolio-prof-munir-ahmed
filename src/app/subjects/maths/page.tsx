import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import PricingTable from "@/components/site/PricingTable";
import PackageCard from "@/components/site/PackageCard";
import TestimonialCard from "@/components/site/TestimonialCard";
import { mathsPricing } from "@/content/pricing";
import { packages } from "@/content/packages";
import { testimonials } from "@/content/testimonials";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Maths Tuition – KS2 to A-level | Dr Munir Ahmed",
  description:
    "Online Maths tuition from KS2 to A-level. One-to-one from £40/hour, small group from £10/student/hour. Taught by Professor Dr Munir Ahmed.",
  alternates: { canonical: "/subjects/maths" },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Maths Tuition – KS2 to A-level",
  description: "Online Maths tuition from KS2 to A-level by Professor Dr Munir Ahmed.",
  provider: { "@type": "Person", name: "Professor Dr Munir Ahmed" },
};

const included = [
  "Personalised diagnosis of weaknesses",
  "Structured progression with notes after each lesson",
  "Exam strategy and past-paper work",
  "Direct academic mentoring",
];

const relatedPackages = packages.filter((p) => p.id.includes("maths"));
const relatedTestimonials = testimonials.filter((t) =>
  t.tags.some((tag) => ["Maths", "A-level Maths", "GCSE"].includes(tag))
);

export default function MathsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />

      <section className="py-16 md:py-24 bg-bg">
        <Container>
          <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">Maths Tuition</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
            Expert online Maths tuition from KS2 through to A-level. Covering all major exam boards with
            personalised support, structured lesson plans and direct academic mentoring.
          </p>
        </Container>
      </section>

      <section className="py-12 bg-surface">
        <Container>
          <SectionHeading title="Fees" subtitle="Available for all UK and international exam boards." />
          <div className="mt-6">
            <PricingTable rows={mathsPricing} subject="maths" />
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
            <SectionHeading title="Maths packages" />
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
            href="/book?subject=maths&intent=pay"
            className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2"
          >
            Book &amp; pay for Maths tuition
          </Link>
        </Container>
      </section>
    </>
  );
}
