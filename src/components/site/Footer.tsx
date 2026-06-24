import Link from "next/link";
import Container from "./Container";

const subjectLinks = [
  { href: "/subjects/maths", label: "Maths Tuition" },
  { href: "/subjects/science", label: "Science Tuition" },
  { href: "/subjects/a-level-physics", label: "A-level Physics" },
  { href: "/subjects/research-methods", label: "Research Methods" },
];

const siteLinks = [
  { href: "/about", label: "About" },
  { href: "/packages", label: "Packages" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/schedule", label: "Schedule" },
  { href: "/group-tuition", label: "Group Tuition" },
  { href: "/book", label: "Book a lesson" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-surface mt-auto">
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <p className="font-heading text-lg font-semibold text-primary-fg">Dr Munir Ahmed Tuition</p>
            <p className="mt-2 text-sm text-ink-muted">
              Online tuition in Maths, Science, A-level Physics and Research Methods. Available Saturdays and Sundays.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-ink">Subjects</p>
            <ul className="mt-4 space-y-2">
              {subjectLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted hover:text-primary-fg transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-ink">Site</p>
            <ul className="mt-4 space-y-2">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted hover:text-primary-fg transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-brand-border pt-6 text-center text-xs text-ink-muted">
          &copy; {new Date().getFullYear()} Professor Dr Munir Ahmed. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
