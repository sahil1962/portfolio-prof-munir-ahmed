export type ScheduleSlot = {
  time: string;
  session: string;
  bookable: boolean;
  note?: string;
};

const slots: ScheduleSlot[] = [
  { time: "08:00–09:00", session: "Session 1",          bookable: true,  note: "1-to-1 or small group tuition" },
  { time: "09:00–10:00", session: "Session 2",          bookable: true,  note: "1-to-1 or small group tuition" },
  { time: "10:00–10:15", session: "Short Break",        bookable: false, note: "No booking" },
  { time: "10:15–11:15", session: "Session 3",          bookable: true,  note: "1-to-1 or small group tuition" },
  { time: "11:15–12:15", session: "Session 4",          bookable: true,  note: "1-to-1 or small group tuition" },
  { time: "12:15–13:00", session: "Lunch/Prayer Break", bookable: false, note: "No booking" },
  { time: "13:00–14:00", session: "Session 5",          bookable: true,  note: "1-to-1 or small group tuition" },
  { time: "14:00–15:00", session: "Session 6",          bookable: true,  note: "1-to-1 or small group tuition" },
  { time: "15:00–15:15", session: "Short Break",        bookable: false, note: "No booking" },
  { time: "15:15–16:15", session: "Session 7",          bookable: true,  note: "1-to-1 or small group tuition" },
  { time: "16:15–17:15", session: "Session 8",          bookable: true,  note: "1-to-1 or small group tuition" },
];

export const saturdaySchedule = slots;
export const sundaySchedule = slots;
