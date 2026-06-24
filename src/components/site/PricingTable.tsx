import Link from "next/link";
import type { PricingRow, ResearchPricingRow } from "@/content/pricing";
import { isInstantBookableSubject } from "@/lib/pricing-lookup";

type AnyRow = PricingRow | ResearchPricingRow;

function isResearchRow(row: AnyRow): row is ResearchPricingRow {
  return "suitableFor" in row;
}

interface PricingTableProps {
  rows: AnyRow[];
  showSubjects?: boolean;
  /** When provided, adds a per-row action: "Pay now" for instantly bookable subjects, otherwise "Email to confirm". */
  subject?: "maths" | "science" | "a-level-physics" | "research-methods";
}

function payNowHref(subject: PricingTableProps["subject"], row: AnyRow) {
  const params = new URLSearchParams({
    itemType: "session",
    subject: subject ?? "",
    level: row.level,
    format: row.format,
    intent: "pay",
  });
  return `/book?${params.toString()}`;
}

function enquireHref(subject: PricingTableProps["subject"]) {
  return `/book?subject=${subject ?? ""}&intent=enquire`;
}

function RowAction({ subject, row, className }: { subject: PricingTableProps["subject"]; row: AnyRow; className?: string }) {
  if (!subject) return null;
  if (isInstantBookableSubject(subject)) {
    return (
      <Link href={payNowHref(subject, row)} className={`font-medium text-primary-fg underline hover:no-underline ${className ?? ""}`}>
        Pay now
      </Link>
    );
  }
  return (
    <Link href={enquireHref(subject)} className={`font-medium text-accent underline hover:no-underline whitespace-nowrap ${className ?? ""}`}>
      Email to confirm
    </Link>
  );
}

export default function PricingTable({ rows, showSubjects = false, subject }: PricingTableProps) {
  const hasSubjects = showSubjects && rows.some((r) => "subjects" in r && (r as PricingRow).subjects);
  const hasResearch = rows.some(isResearchRow);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-brand-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-ink">Level</th>
              {hasSubjects && <th scope="col" className="px-4 py-3 text-left font-semibold text-ink">Subjects</th>}
              {hasResearch && <th scope="col" className="px-4 py-3 text-left font-semibold text-ink">Suitable for</th>}
              <th scope="col" className="px-4 py-3 text-left font-semibold text-ink">Format</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-ink">Fee</th>
              {subject && <th scope="col" className="px-4 py-3 text-right font-semibold text-ink" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {rows.map((row, i) => (
              <tr key={i} className="bg-surface hover:bg-bg transition-colors">
                <td className="px-4 py-3 font-medium text-ink">{row.level}</td>
                {hasSubjects && (
                  <td className="px-4 py-3 text-ink-muted">{"subjects" in row ? (row as PricingRow).subjects ?? "—" : "—"}</td>
                )}
                {hasResearch && (
                  <td className="px-4 py-3 text-ink-muted">{isResearchRow(row) ? row.suitableFor : "—"}</td>
                )}
                <td className="px-4 py-3 text-ink-muted">{row.format}</td>
                <td className="px-4 py-3 text-right font-semibold text-primary-fg">{row.fee}</td>
                {subject && (
                  <td className="px-4 py-3 text-right">
                    <RowAction subject={subject} row={row} className="text-sm" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards grouped by level */}
      <div className="md:hidden space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            role="group"
            aria-labelledby={`pricing-level-${i}`}
            className="rounded-xl border border-brand-border bg-surface p-4"
          >
            <p id={`pricing-level-${i}`} className="font-semibold text-ink">{row.level}</p>
            {hasSubjects && "subjects" in row && (row as PricingRow).subjects && (
              <p className="mt-1 text-sm text-ink-muted">{(row as PricingRow).subjects}</p>
            )}
            {isResearchRow(row) && (
              <p className="mt-1 text-sm text-ink-muted">{row.suitableFor}</p>
            )}
            <p className="mt-1 text-sm text-ink-muted">{row.format}</p>
            <p className="mt-2 text-lg font-bold text-primary-fg">{row.fee}</p>
            {subject && (
              <RowAction subject={subject} row={row} className="mt-2 inline-block text-sm" />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
