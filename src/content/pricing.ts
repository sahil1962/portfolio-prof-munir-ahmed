export type Format =
  | "1-to-1 online"
  | "Small group, 4–6 students"
  | "Intensive 1-to-1 revision"
  | "1-to-1 or small group";

export type PricingRow = {
  level: string;
  subjects?: string;
  format: Format;
  fee: string;
  /** Amount in pence charged per hour (or per student per hour for group formats). */
  unitAmountPence: number;
};

export const mathsPricing: PricingRow[] = [
  { level: "KS2 Maths",      format: "1-to-1 online",              fee: "£40/hour",          unitAmountPence: 4000 },
  { level: "KS2 Maths",      format: "Small group, 4–6 students",  fee: "£10/student/hour",  unitAmountPence: 1000 },
  { level: "KS3 Maths",      format: "1-to-1 online",              fee: "£50/hour",          unitAmountPence: 5000 },
  { level: "KS3 Maths",      format: "Small group, 4–6 students",  fee: "£15/student/hour",  unitAmountPence: 1500 },
  { level: "GCSE Maths",     format: "1-to-1 online",              fee: "£60/hour",          unitAmountPence: 6000 },
  { level: "GCSE Maths",     format: "Small group, 4–6 students",  fee: "£20/student/hour",  unitAmountPence: 2000 },
  { level: "A-level Maths",  format: "1-to-1 online",              fee: "£80/hour",          unitAmountPence: 8000 },
  { level: "A-level Maths",  format: "Small group, 4–6 students",  fee: "£25/student/hour",  unitAmountPence: 2500 },
  { level: "GCSE Maths Exam Preparation",    format: "Intensive 1-to-1 revision",  fee: "£70/hour",   unitAmountPence: 7000 },
  { level: "A-level Maths Exam Preparation", format: "Intensive 1-to-1 revision",  fee: "£100/hour",  unitAmountPence: 10000 },
];

export const sciencePricing: PricingRow[] = [
  { level: "KS2 Science",   subjects: "General Science",                                  format: "1-to-1 online",             fee: "£40/hour",         unitAmountPence: 4000 },
  { level: "KS2 Science",   subjects: "General Science",                                  format: "Small group, 4–6 students", fee: "£10/student/hour", unitAmountPence: 1000 },
  { level: "KS3 Science",   subjects: "Biology, Chemistry, Physics",                      format: "1-to-1 online",             fee: "£50/hour",         unitAmountPence: 5000 },
  { level: "KS3 Science",   subjects: "Biology, Chemistry, Physics",                      format: "Small group, 4–6 students", fee: "£15/student/hour", unitAmountPence: 1500 },
  { level: "GCSE Science",  subjects: "Biology, Chemistry, Physics / Combined Science",   format: "1-to-1 online",             fee: "£60/hour",         unitAmountPence: 6000 },
  { level: "GCSE Science",  subjects: "Biology, Chemistry, Physics / Combined Science",   format: "Small group, 4–6 students", fee: "£20/student/hour", unitAmountPence: 2000 },
  { level: "GCSE Science Exam Preparation", subjects: "Biology, Chemistry, Physics",       format: "Intensive 1-to-1 revision", fee: "£70/hour",         unitAmountPence: 7000 },
];

export const physicsPricing: PricingRow[] = [
  { level: "A-level Physics",                          format: "1-to-1 online",             fee: "£100/hour", unitAmountPence: 10000 },
  { level: "A-level Physics",                          format: "Small group, 4–6 students", fee: "£30/student/hour", unitAmountPence: 3000 },
  { level: "A-level Physics Exam Preparation",         format: "Intensive 1-to-1 revision", fee: "£120/hour", unitAmountPence: 12000 },
  { level: "A-level Physics Practical Skills Support", format: "1-to-1 or small group",     fee: "£85/hour", unitAmountPence: 8500 },
];

export type ResearchPricingRow = {
  level: string;
  suitableFor: string;
  format: Format;
  fee: string;
  unitAmountPence: number;
};

export const researchPricing: ResearchPricingRow[] = [
  { level: "Undergraduate Research Methods", suitableFor: "Dissertation/project support",                                        format: "1-to-1 online",             fee: "£80/hour",         unitAmountPence: 8000 },
  { level: "MSc Research Methods",           suitableFor: "Proposal, dissertation and methodology support",                      format: "1-to-1 online",             fee: "£100/hour",        unitAmountPence: 10000 },
  { level: "PhD/DProf Research Methods",     suitableFor: "Proposal, methodology, mixed methods and supervision-style support",  format: "1-to-1 online",             fee: "£120/hour",        unitAmountPence: 12000 },
  { level: "Research Methods Group Class",   suitableFor: "MSc/PhD/DProf students",                                              format: "Small group, 4–6 students", fee: "£50/student/hour", unitAmountPence: 5000 },
];
