import Link from "next/link";
import { Mail } from "lucide-react";

interface ByRequestNoticeProps {
  subject: string;
  subjectLabel: string;
}

export default function ByRequestNotice({ subject, subjectLabel }: ByRequestNoticeProps) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4">
      <Mail size={18} className="mt-0.5 shrink-0 text-accent" />
      <div className="text-sm">
        <p className="font-medium text-ink">{subjectLabel} tuition is available on request.</p>
        <p className="mt-1 text-ink-muted">
          Please email to confirm availability before booking — once Professor Dr Munir Ahmed confirms, you&apos;ll be able to book and pay.{" "}
          <Link href={`/book?subject=${subject}&intent=enquire`} className="font-medium text-accent underline hover:no-underline">
            Email to confirm availability
          </Link>
        </p>
      </div>
    </div>
  );
}
