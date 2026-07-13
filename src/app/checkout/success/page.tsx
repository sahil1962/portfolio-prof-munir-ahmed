import type { Metadata } from "next";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";
import { getStripe } from "@/lib/stripe";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Booking confirmed | Professor Dr Munir Ahmed",
  robots: { index: false },
};

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  return <SuccessContent searchParams={searchParams} />;
}

async function SuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let paid = false;
  let description = "";
  let email = "";

  if (session_id) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      paid = session.payment_status === "paid";
      description = session.metadata?.description ?? "";
      email = session.customer_details?.email ?? session.metadata?.email ?? "";
    } catch {
      paid = false;
    }
  }

  return (
    <section className="py-16 md:py-24 bg-bg">
      <Container>
        <div className="max-w-xl mx-auto text-center">
          {paid ? (
            <>
              <CheckCircle2 size={48} className="mx-auto text-green-600" />
              <SectionHeading title="Booking confirmed" centered className="mt-4" />
              <p className="mt-4 text-ink-muted">
                {description && <>Thank you — your payment for <strong>{description}</strong> was successful.</>}
                {!description && "Thank you — your payment was successful."}
                {" "}A confirmation email with your Zoom link has been sent{email ? ` to ${email}` : ""}.
              </p>
            </>
          ) : (
            <>
              <SectionHeading title="Payment not confirmed" centered />
              <p className="mt-4 text-ink-muted">
                We couldn&apos;t confirm this payment. If you believe this is an error, please contact us.
              </p>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
