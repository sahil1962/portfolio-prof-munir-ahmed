import Link from "next/link";
import type { ScheduleSlot } from "@/content/schedule";
import { cn } from "@/lib/utils";

interface ScheduleTableProps {
  slots: ScheduleSlot[];
  day: "saturday" | "sunday";
}

export default function ScheduleTable({ slots, day }: ScheduleTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-brand-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-2">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-ink">Time</th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-ink">Session</th>
            <th scope="col" className="hidden md:table-cell px-4 py-3 text-left font-semibold text-ink">Details</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-ink">Book</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {slots.map((slot, i) => (
            <tr
              key={i}
              className={cn(
                "bg-surface transition-colors",
                !slot.bookable && "opacity-50",
                slot.bookable && "hover:bg-bg"
              )}
            >
              <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{slot.time}</td>
              <td className="px-4 py-3 text-ink-muted">{slot.session}</td>
              <td className="hidden md:table-cell px-4 py-3 text-ink-muted">{slot.note}</td>
              <td className="px-4 py-3 text-right">
                {slot.bookable ? (
                  <Link
                    href={`/book?day=${day}&time=${slot.time.split("–")[0]}`}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-1"
                  >
                    Request
                  </Link>
                ) : (
                  <span className="text-xs text-ink-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
