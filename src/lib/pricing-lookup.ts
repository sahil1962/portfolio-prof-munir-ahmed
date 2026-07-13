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

/** Exam-prep intensives are booked in smaller numbers (no 5-lesson minimum). */
export function isExamPrepFormat(format: string): boolean {
  return format === "Intensive 1-to-1 revision";
}

/**
 * How many lessons a booking must contain.
 * - Packages: exactly the package's lesson count (e.g. 10).
 * - Exam-prep intensives: 1–10 (book a few before an exam).
 * - Everything else (standard 1-to-1 and group): 5–10.
 */
export function getLessonBounds(opts: {
  itemType: "session" | "package";
  format?: string;
  packageId?: string;
}): { min: number; max: number } {
  if (opts.itemType === "package") {
    const occ = getPackage(opts.packageId ?? "")?.occurrences ?? 10;
    return { min: occ, max: occ };
  }
  if (opts.format && isExamPrepFormat(opts.format)) return { min: 1, max: 10 };
  return { min: 5, max: 10 };
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
