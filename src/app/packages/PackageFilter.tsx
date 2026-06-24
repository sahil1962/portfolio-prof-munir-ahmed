"use client";

import { useRouter, useSearchParams } from "next/navigation";

const levels = ["All", "GCSE", "A-level", "Research", "Group"] as const;

interface PackageFilterProps {
  current: string;
}

export default function PackageFilter({ current }: PackageFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function select(level: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (level === "All") {
      params.delete("level");
    } else {
      params.set("level", level);
    }
    router.push(`/packages?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by level">
      {levels.map((level) => {
        const isActive = current === level || (level === "All" && current === "All");
        return (
          <button
            key={level}
            onClick={() => select(level)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg ${
              isActive
                ? "bg-primary text-white"
                : "border border-brand-border bg-surface text-ink-muted hover:border-primary-fg hover:text-primary-fg"
            }`}
          >
            {level}
          </button>
        );
      })}
    </div>
  );
}
