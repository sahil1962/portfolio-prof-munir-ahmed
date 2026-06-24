import type { Metadata } from "next";
import Container from "@/components/site/Container";
import { cancellationPolicy } from "@/content/copy";

export const metadata: Metadata = {
  title: "Privacy Policy | Dr Munir Ahmed",
  description: "Privacy policy for Dr Munir Ahmed Tuition website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <section className="py-16 md:py-24 bg-bg">
      <Container>
        <article className="prose prose-slate max-w-3xl">
          <h1 className="font-heading text-4xl font-bold text-ink">Privacy Policy</h1>
          <p className="text-ink-muted mt-4">Last updated: June 2026</p>

          <h2 className="font-heading text-2xl font-semibold text-ink mt-10">Who we are</h2>
          <p className="text-ink-muted mt-3 leading-relaxed">
            This website is operated by Professor Dr Munir Ahmed, a private tutor providing online tuition
            in Maths, Science, Physics and Research Methods.
          </p>

          <h2 className="font-heading text-2xl font-semibold text-ink mt-8">What data we collect</h2>
          <p className="text-ink-muted mt-3 leading-relaxed">
            When you submit an enquiry form, we collect your name, email address, phone number (if provided),
            and details about the tuition you are enquiring about. This data is used solely to respond to your
            enquiry and arrange tuition sessions.
          </p>

          <h2 className="font-heading text-2xl font-semibold text-ink mt-8">How we use your data</h2>
          <p className="text-ink-muted mt-3 leading-relaxed">
            Your data is used to respond to your tuition enquiry. We do not share your data with third parties
            except where required to deliver the service (e.g. email delivery via Resend). We do not use your
            data for marketing without your explicit consent.
          </p>

          <h2 className="font-heading text-2xl font-semibold text-ink mt-8">Paid bookings</h2>
          <p className="text-ink-muted mt-3 leading-relaxed">
            If you pay for a session or package, your payment is processed securely by Stripe — we do not store
            your card details. To schedule and run your lessons, your name, email, student name, and chosen
            weekly slot are shared with Google Calendar (to reserve the slot) and Zoom (to create your recurring
            meeting link). {cancellationPolicy}
          </p>

          <h2 className="font-heading text-2xl font-semibold text-ink mt-8">Analytics</h2>
          <p className="text-ink-muted mt-3 leading-relaxed">
            This website uses Plausible Analytics, a privacy-friendly analytics tool that does not use cookies
            and does not collect personally identifiable information. No cookie consent banner is required.
          </p>

          <h2 className="font-heading text-2xl font-semibold text-ink mt-8">Your rights</h2>
          <p className="text-ink-muted mt-3 leading-relaxed">
            Under UK GDPR, you have the right to access, correct, or request deletion of your personal data.
            To exercise these rights, please contact us using the details on the{" "}
            <a href="/contact" className="text-primary-fg hover:underline">contact page</a>.
          </p>

          <h2 className="font-heading text-2xl font-semibold text-ink mt-8">Retention</h2>
          <p className="text-ink-muted mt-3 leading-relaxed">
            Enquiry data is retained only for as long as necessary to fulfil the enquiry and any subsequent
            tuition arrangement.
          </p>
        </article>
      </Container>
    </section>
  );
}
