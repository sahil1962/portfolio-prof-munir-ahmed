import type { Metadata } from "next";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Dr Munir Ahmed",
  description: "Get in touch with Dr Munir Ahmed about tuition enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="py-16 md:py-24 bg-bg">
      <Container>
        <SectionHeading
          title="Contact"
          subtitle="To enquire about tuition, please use the booking form or send an email."
        />
        <div className="mt-10 flex flex-col sm:flex-row gap-6">
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2"
          >
            Book / enquire online
          </Link>
          <a
            href="mailto:enquiries@munirahmedtuition.com"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-border bg-surface px-6 py-3 font-medium text-ink hover:border-primary-fg hover:text-primary-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg"
          >
            <Mail size={16} />
            Send an email
          </a>
        </div>
      </Container>
    </section>
  );
}
