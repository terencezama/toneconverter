"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/#converter", label: "Converter" },
  { href: "/use-cases", label: "Free tools" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav-blur sticky top-0 z-50 border-b border-line">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="inline-block h-[11px] w-[11px] rounded-full bg-accent" />
          <span className="font-serif text-[27px] leading-none tracking-[0.01em] text-ink">
            Poise
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#converter"
            className="btn-ink px-5 py-[11px] text-[15px] leading-none"
          >
            Convert a message
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-ink-soft hover:text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="animate-panel-in border-t border-line bg-paper px-5 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-2.5 text-[15px] font-medium text-ink-soft hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#converter"
            onClick={() => setOpen(false)}
            className="btn-ink mt-2 inline-block px-5 py-[11px] text-[15px] leading-none"
          >
            Convert a message
          </Link>
        </nav>
      )}
    </header>
  );
}
