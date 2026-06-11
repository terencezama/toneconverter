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
      <section id="converter">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="glass mx-auto mb-5 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-300">
              The emotion-aware writing assistant
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Your words have a <span className="text-gradient-live">feeling</span>.
              <br />
              We can see it.
            </h1>
            <p className="mt-5 text-lg text-zinc-300">
              Paste anything — the page reads the emotion in your writing and the
              world around it reacts. Then convert angry, casual, or messy text into
              clear, polite, professional messages instantly.
            </p>
            <p className="mt-2 text-sm font-semibold text-gradient">
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
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Convert Angry Messages into Professional Text",
              body: "Messages written in anger can damage relationships, offend clients, and create unnecessary conflict. Paste your frustrated draft and Tone Converter rewrites it into calm, polite, professional language — without losing the point you wanted to make.",
              href: "/angry-to-professional",
              cta: "Try the Angry to Professional Converter",
            },
            {
              title: "Rewrite Casual Text into Formal Communication",
              body: "Turn relaxed, informal writing into business-ready communication. Perfect for emails, job applications, official requests, and any message where a professional first impression matters.",
              href: "/casual-to-formal",
              cta: "Try the Casual to Formal Converter",
            },
            {
              title: "Make Messy Sentences Clear and Easy to Understand",
              body: "Rushed, rambling, or confusing text creates misunderstandings and follow-up questions. The clarity mode restructures your writing so your main point comes through immediately.",
              href: "/sentence-clarifier",
              cta: "Try the Sentence Clarifier",
            },
            {
              title: "Choose the Right Tone for Every Message",
              body: `Rewrite the same message in different styles — ${TONES.map((t) => t.label.toLowerCase()).join(", ")} — until it sounds exactly the way you intend. The meaning stays the same; only the tone changes.`,
              href: "/message-tone-changer",
              cta: "Try the Message Tone Changer",
            },
          ].map((item) => (
            <div key={item.href} className="glass rounded-3xl p-7">
              <h2 className="text-2xl font-bold text-white">{item.title}</h2>
              <p className="mt-3 leading-relaxed text-zinc-300">{item.body}</p>
              <Link
                href={item.href}
                className="text-gradient-live mt-4 inline-block text-sm font-semibold"
              >
                {item.cta} →
              </Link>
            </div>
          ))}
        </div>

        <div className="glass mt-12 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white">Why Use a Tone Converter?</h2>
          <div className="mt-4 grid gap-6 text-zinc-300 md:grid-cols-3">
            <p className="leading-relaxed">
              <strong className="text-white">Protect relationships.</strong>{" "}
              Messages sent while stressed or frustrated can offend clients and
              colleagues. Rewrite them before you hit send.
            </p>
            <p className="leading-relaxed">
              <strong className="text-white">Save time.</strong> Stop rewriting
              the same email five times. Paste a rough draft, choose a tone, and
              get a polished version in seconds.
            </p>
            <p className="leading-relaxed">
              <strong className="text-white">Sound more human.</strong> Make
              AI-assisted writing sound more natural, clear, and human — the way
              you would actually say it.
            </p>
          </div>
        </div>
      </section>

      {/* Extensions + AI checker teaser */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass relative overflow-hidden rounded-3xl p-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
              style={{ background: "var(--emotion-b)" }}
            />
            <h2 className="text-2xl font-bold text-white">
              Everywhere you write — like Grammarly, but with feelings
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-300">
              The Tone Converter browser extension lives in your email and every
              text field on the web. It senses the emotion of what you paste and
              proposes a better version before you hit send.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-zinc-200">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5">Chrome</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5">Firefox</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5">Safari</span>
            </div>
          </div>

          <div className="glass relative overflow-hidden rounded-3xl p-8">
            <div
              className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
              style={{ background: "var(--emotion-c)" }}
            />
            <h2 className="text-2xl font-bold text-white">AI Originality Checker</h2>
            <p className="mt-3 leading-relaxed text-zinc-300">
              Wondering if a text reads as AI-written or copied boilerplate? Our
              checker scores AI-likelihood and originality, and highlights the
              passages that give it away.
            </p>
            <Link
              href="/originality-checker"
              className="btn-gradient mt-5 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              Check your text
            </Link>
          </div>
        </div>
      </section>

      {/* Use case links */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white">Free Tone Conversion Tools</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((useCase) => (
              <Link
                key={useCase.slug}
                href={`/${useCase.slug}`}
                className="glass rounded-2xl p-4 transition-colors hover:bg-white/10"
              >
                <p className="font-semibold text-white">{useCase.navLabel}</p>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                  {useCase.intro}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-white">
          Frequently Asked Questions
        </h2>
        <div className="mt-6">
          <FaqAccordion items={HOME_FAQ} />
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/faq"
            className="text-gradient-live text-sm font-semibold"
          >
            See all questions →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14">
        <div className="glass mx-auto max-w-3xl rounded-3xl px-4 py-12 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white">
            Ready to fix your next message?
          </h2>
          <p className="mt-3 text-zinc-300">
            Paste a rough message. Choose the tone. Get a better version instantly.
          </p>
          <Link
            href="/#converter"
            className="btn-gradient mt-6 inline-block rounded-xl px-8 py-3 text-base font-semibold"
          >
            Convert Tone
          </Link>
        </div>
      </section>
    </>
  );
}
