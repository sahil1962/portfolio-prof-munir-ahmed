 import type { Testimonial, TestimonialTag } from "@/content/testimonials";
import { Badge } from "@/components/ui/badge";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <figure className="rounded-xl border border-brand-border bg-surface p-6 flex flex-col">
      <blockquote className="flex-1">
        <p className="text-ink leading-relaxed text-sm">&#8220;{testimonial.quote}&#8221;</p>
      </blockquote>
      <figcaption className="mt-5 border-t border-brand-border pt-4">
        <p className="font-semibold text-ink">{testimonial.author}</p>
        <p className="text-sm text-ink-muted">{testimonial.context}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {testimonial.tags.map((tag: TestimonialTag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-surface-2 text-ink-muted border-0">
              {tag}
            </Badge>
          ))}
        </div>
      </figcaption>
    </figure>
  );
}
 