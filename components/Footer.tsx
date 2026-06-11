import Link from "next/link";
import { Logo } from "@/components/Logo";
import { USE_CASES } from "@/lib/use-cases";

export function Footer() {
  return (
    <footer className="glass-strong mt-auto border-x-0 border-b-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-base font-bold text-white">
            <Logo size={24} className="shrink-0" />
            Tone Converter
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Convert angry, casual, messy, or unclear writing into clear,
            polite, professional communication. Write it badly. Send it
            professionally.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Product</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/#converter" className="text-zinc-400 hover:text-white">
                Tone Converter
              </Link>
            </li>
            <li>
              <Link href="/originality-checker" className="text-zinc-400 hover:text-white">
                AI Originality Checker
              </Link>
            </li>
            <li>
              <Link href="/use-cases" className="text-zinc-400 hover:text-white">
                Use Cases
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-zinc-400 hover:text-white">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-zinc-400 hover:text-white">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-white">Free tools</p>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {USE_CASES.map((useCase) => (
              <li key={useCase.slug}>
                <Link
                  href={`/${useCase.slug}`}
                  className="text-zinc-400 hover:text-white"
                >
                  {useCase.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Tone Converter. All rights reserved.
      </div>
    </footer>
  );
}
