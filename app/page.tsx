import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PlanCard } from "@/components/PlanCard";
import { ToneConverter } from "@/components/ToneConverter";
import { FAQ_ITEMS } from "@/lib/faq";
import { PLANS } from "@/lib/pricing";
import { SITE_URL } from "@/lib/site";
import { USE_CASES } from "@/lib/use-cases";

export const metadata: Metadata = {
  title: "Poise | Rewrite Angry or Messy Text into Professional Messages",
  description:
    "Poise reads the heat in your draft and rewrites angry, casual or unclear messages into clear, professional text. Free to try, no account needed.",
  alternates: { canonical: "/" },
};

const HOME_FAQ = FAQ_ITEMS.slice(0, 4);

const TONE_CLOUD = [
  "Professional",
  "Polite",
  "Friendly",
  "Calm",
  "Formal",
  "Casual",
  "Confident",
  "Empathetic",
  "Clearer",
  "Shorter",
];

function JsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Poise",
      alternateName: "Tone Converter",
      url: SITE_URL,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      description:
        "Free tone converter that rewrites angry, casual or unclear messages into clear, professional text.",
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
      <div className="mood-glow" aria-hidden />

      {/* Hero */}
      <section className="relative z-[1] mx-auto max-w-[1160px] px-5 pb-5 pt-12 sm:px-8">
        <div className="fade-up mb-6 flex items-center gap-2.5">
          <span className="inline-block h-px w-[26px] bg-accent" />
          <span className="eyebrow text-accent">The composed writing assistant</span>
        </div>
        <h1
          className="fade-up-1 m-0 max-w-[16ch] font-serif text-ink"
          style={{
            fontSize: "clamp(44px, 7.4vw, 88px)",
            lineHeight: 0.98,
            letterSpacing: "-0.015em",
            textWrap: "balance",
          }}
        >
          Write it raw. Send it with{" "}
          <em className="relative italic text-accent">
            poise
            <svg
              viewBox="0 0 220 22"
              preserveAspectRatio="none"
              className="absolute overflow-visible"
              style={{ left: "-2%", bottom: "-0.16em", width: "104%", height: "0.3em" }}
              aria-hidden
            >
              <path
                d="M3 13 C 55 4, 120 4, 168 9 C 190 11, 205 10, 217 7"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.85"
                style={{
                  strokeDasharray: 240,
                  animation: "drawLine 1s cubic-bezier(.6,.1,.3,1) .5s both",
                }}
              />
            </svg>
          </em>
          .
        </h1>
        <p
          className="fade-up-2 mb-0 mt-6 max-w-[52ch] text-ink-soft"
          style={{ fontSize: "clamp(17px, 2vw, 20px)", lineHeight: 1.62 }}
        >
          <span
            className="float-left pr-3 pt-2 font-serif text-accent"
            style={{ fontSize: 64, lineHeight: 0.72 }}
            aria-hidden
          >
            Y
          </span>
          ou write your best when you feel the most. Poise reads the heat in
          your draft, whether it&apos;s angry, messy, or half-formed, and
          rewrites it into a clear, professional message worth hitting send on.
        </p>
      </section>

      {/* Converter */}
      <section
        id="converter"
        className="fade-up-3 relative z-[1] mx-auto max-w-[1160px] px-5 pb-24 pt-10 sm:px-8"
      >
        <ToneConverter />
      </section>

      {/* The editor's hand */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-[940px] px-5 py-24 sm:px-8">
          <div className="mb-10 flex items-baseline gap-4">
            <span
              className="font-serif italic text-accent"
              style={{ fontSize: "clamp(24px, 3.2vw, 32px)", lineHeight: 1 }}
            >
              The editor&apos;s hand
            </span>
            <span className="h-px flex-1 bg-line" />
            <span className="eyebrow-sm hidden text-ink-soft sm:block" style={{ fontSize: 13, letterSpacing: "0.12em" }}>
              Same meaning, redrawn
            </span>
          </div>
          <div
            className="reveal-view relative rounded-lg border border-line bg-paper px-8 py-12 sm:pl-[74px] sm:pr-[52px]"
            style={{ boxShadow: "0 40px 70px -55px rgba(33,29,23,.55)" }}
          >
            <span
              className="absolute bottom-6 top-6 hidden w-[1.5px] sm:block"
              style={{ left: 44, background: "rgba(177,92,59,.4)" }}
            />
            <span
              className="absolute bottom-6 top-6 hidden w-px sm:block"
              style={{ left: 50, background: "rgba(177,92,59,.16)" }}
            />
            <span className="font-serif text-[17px] italic leading-none text-raw">
              first draft, written at 5:58pm
            </span>
            <p
              className="mb-0 mt-3.5 font-serif text-raw line-through"
              style={{
                fontSize: "clamp(23px, 3.1vw, 32px)",
                lineHeight: 1.5,
                textDecorationColor: "rgba(177,92,59,.5)",
                textDecorationThickness: 2,
              }}
            >
              Are you serious?? This is the THIRD time the report is late and
              nobody bothered to tell me. I&apos;m done covering for this team.
            </p>
            <div className="my-6 flex items-center gap-3.5">
              <span className="font-serif text-[19px] italic leading-none text-ink-soft">
                becomes
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <p
              className="m-0 font-serif text-ink"
              style={{ fontSize: "clamp(23px, 3.1vw, 32px)", lineHeight: 1.5 }}
            >
              I&apos;ve noticed the report has missed its deadline three times
              now, and I wasn&apos;t looped in beforehand. Could we set up a
              quick check-in to fix the handoff? I&apos;d like us to stay ahead
              of this together.
            </p>
          </div>
          <p
            className="mb-0 mt-8 text-right font-serif italic text-ink-soft"
            style={{ fontSize: "clamp(18px, 2.2vw, 22px)", lineHeight: 1.5 }}
          >
            the same point made, none of the burn.
          </p>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-[1160px] px-5 py-24 sm:px-8">
        <div className="reveal-view grid gap-12 md:grid-cols-3">
          {[
            {
              num: "01",
              title: "Protect the relationship",
              body: "The message you send at your angriest is the one people remember. Poise gives you a composed version before the damage is done.",
            },
            {
              num: "02",
              title: "Stop rewriting the same email",
              body: "Paste the rough draft, pick a tone, send. What used to take five nervous rewrites now takes one paste.",
            },
            {
              num: "03",
              title: "Sound like a person",
              body: "No stiff corporate filler. Poise keeps your voice. It just takes the edge off and the mess out.",
            },
          ].map((item) => (
            <div key={item.num}>
              <div className="mb-4 font-serif text-[22px] leading-none text-accent">
                {item.num}
              </div>
              <h3 className="mb-3 mt-0 font-serif text-[25px] leading-tight text-ink">
                {item.title}
              </h3>
              <p className="m-0 text-base leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tones */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1160px] items-center gap-14 px-5 py-24 sm:px-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="eyebrow text-accent">One draft, any register</span>
            <h2
              className="mb-4 mt-4 font-serif text-ink"
              style={{
                fontSize: "clamp(30px, 4vw, 46px)",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              Choose exactly how it should land.
            </h2>
            <p className="m-0 max-w-[44ch] text-[17px] leading-relaxed text-ink-soft">
              The meaning stays fixed. Only the temperature changes, from warm
              and human to crisp and formal.
            </p>
          </div>
          <div className="reveal-view flex flex-wrap gap-3">
            {TONE_CLOUD.map((tag) => (
              <span
                key={tag}
                className="surface rounded-full px-5 py-3.5 text-[17px] font-medium leading-none text-ink"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Free tools */}
      <section id="tools" className="border-y border-line bg-card">
        <div className="mx-auto max-w-[1160px] px-5 py-24 sm:px-8">
          <div className="mb-11">
            <span className="eyebrow text-accent">Free, focused tools</span>
            <h2
              className="mb-0 mt-4 font-serif text-ink"
              style={{
                fontSize: "clamp(30px, 4vw, 46px)",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              A page for every kind of fix.
            </h2>
          </div>
          <div className="reveal-view grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((useCase, index) => (
              <Link
                key={useCase.slug}
                href={`/${useCase.slug}`}
                className="flex min-h-[172px] flex-col rounded-2xl border border-line bg-paper px-5 pb-6 pt-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent"
                style={{ transitionTimingFunction: "cubic-bezier(.22,.7,.24,1)" }}
              >
                <span className="font-mono text-[11px] font-medium leading-none tracking-[0.1em] text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mb-2.5 mt-4 font-serif text-[21px] leading-tight text-ink">
                  {useCase.navLabel}
                </h3>
                <p className="m-0 mb-4 flex-1 text-sm leading-normal text-ink-soft line-clamp-3">
                  {useCase.intro}
                </p>
                <span className="text-sm font-semibold leading-none text-ink">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Extension */}
      <section className="mx-auto grid max-w-[1160px] items-center gap-14 px-5 py-24 sm:px-8 md:grid-cols-2">
        <div>
          <span className="eyebrow text-accent">Poise everywhere</span>
          <h2
            className="mb-4 mt-4 font-serif text-ink"
            style={{
              fontSize: "clamp(30px, 4vw, 46px)",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
            }}
          >
            It lives in every text field you type in.
          </h2>
          <p className="mb-7 mt-0 max-w-[46ch] text-[17px] leading-relaxed text-ink-soft">
            The browser extension sits quietly in your email, chat, and forms.
            When it senses a message running hot, it offers a composed version,
            right before you hit send.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {["Chrome", "Firefox", "Safari"].map((browser) => (
              <span
                key={browser}
                className="rounded-full border border-line px-5 py-3 text-sm font-medium leading-none text-ink"
              >
                {browser}
              </span>
            ))}
          </div>
        </div>
        <div
          className="reveal-view surface rounded-[20px] p-5.5 sm:p-6"
          style={{ boxShadow: "0 24px 60px -44px rgba(33,29,23,.5)" }}
        >
          <div className="mb-4 flex items-center gap-[7px]" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#e0a084" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#e4d08a" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#a8cbb6" }} />
          </div>
          <div className="rounded-xl border border-line bg-paper px-4 py-4 text-[15px] leading-normal text-ink-soft">
            To: alex@company.com
            <br />
            <span className="text-raw">
              honestly this is unacceptable and I&apos;m sick of asking…
            </span>
          </div>
          <div className="mx-1 my-3.5 flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="font-mono text-[13px] font-medium leading-none text-accent">
              Poise suggests a calmer version
            </span>
          </div>
          <div className="rounded-xl border border-accent bg-accent-tint px-4 py-4 text-[15px] leading-normal text-ink">
            “I want to flag that this has come up a few times now. Could we find
            a way to keep it on track going forward?”
          </div>
        </div>
      </section>

      {/* AI checker band */}
      <section className="bg-accent" style={{ color: "#f4f1e8" }}>
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-10 px-5 py-16 sm:px-8">
          <div className="max-w-[60ch]">
            <span className="eyebrow" style={{ color: "#cfe0d2" }}>
              Also included
            </span>
            <h2
              className="mb-2 mt-3.5 font-serif"
              style={{ fontSize: "clamp(26px, 3.4vw, 38px)", lineHeight: 1.1 }}
            >
              Check whether your text reads as AI-written.
            </h2>
            <p className="m-0 text-base leading-normal" style={{ color: "#dde7dc" }}>
              Score AI-likelihood and originality, and see the exact passages
              giving it away.
            </p>
          </div>
          <Link
            href="/originality-checker"
            className="whitespace-nowrap rounded-full px-7 py-[15px] text-base font-semibold leading-none text-accent transition-transform hover:-translate-y-0.5"
            style={{ background: "#f4f1e8" }}
          >
            Check your text →
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-[1160px] px-5 py-24 sm:px-8">
        <div className="mb-12 text-center">
          <span className="eyebrow text-accent">Pricing</span>
          <h2
            className="mb-0 mt-4 font-serif text-ink"
            style={{
              fontSize: "clamp(30px, 4vw, 46px)",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
            }}
          >
            Start free. Upgrade when it saves you daily.
          </h2>
        </div>
        <div className="reveal-view grid items-stretch gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.key} plan={plan} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-line">
        <div className="mx-auto max-w-[820px] px-5 py-24 sm:px-8">
          <h2
            className="mb-10 mt-0 text-center font-serif text-ink"
            style={{
              fontSize: "clamp(30px, 4vw, 46px)",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
            }}
          >
            Questions, answered.
          </h2>
          <FaqAccordion items={HOME_FAQ} />
          <div className="mt-8 text-center">
            <Link href="/faq" className="text-[15px] font-semibold text-accent hover:text-accent-strong">
              See all questions →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[1160px] px-5 pb-28 pt-5 sm:px-8">
        <div
          className="reveal-view rounded-3xl bg-ink px-10 text-center"
          style={{ color: "#ede7db", paddingBlock: "clamp(48px, 7vw, 88px)" }}
        >
          <h2
            className="mx-auto my-0 max-w-[18ch] font-serif"
            style={{
              fontSize: "clamp(34px, 5vw, 60px)",
              lineHeight: 1.02,
              letterSpacing: "-0.01em",
            }}
          >
            Ready to fix your next message?
          </h2>
          <p
            className="mx-auto mb-8 mt-5 max-w-[46ch] text-lg leading-normal"
            style={{ color: "#b7b0a2" }}
          >
            Paste a rough draft. Choose the tone. Send something you&apos;re
            proud of.
          </p>
          <Link
            href="/#converter"
            className="inline-flex items-center gap-2.5 rounded-full bg-accent-tint px-8 py-[17px] text-[17px] font-semibold leading-none text-ink transition-transform hover:-translate-y-0.5"
          >
            Convert a message <span className="text-[19px] leading-none">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
