import type { Metadata } from "next";
import PackageCard from "@/components/site/PackageCard";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import PricingTable from "@/components/site/PricingTable";
import CTA from "@/components/site/CTA";
import { packages } from "@/content/packages";
import type { Package } from "@/content/packages";
import { mathsPricing, sciencePricing, physicsPricing, researchPricing } from "@/content/pricing";
import PackageFilter from "./PackageFilter";

export const metadata: Metadata = {
  title: "Pricing & Packages | Dr Munir Ahmed",
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
