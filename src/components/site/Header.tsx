"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Container from "./Container";
import ThemeToggle from "./ThemeToggle";

const subjectLinks = [
  { href: "/subjects/maths", label: "Maths" },
  { href: "/subjects/science", label: "Science" },
  { href: "/subjects/a-level-physics", label: "A-level Physics" },
  { href: "/subjects/research-methods", label: "Research Methods" },
];

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/packages", label: "Packages" },
  { href: "/schedule", label: "Schedule" },
  { href: "/testimonials", label: "Testimonials" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const subjectsRef = useRef<HTMLDivElement>(null);

  // Close the Subjects dropdown on outside click / Escape.
  useEffect(() => {
    if (!subjectsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!subjectsRef.current?.contains(e.target as Node)) setSubjectsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSubjectsOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [subjectsOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-surface/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="font-heading text-lg font-semibold text-primary-fg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg rounded"
          >
            Professor Dr Munir Ahmed
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6">
            <Link
              href="/about"
              className="whitespace-nowrap text-sm font-medium text-ink-muted hover:text-primary-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg rounded"
            >
              About
            </Link>

            {/* Subjects dropdown */}
            <div className="relative" ref={subjectsRef}>
              <button
                type="button"
                onClick={() => setSubjectsOpen((o) => !o)}
                aria-expanded={subjectsOpen}
                aria-haspopup="true"
                className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-ink-muted hover:text-primary-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg rounded"
              >
                Subjects
                <ChevronDown size={14} className={`transition-transform ${subjectsOpen ? "rotate-180" : ""}`} />
              </button>
              {subjectsOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 overflow-hidden rounded-lg border border-brand-border bg-surface py-1 shadow-lg">
                  {subjectLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSubjectsOpen(false)}
                      className="block px-4 py-2 text-sm text-ink-muted hover:bg-surface-2 hover:text-primary-fg transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm font-medium text-ink-muted hover:text-primary-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg rounded"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <Link
              href="/book"
              className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg focus-visible:ring-offset-2"
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
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-2 hover:text-primary-fg transition-colors"
              >
                About
              </Link>

              <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted/70">Subjects</p>
              {subjectLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 pl-6 text-sm font-medium text-ink-muted hover:bg-surface-2 hover:text-primary-fg transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-1 flex flex-col gap-1">
                {navLinks.slice(1).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-2 hover:text-primary-fg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

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
