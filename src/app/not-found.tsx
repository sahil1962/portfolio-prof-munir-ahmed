import Link from "next/link";
import Container from "@/components/site/Container";

export default function NotFound() {
  return (
    <section className="py-24 md:py-32 bg-bg">
      <Container>
        <div className="max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">404</p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-ink md:text-5xl">Page not found</h1>
          <p className="mt-4 text-ink-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
          <div className="mt-8">
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
