"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { TestimonialTag } from "@/content/testimonials";

interface TestimonialsFilterProps {
  tags: TestimonialTag[];
  current: string;
}

export default function TestimonialsFilter({ tags, current }: TestimonialsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function select(tag: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag === "" || tag === current) {
      params.delete("tag");
    } else {
      params.set("tag", tag);
    }
    router.push(`/testimonials?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by subject">
      <button
        onClick={() => select("")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg ${
          !current ? "bg-primary text-white" : "border border-brand-border bg-surface text-ink-muted hover:border-primary-fg"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => select(tag)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg ${
            current === tag
              ? "bg-primary text-white"
              : "border border-brand-border bg-surface text-ink-muted hover:border-primary-fg"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
