import { z } from "zod";

// Header-safe text: rejects newlines so values can't smuggle extra headers
// into emails built from raw template literals (e.g. `${name} <${email}>`).
const headerSafeName = z
  .string()
  .min(2, "Please enter your name")
  .max(100, "Name is too long")
  .refine((s) => !/[\r\n]/.test(s), "Name contains invalid characters");

export const enquirySchema = z.object({
  name:        headerSafeName,
  email:       z.string().email("Please enter a valid email").max(254),
  phone:       z.string().max(40).optional(),
  studentName: z.string().max(100).refine((s) => !/[\r\n]/.test(s), "Invalid characters").optional(),
  studentYear: z.string().min(1, "Please indicate year/age"),
  subject:     z.enum(["maths", "science", "a-level-physics", "research-methods"]),
  level:       z.string().min(1, "Please choose a level"),
  format:      z.enum(["1-to-1", "group"]),
  package:     z.string().optional(),
  preferredTimes: z.array(z.string()).min(1, "Please pick at least one preferred time"),
  examBoard:   z.string().optional(),
  message:     z.string().max(2000).optional(),

  // Group-only
  groupSize:    z.coerce.number().int().min(4).max(6).optional(),
  groupMembers: z.string().optional(),
  topicList:    z.string().optional(),

  // Consent + spam
  consent:        z.literal(true, { errorMap: () => ({ message: "Please confirm consent" }) } as object),
  turnstileToken: z.string().min(1, "Captcha required"),
}).superRefine((data, ctx) => {
  if (data.format === "group") {
    if (!data.groupSize)  ctx.addIssue({ code: "custom", path: ["groupSize"],  message: "Group size required" });
    if (!data.topicList)  ctx.addIssue({ code: "custom", path: ["topicList"],  message: "Topic list required for group tuition" });
  }
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const levelsBySubject: Record<string, string[]> = {
  "maths":            ["KS2", "KS3", "GCSE", "A-level"],
  "science":          ["KS2", "KS3", "GCSE"],
  "a-level-physics":  ["A-level – Year 12", "A-level – Year 13", "Exam preparation intensive", "Practical skills support"],
  "research-methods": ["Undergraduate", "MSc", "PhD/DProf", "Group class"],
};

export const subjectLabels: Record<string, string> = {
  "maths": "Maths",
  "science": "Science",
  "a-level-physics": "A-level Physics",
  "research-methods": "Research Methods",
};

export const formatLabels: Record<string, string> = {
  "1-to-1": "One-to-one",
  "group": "Small group",
};

export const sessionTimes = [
  { value: "sat-08:00", label: "Sat 08:00" },
  { value: "sat-09:00", label: "Sat 09:00" },
  { value: "sat-10:15", label: "Sat 10:15" },
  { value: "sat-11:15", label: "Sat 11:15" },
  { value: "sat-13:00", label: "Sat 13:00" },
  { value: "sat-14:00", label: "Sat 14:00" },
  { value: "sat-15:15", label: "Sat 15:15" },
  { value: "sat-16:15", label: "Sat 16:15" },
  { value: "sun-08:00", label: "Sun 08:00" },
  { value: "sun-09:00", label: "Sun 09:00" },
  { value: "sun-10:15", label: "Sun 10:15" },
  { value: "sun-11:15", label: "Sun 11:15" },
  { value: "sun-13:00", label: "Sun 13:00" },
  { value: "sun-14:00", label: "Sun 14:00" },
  { value: "sun-15:15", label: "Sun 15:15" },
  { value: "sun-16:15", label: "Sun 16:15" },
];

/** Turn a stored slot value (e.g. "sat-09:00") into its display label ("Sat 09:00"). */
export function slotLabel(value: string): string {
  return sessionTimes.find((s) => s.value === value)?.label ?? value;
}
