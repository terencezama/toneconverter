import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FAQ_ITEMS } from "@/lib/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Poise: what it does, how to convert angry messages into polite ones, make writing clearer, and more.",
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
    <section className="mx-auto max-w-[820px] px-5 py-20 sm:px-8">
      <FaqJsonLd />
      <h1
        className="mb-10 mt-0 text-center font-serif text-ink"
        style={{
          fontSize: "clamp(30px, 4vw, 46px)",
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
        }}
      >
        Questions, answered.
      </h1>
      <FaqAccordion items={FAQ_ITEMS} />
      <div className="mt-12 text-center">
        <Link
          href="/#converter"
          className="btn-accent inline-block px-8 py-4 text-base leading-none"
        >
          Convert a message →
        </Link>
      </div>
    </section>
  );
}
