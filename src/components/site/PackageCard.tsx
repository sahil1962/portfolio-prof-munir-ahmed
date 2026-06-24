import Link from "next/link";
import type { Package } from "@/content/packages";
import { isInstantBookablePackage } from "@/lib/pricing-lookup";

interface PackageCardProps {
  pkg: Package;
}

const levelColors: Record<string, string> = {
  GCSE: "bg-blue-50 text-blue-700",
  "A-level": "bg-purple-50 text-purple-700",
  Research: "bg-amber-50 text-amber-700",
  Group: "bg-green-50 text-green-700",
};

export default function PackageCard({ pkg }: PackageCardProps) {
  return (
    <div className="rounded-xl border border-brand-border bg-surface p-6 flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-heading text-lg font-semibold text-ink">{pkg.name}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${levelColors[pkg.level] ?? "bg-gray-100 text-gray-700"}`}>
          {pkg.level}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-muted">Suitable for: {pkg.suitableFor}</p>
      <p className="mt-1 text-sm text-ink-muted">{pkg.structure}</p>
      <p className="mt-4 text-2xl font-bold text-primary-fg font-heading">{pkg.fee}</p>
      {isInstantBookablePackage(pkg) ? (
        <div className="mt-auto pt-5 space-y-2">
          <Link
            href={`/book?itemType=package&packageId=${pkg.id}&intent=pay`}
            className="block rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg"
          >
            Book &amp; pay
          </Link>
          <Link
            href={`/book?package=${pkg.id}&intent=enquire`}
            className="block rounded-lg border border-primary-fg px-4 py-2 text-center text-sm font-medium text-primary-fg hover:bg-primary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg"
          >
            Ask a question first
          </Link>
        </div>
      ) : (
        <div className="mt-auto pt-5 space-y-2">
          <Link
            href={`/book?package=${pkg.id}&intent=enquire`}
            className="block rounded-lg bg-accent px-4 py-2 text-center text-sm font-medium text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg"
          >
            Email to confirm availability
          </Link>
          <p className="text-center text-xs text-ink-muted">Available on request — pay once Dr Ahmed confirms.</p>
        </div>
      )}
    </div>
  );
}
