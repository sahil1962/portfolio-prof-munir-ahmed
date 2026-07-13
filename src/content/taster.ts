// Initial Assessment & Taster Lesson — a one-off £25 introductory session for new
// students. Its own late weekend slots (taster-only, not part of the regular schedule).

export const TASTER_PRICE_PENCE = 2500;
export const TASTER_PRICE_LABEL = "£25";

/** Taster time slots (weekend, taster-only). Each is a 60-minute session. */
export const tasterSlots = [
  { value: "17:30", endTime: "18:30", label: "17:30 – 18:30" },
  { value: "18:30", endTime: "19:30", label: "18:30 – 19:30" },
] as const;

export type TasterSlotValue = (typeof tasterSlots)[number]["value"];

export function tasterSlotEndTime(time: string): string | undefined {
  return tasterSlots.find((s) => s.value === time)?.endTime;
}

export function tasterSlotLabel(time: string): string {
  return tasterSlots.find((s) => s.value === time)?.label ?? time;
}

export const tasterHeading = "Initial Assessment & Taster Lesson";

export const tasterParagraphs = [
  "New students may book a one-off 60-minute introductory session, consisting of a 30-minute initial assessment and a 30-minute taster lesson.",
  "The assessment helps identify the student's current level, areas of difficulty, learning needs and suitable lesson plan. The taster lesson allows the student to experience Professor Dr Munir Ahmed's teaching style before committing to a lesson package.",
  "Students should provide the topic, exam board or syllabus, and any specific areas of difficulty in advance so that the session can be prepared properly.",
  "This introductory session is available once per student. After the initial assessment and taster lesson, students may continue by booking a minimum package of 5 lessons.",
];
