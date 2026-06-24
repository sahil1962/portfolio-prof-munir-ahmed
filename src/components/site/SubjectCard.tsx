import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SubjectCardProps {
  title: string;
  description: string;
  fromPrice: string;
  href: string;
}

export default function SubjectCard({ title, description, fromPrice, href }: SubjectCardProps) {
  return (
    <div className="group rounded-xl border border-brand-border bg-surface p-6 hover:shadow-md transition-shadow">
      <h3 className="font-heading text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink-muted leading-relaxed">{description}</p>
      <p className="mt-4 text-sm font-semibold text-accent">From {fromPrice}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-fg hover:text-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg rounded"
      >
        Learn more
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
