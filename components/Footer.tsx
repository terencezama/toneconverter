import Link from "next/link";
import { USE_CASES } from "@/lib/use-cases";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto grid max-w-[1160px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Link href="/" className="mb-4 flex items-center gap-2.5">
            <span className="inline-block h-[11px] w-[11px] rounded-full bg-accent" />
            <span className="font-serif text-[26px] leading-none text-ink">Poise</span>
          </Link>
          <p className="m-0 max-w-[38ch] text-[15px] leading-relaxed text-ink-soft">
            Rewrite angry, casual, or messy drafts into clear, professional
            messages. Write it raw. Send it with poise.
          </p>
        </div>

        <div>
          <p className="eyebrow-sm mb-4 text-ink-soft">Product</p>
          <div className="flex flex-col gap-[11px]">
            <Link href="/#converter" className="text-[15px] text-ink hover:text-accent">
              Converter
            </Link>
            <Link href="/originality-checker" className="text-[15px] text-ink hover:text-accent">
              AI checker
            </Link>
            <Link href="/#pricing" className="text-[15px] text-ink hover:text-accent">
              Pricing
            </Link>
            <Link href="/#faq" className="text-[15px] text-ink hover:text-accent">
              FAQ
            </Link>
          </div>
        </div>

        <div>
          <p className="eyebrow-sm mb-4 text-ink-soft">Free tools</p>
          <div className="flex flex-col gap-[11px]">
            {USE_CASES.slice(0, 6).map((useCase) => (
              <Link
                key={useCase.slug}
                href={`/${useCase.slug}`}
                className="text-[15px] text-ink hover:text-accent"
              >
                {useCase.navLabel}
              </Link>
            ))}
            <Link href="/use-cases" className="text-[15px] text-ink-soft hover:text-ink">
              All tools
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1160px] px-5 pb-10 text-[13px] leading-none text-ink-soft sm:px-8">
        © {new Date().getFullYear()} Poise. Formerly Tone Converter.
      </div>
    </footer>
  );
}
