import { z } from "zod";
import { sessionTimes } from "@/lib/enquiry-schema";
import { getLessonBounds } from "@/lib/pricing-lookup";

// Valid lesson start times (the 8 weekend slots), e.g. "08:00".
const validLessonTimes = new Set(sessionTimes.map((s) => s.value.slice(4)));

// Header-safe text: rejects newlines so values can't smuggle extra headers
// into emails built from raw template literals (e.g. `${name} <${email}>`).
const headerSafeName = z
  .string()
  .min(2, "Please enter your name")
  .max(100, "Name is too long")
  .refine((s) => !/[\r\n]/.test(s), "Name contains invalid characters");

// A single lesson — its own date + time.
const lessonSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().min(1),
});

const baseFields = {
  name:        headerSafeName,
  email:       z.string().email("Please enter a valid email").max(254),
  studentName: z.string().max(100).refine((s) => !/[\r\n]/.test(s), "Invalid characters").optional(),

  lessons: z.array(lessonSchema).min(1, "Please add your lessons").max(10),

  groupSize:  z.coerce.number().int().min(4).max(6).optional(),
  topicList:  z.string().optional(),

  cancellationAck: z.literal(true, { errorMap: () => ({ message: "Please confirm you understand the cancellation policy" }) } as object),
  turnstileToken:  z.string().min(1, "Captcha required"),
};

const sessionItemSchema = z.object({
  ...baseFields,
  itemType: z.literal("session"),
  subject:  z.enum(["maths", "science", "a-level-physics", "research-methods"]),
  level:    z.string().min(1, "Please choose a level"),
  format:   z.string().min(1, "Please choose a format"),
});

const packageItemSchema = z.object({
  ...baseFields,
  itemType:  z.literal("package"),
  packageId: z.string().min(1, "Please choose a package"),
});

export const checkoutSchema = z
  .discriminatedUnion("itemType", [sessionItemSchema, packageItemSchema])
  .superRefine((data, ctx) => {
    const isGroupFormat = data.itemType === "session" && data.format.startsWith("Small group");
    const isGroupPackage = data.itemType === "package" && data.packageId.startsWith("group-");
    if (isGroupFormat || isGroupPackage) {
      if (!data.groupSize) ctx.addIssue({ code: "custom", path: ["groupSize"], message: "Group size required" });
      if (!data.topicList) ctx.addIssue({ code: "custom", path: ["topicList"], message: "Topic list required for group tuition" });
    }

    // How many lessons are required (standard 5–10, exam-prep 1–10, package = exact count).
    const bounds = getLessonBounds({
      itemType: data.itemType,
      format: data.itemType === "session" ? data.format : undefined,
      packageId: data.itemType === "package" ? data.packageId : undefined,
    });
    if (data.lessons.length < bounds.min) {
      ctx.addIssue({
        code: "custom",
        path: ["lessons"],
        message: bounds.min === bounds.max ? `Please choose exactly ${bounds.min} lessons` : `Please add at least ${bounds.min} lessons`,
      });
    }
    if (data.lessons.length > bounds.max) {
      ctx.addIssue({ code: "custom", path: ["lessons"], message: `You can book at most ${bounds.max} lessons` });
    }

    // Each lesson must be a distinct weekend date + valid time.
    const seen = new Set<string>();
    for (const l of data.lessons) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(l.date)) {
        const dow = new Date(`${l.date}T00:00:00Z`).getUTCDay();
        if (dow !== 0 && dow !== 6) {
          ctx.addIssue({ code: "custom", path: ["lessons"], message: "Lessons must be on a Saturday or Sunday" });
        }
      }
      if (!validLessonTimes.has(l.time)) {
        ctx.addIssue({ code: "custom", path: ["lessons"], message: "Invalid lesson time" });
      }
      const key = `${l.date}|${l.time}`;
      if (seen.has(key)) {
        ctx.addIssue({ code: "custom", path: ["lessons"], message: "Each lesson must be a different date and time" });
      }
      seen.add(key);
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
