export type Package = {
  id: string;
  name: string;
  suitableFor: string;
  structure: string;
  fee: string;
  level: "GCSE" | "A-level" | "Research" | "Group";
  /** Total price in pence. For level "Group" this is the per-student price — multiply by group size at checkout. */
  amountPence: number;
  /** Number of weekly lessons included in the package. */
  occurrences: number;
};

export const packages: Package[] = [
  { id: "gcse-maths-confidence",  name: "GCSE Maths Confidence Package",     suitableFor: "Students needing regular support",     structure: "10 × 1-hour lessons",       fee: "£500",              level: "GCSE",    amountPence: 50000, occurrences: 10 },
  { id: "gcse-science-support",   name: "GCSE Science Support Package",      suitableFor: "Combined or Triple Science students",  structure: "10 × 1-hour lessons",       fee: "£500",              level: "GCSE",    amountPence: 50000, occurrences: 10 },
  { id: "alevel-maths-support",   name: "A-level Maths Support Package",     suitableFor: "Year 12 or Year 13 students",          structure: "10 × 1-hour lessons",       fee: "£700",              level: "A-level", amountPence: 70000, occurrences: 10 },
  { id: "alevel-physics-support", name: "A-level Physics Support Package",   suitableFor: "Year 12 or Year 13 students",          structure: "10 × 1-hour lessons",       fee: "£900",              level: "A-level", amountPence: 90000, occurrences: 10 },
  { id: "group-gcse",             name: "Small Group GCSE Package",          suitableFor: "4–6 students",                         structure: "10 × 1-hour group lessons", fee: "£175 per student",  level: "Group",   amountPence: 17500, occurrences: 10 },
  { id: "group-alevel",           name: "Small Group A-level Package",       suitableFor: "4–6 students",                         structure: "10 × 1-hour group lessons", fee: "£200 per student",  level: "Group",   amountPence: 20000, occurrences: 10 },
];
