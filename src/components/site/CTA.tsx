import Link from "next/link";
import Container from "./Container";

interface CTAProps {
  title?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function CTA({
  title = "Ready to start?",
  primaryLabel = "Book a lesson",
  primaryHref = "/book",
  secondaryLabel,
  secondaryHref,
}: CTAProps) {
  return (
    <section className="bg-primary py-16 md:py-20">
      <Container className="text-center">
        <h2 className="font-heading text-3xl font-semibold text-white md:text-4xl">{title}</h2>
        <p className="mt-4 text-lg text-white/80">
          Weekend sessions available. Tailored one-to-one or small-group tuition.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href={primaryHref}
            className="rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className="rounded-lg border border-white/40 px-6 py-3 font-medium text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}
