import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ToneConverter } from "@/components/ToneConverter";
import { FAQ_ITEMS } from "@/lib/faq";
import { SITE_URL } from "@/lib/site";
import { TONES } from "@/lib/tones";
import { USE_CASES } from "@/lib/use-cases";

export const metadata: Metadata = {
  title:
    "Tone Converter — Convert Angry, Casual or Messy Text into Professional Writing",
  description:
    "Use our free Tone Converter to rewrite angry, casual, messy, or unclear messages into polite, professional, friendly, and clear communication in seconds.",
  alternates: { canonical: "/" },
};

const HOME_FAQ = FAQ_ITEMS.slice(0, 4);

function JsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Tone Converter",
      url: SITE_URL,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      description:
        "Free Tone Converter that rewrites angry, casual, messy, or unclear messages into polite, professional, friendly, and clear communication in seconds.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: HOME_FAQ.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd />

      {/* Hero + tool */}
      <section id="converter" className="bg-gradient-to-b from-indigo-50/60 to-transparent">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
              Tone Converter
            </h1>
            <p className="mt-4 text-lg text-zinc-600">
              Convert angry, casual, messy, or unclear writing into clear,
              polite, professional, and friendly messages instantly.
            </p>
            <p className="mt-2 text-sm font-medium text-indigo-600">
              Write it badly. Send it professionally.
            </p>
          </div>
          <div className="mt-10">
            <ToneConverter />
          </div>
        </div>
      </section>

      {/* SEO sections */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Convert Angry Messages into Professional Text
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              Messages written in anger can damage relationships, offend
              clients, and create unnecessary conflict. Paste your frustrated
              draft and Tone Converter rewrites it into calm, polite,
              professional language — without losing the point you wanted to
              make.
            </p>
            <Link
              href="/angry-to-professional"
              className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Try the Angry to Professional Converter →
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Rewrite Casual Text into Formal Communication
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              Turn relaxed, informal writing into business-ready communication.
              Perfect for emails, job applications, official requests, and any
              message where a professional first impression matters.
            </p>
            <Link
              href="/casual-to-formal"
              className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Try the Casual to Formal Converter →
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Make Messy Sentences Clear and Easy to Understand
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              Rushed, rambling, or confusing text creates misunderstandings and
              follow-up questions. The clarity mode restructures your writing so
              your main point comes through immediately.
            </p>
            <Link
              href="/sentence-clarifier"
              className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Try the Sentence Clarifier →
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Choose the Right Tone for Every Message
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              Rewrite the same message in different styles —{" "}
              {TONES.map((t) => t.label.toLowerCase()).join(", ")} — until it
              sounds exactly the way you intend. The meaning stays the same;
              only the tone changes.
            </p>
            <Link
              href="/message-tone-changer"
              className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Try the Message Tone Changer →
            </Link>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-zinc-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-zinc-900">
            Why Use a Tone Converter?
          </h2>
          <div className="mt-4 grid gap-6 text-zinc-600 md:grid-cols-3">
            <p className="leading-relaxed">
              <strong className="text-zinc-900">Protect relationships.</strong>{" "}
              Messages sent while stressed or frustrated can offend clients and
              colleagues. Rewrite them before you hit send.
            </p>
            <p className="leading-relaxed">
              <strong className="text-zinc-900">Save time.</strong> Stop
              rewriting the same email five times. Paste a rough draft, choose
              a tone, and get a polished version in seconds.
            </p>
            <p className="leading-relaxed">
              <strong className="text-zinc-900">Sound more human.</strong> Make
              AI-assisted writing sound more natural, clear, and human — the
              way you would actually say it.
            </p>
          </div>
        </div>
      </section>

      {/* Use case links */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-zinc-900">
            Free Tone Conversion Tools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((useCase) => (
              <Link
                key={useCase.slug}
                href={`/${useCase.slug}`}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <p className="font-semibold text-zinc-900">{useCase.navLabel}</p>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                  {useCase.intro}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-zinc-900">
          Frequently Asked Questions
        </h2>
        <div className="mt-6">
          <FaqAccordion items={HOME_FAQ} />
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/faq"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            See all questions →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-600 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white">
            Ready to fix your next message?
          </h2>
          <p className="mt-3 text-indigo-100">
            Paste a rough message. Choose the tone. Get a better version
            instantly.
          </p>
          <Link
            href="/#converter"
            className="mt-6 inline-block rounded-xl bg-white px-8 py-3 text-base font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
          >
            Convert Tone
          </Link>
        </div>
      </section>
    </>
  );
}
