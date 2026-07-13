import { z } from "zod";
import { tasterSlots } from "@/content/taster";

const tasterSlotValues = tasterSlots.map((s) => s.value) as [string, ...string[]];

// Header-safe text: rejects newlines so values can't smuggle extra email headers.
const headerSafeName = z
  .string()
  .min(2, "Please enter your name")
  .max(100, "Name is too long")
  .refine((s) => !/[\r\n]/.test(s), "Name contains invalid characters");

export const tasterSchema = z
  .object({
    name: headerSafeName,
    email: z.string().email("Please enter a valid email").max(254),
    subject: z.enum(["maths", "science", "a-level-physics", "research-methods"]),
    studentYear: z.string().min(1, "Please indicate year/level").max(80),
    examBoard: z.string().max(120).optional(),
    focus: z.string().min(1, "Please tell us what to focus on").max(2000),

    slot: z.enum(tasterSlotValues, { errorMap: () => ({ message: "Please choose a time" }) }),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date"),

    cancellationAck: z.literal(true, {
      errorMap: () => ({ message: "Please confirm you understand the cancellation policy" }),
    } as object),
    turnstileToken: z.string().min(1, "Captcha required"),
  })
  .superRefine((data, ctx) => {
    // The taster runs on weekends only.
    if (/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
      const dow = new Date(`${data.startDate}T00:00:00Z`).getUTCDay();
      if (dow !== 0 && dow !== 6) {
        ctx.addIssue({ code: "custom", path: ["startDate"], message: "Please choose a Saturday or Sunday" });
      }
    }
  });

export type TasterInput = z.infer<typeof tasterSchema>;
