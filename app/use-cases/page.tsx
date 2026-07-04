import type { Metadata } from "next";
import Link from "next/link";
import { USE_CASES } from "@/lib/use-cases";

export const metadata: Metadata = {
  title: "Use Cases | Tone Conversion Tools for Every Message",
  description:
    "Explore all Tone Converter use cases: angry to professional, casual to formal, sentence clarifier, email tone converter, and more free tools.",
  alternates: { canonical: "/use-cases" },
};

export default function UseCasesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Tone Converter Use Cases
        </h1>
        <p className="mt-4 text-lg text-zinc-300">
          Whatever you need to say, there&apos;s a tone for it. Pick the tool
          that matches your situation.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((useCase) => (
          <Link
            key={useCase.slug}
            href={`/${useCase.slug}`}
            className="glass flex flex-col rounded-3xl p-6 transition-colors hover:bg-white/10"
          >
            <h2 className="text-lg font-bold text-white">{useCase.navLabel}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-300">
              {useCase.intro}
            </p>
            <span className="text-gradient-live mt-4 text-sm font-semibold">
              Open tool →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="btn-gradient inline-block rounded-xl px-8 py-3 text-base font-semibold"
        >
          Open the full Tone Converter
        </Link>
      </div>
    </section>
  );
}
