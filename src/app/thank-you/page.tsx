import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/site/Container";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Enquiry received | Professor Dr Munir Ahmed",
  description: "Your tuition enquiry has been received. Professor Dr Munir Ahmed will reply within 48 hours.",
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <section className="py-24 md:py-32 bg-bg">
      <Container>
        <div className="max-w-lg mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-success/10 p-4 text-success">
              <CheckCircle size={40} />
            </div>
          </div>
          <h1 className="font-heading text-3xl font-bold text-ink md:text-4xl">
            Thanks — we&apos;ve received your enquiry.
          </h1>
          <p className="mt-4 text-lg text-ink-muted">
            Professor Dr Munir Ahmed will reply within 48 hours to confirm availability and next steps.
          </p>
          <div className="mt-10">
            <Link
              href="/"
              className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2"
            >
              Return to home
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
