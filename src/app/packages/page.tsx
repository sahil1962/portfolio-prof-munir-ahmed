import type { Metadata } from "next";
import PackageCard from "@/components/site/PackageCard";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import CTA from "@/components/site/CTA";
import { packages } from "@/content/packages";
import type { Package } from "@/content/packages";
import PackageFilter from "./PackageFilter";

export const metadata: Metadata = {
  title: "Tuition Packages | Dr Munir Ahmed",
  description:
    "GCSE, A-level, Research Methods and group tuition packages. Flexible lesson bundles from £250 per student.",
  alternates: { canonical: "/packages" },
};

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
      <section className="py-16 md:py-24 bg-bg">
        <Container>
          <SectionHeading
            title="Tuition packages"
            subtitle="Flexible lesson bundles designed for GCSE, A-level, research and group learners."
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
