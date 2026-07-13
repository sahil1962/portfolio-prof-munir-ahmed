import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import PricingTable from "@/components/site/PricingTable";
import PackageCard from "@/components/site/PackageCard";
import TestimonialCard from "@/components/site/TestimonialCard";
import ByRequestNotice from "@/components/site/ByRequestNotice";
import { researchPricing } from "@/content/pricing";
import { packages } from "@/content/packages";
import { testimonials } from "@/content/testimonials";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Research Methods Tuition – Undergraduate to PhD | Professor Dr Munir Ahmed",
  description:
    "Online Research Methods support for undergraduate, MSc, PhD and DProf students. Proposal, dissertation and methodology guidance from £80/hour.",
  alternates: { canonical: "/subjects/research-methods" },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Research Methods Tuition",
  description: "Online Research Methods tuition by Professor Dr Munir Ahmed.",
  provider: { "@type": "Person", name: "Professor Dr Munir Ahmed" },
};

const included = [
  "Support with research proposals, dissertations, theses and doctoral projects",
  "Guidance on choosing and refining a suitable research topic",
  "Help developing clear research aims, objectives and research questions",
  "Support with literature review structure, critical writing and identifying research gaps",
  "Guidance on qualitative, quantitative and mixed methods research design",
  "Help choosing appropriate methodology, methods, sampling and data collection approaches",
  "Support with questionnaires, interviews, surveys and case study design where appropriate",
  "Guidance on validity, reliability, ethics and limitations",
  "Support with data analysis planning and interpretation of findings",
  "Feedback on structure, argument, academic writing and presentation of research ideas",
  "Supervision-style academic mentoring to help students develop confidence and independence",
];

const relatedPackages = packages.filter((p) => p.id.includes("research"));
const relatedTestimonials = testimonials.filter((t) =>
  t.tags.some((tag) => ["Research Methods", "Higher Education"].includes(tag))
);

export default function ResearchMethodsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />

      <section className="py-16 md:py-24 bg-bg">
        <Container>
          <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">Research Methods Tuition</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
            Support for undergraduate through to PhD and DProf students. Covering research proposals,
            dissertations, methodology and mixed methods, taught by someone trained in Mixed Methods Research
            at the University of Oxford.
          </p>
        </Container>
      </section>

      <section className="py-12 bg-surface">
        <Container>
          <SectionHeading title="Fees" />
          <div className="mt-6">
            <ByRequestNotice subject="research-methods" subjectLabel="Research Methods" />
            <PricingTable rows={researchPricing} subject="research-methods" />
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
            <SectionHeading title="Research Methods packages" />
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
            href="/book?subject=research-methods"
            className="inline-block rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2"
          >
            Email to confirm Research Methods availability
          </Link>
        </Container>
      </section>
    </>
  );
}
