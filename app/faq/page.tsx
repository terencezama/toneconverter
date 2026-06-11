import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FAQ_ITEMS } from "@/lib/faq";

export const metadata: Metadata = {
  title: "FAQ — Tone Converter Questions Answered",
  description:
    "Answers to common questions about Tone Converter: what it does, how to convert angry messages into polite ones, make writing clearer, and more.",
  alternates: { canonical: "/faq" },
};

function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <FaqJsonLd />
      <h1 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Frequently Asked Questions
      </h1>
      <p className="mt-4 text-center text-lg text-zinc-300">
        Everything you need to know about Tone Converter.
      </p>
      <div className="mt-10">
        <FaqAccordion items={FAQ_ITEMS} />
      </div>
      <div className="mt-10 text-center">
        <Link
          href="/#converter"
          className="btn-gradient inline-block rounded-xl px-8 py-3 text-base font-semibold"
        >
          Try the Tone Converter
        </Link>
      </div>
    </section>
  );
}
