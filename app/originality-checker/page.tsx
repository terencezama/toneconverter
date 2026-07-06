import type { Metadata } from "next";
import Link from "next/link";
import { OriginalityChecker } from "@/components/OriginalityChecker";

export const metadata: Metadata = {
  title: "AI Originality Checker | Detect AI-Written and Generic Text",
  description:
    "Free AI originality checker. Paste any text to score AI-likelihood and originality, with flagged passages explaining what gives it away.",
  alternates: { canonical: "/originality-checker" },
};

export default function OriginalityCheckerPage() {
  return (
    <>
      <div className="mood-glow" aria-hidden />
      <section className="relative z-[1]">
        <div className="mx-auto max-w-[1160px] px-5 pb-16 pt-14 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow text-accent">AI originality checker</span>
            <h1
              className="mb-0 mt-4 font-serif text-ink"
              style={{
                fontSize: "clamp(34px, 5vw, 56px)",
                lineHeight: 1.02,
                letterSpacing: "-0.01em",
                textWrap: "balance",
              }}
            >
              Does your text sound{" "}
              <em className="italic text-accent">like a robot</em>?
            </h1>
            <p className="mx-auto mb-0 mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
              Paste any text and Poise scores how AI-generated it reads, how
              original it is, and highlights exactly which passages give it
              away.
            </p>
          </div>
          <div className="mt-10">
            <OriginalityChecker />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 pb-24 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              num: "01",
              title: "AI-likelihood score",
              body: "Detects the telltale rhythm of machine writing: uniform sentences, hedging filler, stock transitions, and the absence of a human voice.",
            },
            {
              num: "02",
              title: "Originality score",
              body: "Measures how distinctive your writing is versus generic boilerplate anyone could have produced.",
            },
            {
              num: "03",
              title: "Flagged passages",
              body: "See which sentences read as AI patterns or boilerplate, then fix them with the converter.",
            },
          ].map((item) => (
            <div key={item.num} className="surface rounded-2xl p-6">
              <span className="font-mono text-[11px] font-medium leading-none tracking-[0.1em] text-accent">
                {item.num}
              </span>
              <h2 className="mb-2.5 mt-4 font-serif text-[21px] leading-tight text-ink">
                {item.title}
              </h2>
              <p className="m-0 text-sm leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/#converter"
            className="text-[15px] font-semibold text-accent hover:text-accent-strong"
          >
            Fix flagged text with the converter →
          </Link>
        </div>
      </section>
    </>
  );
}
