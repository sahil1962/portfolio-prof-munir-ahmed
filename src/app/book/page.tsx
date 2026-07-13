import type { Metadata } from "next";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import BookingFlow from "@/components/site/BookingFlow";

export const metadata: Metadata = {
  title: "Book a lesson | Professor Dr Munir Ahmed",
  description: "Book and pay for online Maths tuition, or enquire about Science, A-level Physics and Research Methods. Available Saturdays and Sundays.",
  alternates: { canonical: "/book" },
};

export default function BookPage({
  searchParams,
}: {
  searchParams: Promise<{
    subject?: string;
    format?: string;
    package?: string;
    packageId?: string;
    itemType?: string;
    intent?: string;
    day?: string;
    time?: string;
  }>;
}) {
  return <BookContent searchParams={searchParams} />;
}

async function BookContent({
  searchParams,
}: {
  searchParams: Promise<{
    subject?: string;
    format?: string;
    package?: string;
    packageId?: string;
    itemType?: string;
    intent?: string;
    day?: string;
    time?: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <section className="py-16 md:py-24 bg-bg">
      <Container>
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            title="Book a lesson"
            subtitle="Maths can be booked and paid for online. For Science, A-level Physics and Research Methods, send a quick enquiry and Professor Dr Munir Ahmed will confirm availability before you pay."
          />
          <div className="mt-10">
            <BookingFlow defaultValues={params} />
          </div>
        </div>
      </Container>
    </section>
  );
}
