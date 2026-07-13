"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Container from "./Container";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/subjects/maths", label: "Maths" },
  { href: "/subjects/science", label: "Science" },
  { href: "/subjects/a-level-physics", label: "Physics" },
  { href: "/subjects/research-methods", label: "Research Methods" },
  { href: "/packages", label: "Packages" },
  { href: "/schedule", label: "Schedule" },
  { href: "/testimonials", label: "Testimonials" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-surface/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="font-heading text-xl font-semibold text-primary-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg rounded"
          >
            Professor Dr Munir Ahmed
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ink-muted hover:text-primary-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg rounded"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/book"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2"
            >
              Book a lesson
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg p-2 text-ink hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg"
              aria-expanded={open}
              aria-label="Toggle navigation"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-brand-border bg-surface">
          <Container>
            <nav aria-label="Mobile navigation" className="py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-2 hover:text-primary-fg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-hover transition-colors"
              >
                Book a lesson
              </Link>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
