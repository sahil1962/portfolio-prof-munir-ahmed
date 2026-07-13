import type { Metadata } from "next";
import Link from "next/link";
import PackageCard from "@/components/site/PackageCard";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import PricingTable from "@/components/site/PricingTable";
import CTA from "@/components/site/CTA";
import { packages } from "@/content/packages";
import type { Package } from "@/content/packages";
import { mathsPricing, sciencePricing, physicsPricing, researchPricing } from "@/content/pricing";
import { TASTER_PRICE_LABEL } from "@/content/taster";
import PackageFilter from "./PackageFilter";

export const metadata: Metadata = {
  title: "Pricing & Packages | Professor Dr Munir Ahmed",
  description:
    "Per-hour tuition rates and lesson-bundle packages for Maths, Science, A-level Physics and Research Methods. Individual lessons from £40/hour; packages from £175 per student.",
  alternates: { canonical: "/packages" },
};

const perHourRates = [
  { subject: "maths", title: "Maths", rows: mathsPricing, showSubjects: false },
  { subject: "science", title: "Science", rows: sciencePricing, showSubjects: false },
  { subject: "a-level-physics", title: "A-level Physics", rows: physicsPricing, showSubjects: false },
  { subject: "research-methods", title: "Research Methods", rows: researchPricing, showSubjects: true },
] as const;

export default function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  return (
    <PackagesContent searchParams={searchParams} />
  );
}

async function PackagesContent({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;

  const filtered: Package[] = level && level !== "All"
    ? packages.filter((p) => p.level === level)
    : packages;

  return (
    <>
      {/* Per-hour rates — individual lessons */}
      <section className="py-16 md:py-24 bg-bg">
        <Container>
          {/* New-student taster highlight */}
          <div className="mb-12 flex flex-col gap-4 rounded-xl border border-accent/40 bg-accent/5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-heading text-lg font-semibold text-ink">New students: Initial Assessment &amp; Taster Lesson</p>
              <p className="mt-1 text-sm text-ink-muted">
                A one-off 60-minute introductory session — a 30-minute assessment plus a 30-minute taster lesson.
                {" "}{TASTER_PRICE_LABEL}, available once per student.
              </p>
            </div>
            <Link
              href="/taster"
              className="shrink-0 self-start rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2 sm:self-auto"
            >
              Book taster — {TASTER_PRICE_LABEL}
            </Link>
          </div>

          <SectionHeading
            title="Per-hour rates"
            subtitle="Individual lessons billed per hour. Maths can be booked and paid instantly; Science, A-level Physics and Research Methods are available by request — enquire to confirm availability first."
          />
          <div className="mt-10 space-y-12">
            {perHourRates.map((r) => (
              <div key={r.subject}>
                <h3 className="font-heading text-xl font-semibold text-ink">{r.title}</h3>
                <div className="mt-4">
                  <PricingTable rows={r.rows} subject={r.subject} showSubjects={r.showSubjects} />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Bundle packages */}
      <section className="py-16 md:py-24 bg-surface">
        <Container>
          <SectionHeading
            title="Tuition packages"
            subtitle="Flexible lesson bundles designed for GCSE, A-level, research and group learners — cheaper than booking the same lessons individually."
          />
          <div className="mt-8">
            <PackageFilter current={level ?? "All"} />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </Container>
      </section>
      <CTA />
    </>
  );
}
