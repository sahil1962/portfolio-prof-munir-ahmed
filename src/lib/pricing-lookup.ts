import { mathsPricing, sciencePricing, physicsPricing, researchPricing, type PricingRow, type ResearchPricingRow } from "@/content/pricing";
import { packages, type Package } from "@/content/packages";

const pricingBySubject: Record<string, (PricingRow | ResearchPricingRow)[]> = {
  maths: mathsPricing,
  science: sciencePricing,
  "a-level-physics": physicsPricing,
  "research-methods": researchPricing,
};

export function getPricingRowsForSubject(subject: string): (PricingRow | ResearchPricingRow)[] {
  return pricingBySubject[subject] ?? [];
}

export function getSessionPricing(subject: string, level: string, format: string): PricingRow | ResearchPricingRow | undefined {
  return getPricingRowsForSubject(subject).find((row) => row.level === level && row.format === format);
}

export function getPackage(packageId: string): Package | undefined {
  return packages.find((p) => p.id === packageId);
}

export function isGroupFormat(format: string): boolean {
  return format.startsWith("Small group");
}

export function isGroupPackage(packageId: string): boolean {
  return packageId.startsWith("group-");
}

/**
 * Which subjects can be booked & paid for instantly online.
 * Everything else is "by request": the student emails to confirm availability,
 * Professor Dr Munir Ahmed accepts, and only then takes payment.
 * To activate another subject for instant booking, add it here.
 */
const INSTANT_BOOKABLE_SUBJECTS = new Set<string>(["maths"]);

export function isInstantBookableSubject(subject: string): boolean {
  return INSTANT_BOOKABLE_SUBJECTS.has(subject);
}

/** Packages follow the same rule — only Maths packages are instantly bookable. */
export function isInstantBookablePackage(pkg: Package): boolean {
  return pkg.id.includes("maths");
}
