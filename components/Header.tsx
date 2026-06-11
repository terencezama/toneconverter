"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoAvatar } from "./LogoAvatar";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#converter", label: "Tone Converter" },
  { href: "/originality-checker", label: "AI Checker" },
  { href: "/use-cases", label: "Use Cases" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass-strong sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-white">
          <LogoAvatar size={40} className="shrink-0" />
          <span>
            Tone<span className="text-gradient-live">Converter</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#converter"
            className="btn-gradient rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Convert Tone
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 md:hidden"
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
        <nav className="glass-strong border-x-0 border-b-0 px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
