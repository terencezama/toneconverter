import type { Metadata } from "next";
import Link from "next/link";
import { OriginalityChecker } from "@/components/OriginalityChecker";

export const metadata: Metadata = {
  title: "AI Originality Checker — Detect AI-Written and Generic Text",
  description:
    "Free AI originality checker: paste any text to score AI-likelihood and originality, with flagged passages explaining what gives it away.",
  alternates: { canonical: "/originality-checker" },
};

export default function OriginalityCheckerPage() {
  return (
    <>
      <section>
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="glass mx-auto mb-5 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-300">
              AI Originality Checker
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Does your text sound <span className="text-gradient-live">like a robot</span>?
            </h1>
            <p className="mt-5 text-lg text-zinc-300">
              Paste any text and our AI scores how AI-generated it reads, how
              original it is, and highlights exactly which passages give it away.
            </p>
          </div>
          <div className="mt-10">
            <OriginalityChecker />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="glass rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white">AI-likelihood score</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Detects the telltale rhythm of machine writing: uniform sentences,
              hedging filler, stock transitions, and the absence of a human voice.
            </p>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white">Originality score</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Measures how distinctive your writing is versus generic boilerplate
              anyone could have produced.
            </p>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white">Flagged passages</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              See exactly which sentences read as AI patterns or boilerplate — and
              fix them with the{" "}
              <Link href="/#converter" className="text-gradient-live font-semibold">
                Tone Converter
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
