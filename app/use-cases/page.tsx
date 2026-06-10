import type { Metadata } from "next";
import Link from "next/link";
import { USE_CASES } from "@/lib/use-cases";

export const metadata: Metadata = {
  title: "Use Cases — Tone Conversion Tools for Every Message",
  description:
    "Explore all Tone Converter use cases: angry to professional, casual to formal, sentence clarifier, email tone converter, and more free tools.",
  alternates: { canonical: "/use-cases" },
};

export default function UseCasesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          Tone Converter Use Cases
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Whatever you need to say, there&apos;s a tone for it. Pick the tool
          that matches your situation.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((useCase) => (
          <Link
            key={useCase.slug}
            href={`/${useCase.slug}`}
            className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
          >
            <h2 className="text-lg font-bold text-zinc-900">{useCase.navLabel}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">
              {useCase.intro}
            </p>
            <span className="mt-4 text-sm font-semibold text-indigo-600">
              Open tool →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-block rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Open the full Tone Converter
        </Link>
      </div>
    </section>
  );
}
