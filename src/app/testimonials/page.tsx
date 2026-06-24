import type { Metadata } from "next";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import TestimonialCard from "@/components/site/TestimonialCard";
import CTA from "@/components/site/CTA";
import { testimonials } from "@/content/testimonials";
import type { TestimonialTag } from "@/content/testimonials";
import TestimonialsFilter from "./TestimonialsFilter";

export const metadata: Metadata = {
  title: "Student Testimonials | Dr Munir Ahmed",
  description:
    "What students say about Dr Munir Ahmed's tuition. Students from Imperial College, Oxford, Cambridge, UCL, King's College and more.",
  alternates: { canonical: "/testimonials" },
};

export default function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  return <TestimonialsContent searchParams={searchParams} />;
}

async function TestimonialsContent({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;

  const allTags = Array.from(
    new Set(testimonials.flatMap((t) => t.tags))
  ) as TestimonialTag[];

  const filtered = tag
    ? testimonials.filter((t) => t.tags.includes(tag as TestimonialTag))
    : testimonials;

  return (
    <>
      <section className="py-16 md:py-24 bg-bg">
        <Container>
          <SectionHeading title="What students say" />
          <div className="mt-8">
            <TestimonialsFilter tags={allTags} current={tag ?? ""} />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {filtered.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </Container>
      </section>
      <CTA />
    </>
  );
}
