"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isBefore, isSameDay, isSameMonth, startOfMonth, startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selected?: Date;
  defaultMonth?: Date;
  onSelect?: (date: Date) => void;
  /** Return true to make a day non-selectable (greyed out). */
  disabledDay?: (date: Date) => boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function Calendar({ selected, defaultMonth, onSelect, disabledDay }: CalendarProps) {
  const [month, setMonth] = React.useState(() => startOfMonth(defaultMonth ?? selected ?? new Date()));

  const today = React.useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const canGoPrev = isBefore(startOfMonth(today), startOfMonth(month));

  return (
    <div className="w-64 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          disabled={!canGoPrev}
          onClick={() => setMonth(addMonths(month, -1))}
          className="rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeftIcon size={18} />
        </button>
        <span className="text-sm font-medium text-ink">{format(month, "MMMM yyyy")}</span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setMonth(addMonths(month, 1))}
          className="rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-2"
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-center text-xs font-medium text-ink-muted">{w}</div>
        ))}
        {days.map((day) => {
          const outside = !isSameMonth(day, month);
          const disabled = disabledDay?.(day) ?? false;
          const isSel = selected ? isSameDay(day, selected) : false;
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(day)}
              className={cn(
                "mx-auto flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors",
                isSel
                  ? "bg-primary font-medium text-white hover:bg-primary-hover"
                  : disabled
                    ? "pointer-events-none text-ink-muted/30"
                    : cn("text-ink hover:bg-surface-2", outside && "text-ink-muted/50"),
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
