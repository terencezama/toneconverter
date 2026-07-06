import type { Metadata } from "next";
import Link from "next/link";
import { USE_CASES } from "@/lib/use-cases";

export const metadata: Metadata = {
  title: "Use Cases | Tone Conversion Tools for Every Message",
  description:
    "Explore all Poise tools: angry to professional, casual to formal, sentence clarifier, email tone converter, and more free tools.",
  alternates: { canonical: "/use-cases" },
};

export default function UseCasesPage() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
      <div className="mx-auto mb-11 max-w-2xl text-center">
        <span className="eyebrow text-accent">Free, focused tools</span>
        <h1
          className="mb-0 mt-4 font-serif text-ink"
          style={{
            fontSize: "clamp(30px, 4vw, 46px)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
          }}
        >
          A page for every kind of fix.
        </h1>
        <p className="mb-0 mt-5 text-lg leading-relaxed text-ink-soft">
          Whatever you need to say, there&apos;s a tone for it. Pick the tool
          that matches your situation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {USE_CASES.map((useCase, index) => (
          <Link
            key={useCase.slug}
            href={`/${useCase.slug}`}
            className="surface flex min-h-[172px] flex-col rounded-2xl px-5 pb-6 pt-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent"
          >
            <span className="font-mono text-[11px] font-medium leading-none tracking-[0.1em] text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="mb-2.5 mt-4 font-serif text-[21px] leading-tight text-ink">
              {useCase.navLabel}
            </h2>
            <p className="m-0 mb-4 flex-1 text-sm leading-normal text-ink-soft line-clamp-3">
              {useCase.intro}
            </p>
            <span className="text-sm font-semibold leading-none text-ink">Open →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
