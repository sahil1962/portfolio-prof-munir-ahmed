import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import CTA from "@/components/site/CTA";
import { tutorIntroParagraphs, cancellationPolicy } from "@/content/copy";
import { groupConditions } from "@/content/groupConditions";

export const metadata: Metadata = {
  title: "Group Tuition | Professor Dr Munir Ahmed",
  description:
    "Affordable small-group tuition for GCSE, A-level and Research Methods. Groups of 4–6 students. From £10 per student per hour.",
  alternates: { canonical: "/group-tuition" },
};

export default function GroupTuitionPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-bg">
        <Container>
          <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">Group tuition</h1>

          <div className="mt-6 max-w-3xl space-y-4">
            <p className="text-ink-muted leading-relaxed">{tutorIntroParagraphs[2]}</p>
            <p className="text-ink-muted leading-relaxed">{tutorIntroParagraphs[5]}</p>
          </div>

          {/* Worked example callout */}
          <div className="mt-8 rounded-xl border-l-4 border-accent bg-accent/5 p-5 max-w-xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wide">Example</p>
            <p className="mt-2 text-ink-muted leading-relaxed">
              A group of 4–6 GCSE students booking the 10-lesson Small Group GCSE Package pays{" "}
              <strong className="text-ink">£175 per student total</strong> — cheaper than the £20/student/hour
              standard small-group rate (£200 per student over 10 lessons). One nominated group member pays the
              full group total at checkout and settles shares with the rest of the group separately.
            </p>
          </div>

          <p className="mt-6 max-w-xl text-sm text-accent">{cancellationPolicy}</p>
        </Container>
      </section>

      <section className="py-12 bg-surface">
        <Container>
          <SectionHeading title="Group tuition requirements" />
          <dl className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {groupConditions.map((cond) => (
              <div key={cond.requirement} className="rounded-xl border border-brand-border bg-bg p-5">
                <dt className="font-semibold text-ink">{cond.requirement}</dt>
                <dd className="mt-2 text-sm text-ink-muted leading-relaxed">{cond.details}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-12 bg-bg">
        <Container>
          <Link
            href="/book?format=group"
            className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2"
          >
            Enquire about group tuition
          </Link>
        </Container>
      </section>

      <CTA />
    </>
  );
}
