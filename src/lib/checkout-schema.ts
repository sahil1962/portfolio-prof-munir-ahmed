import { z } from "zod";
import { sessionTimes } from "@/lib/enquiry-schema";

const slotValues = sessionTimes.map((s) => s.value) as [string, ...string[]];

const baseFields = {
  name:        z.string().min(2, "Please enter your name"),
  email:       z.string().email("Please enter a valid email"),
  studentName: z.string().optional(),

  slot:      z.enum(slotValues),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a start date"),

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
  quantity: z.coerce.number().int().min(1).max(10),
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
    // A minimum of 5 lessons must be booked for group tuition (packages are already 10 lessons)
    if (isGroupFormat && data.itemType === "session" && data.quantity < 5) {
      ctx.addIssue({ code: "custom", path: ["quantity"], message: "A minimum of 5 lessons must be booked for group tuition" });
    }

    // The first lesson date must fall on the chosen slot's weekend day.
    const expectedDow = data.slot.startsWith("sat") ? 6 : 0; // 6 = Sat, 0 = Sun
    if (/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
      const dow = new Date(`${data.startDate}T00:00:00Z`).getUTCDay();
      if (dow !== expectedDow) {
        ctx.addIssue({ code: "custom", path: ["startDate"], message: `Please choose a ${expectedDow === 6 ? "Saturday" : "Sunday"} date` });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
