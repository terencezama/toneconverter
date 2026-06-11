import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Free, Pro, and Team Plans",
  description:
    "Tone Converter pricing: start free, upgrade to Pro for higher limits, or choose Team for your whole organization.",
  alternates: { canonical: "/pricing" },
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    highlight: false,
    cta: "Start converting",
    href: "/#converter",
    features: [
      "All tone options",
      "Up to 20 conversions per day",
      "2,000 characters per message",
      "Copy and regenerate",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    highlight: true,
    cta: "Coming soon",
    href: "/#converter",
    features: [
      "Everything in Free",
      "Unlimited conversions",
      "10,000 characters per message",
      "Multiple rewrite suggestions",
      "Conversion history",
    ],
  },
  {
    name: "Team",
    price: "$29",
    period: "per month",
    highlight: false,
    cta: "Coming soon",
    href: "/#converter",
    features: [
      "Everything in Pro",
      "5 team seats included",
      "Shared tone presets",
      "Priority support",
    ],
  },
];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Simple, honest pricing
        </h1>
        <p className="mt-4 text-lg text-zinc-300">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`glass flex flex-col rounded-3xl p-7 ${
              plan.highlight ? "border-white/25 shadow-2xl shadow-black/40" : ""
            }`}
          >
            {plan.highlight && (
              <span className="btn-gradient mb-3 self-start rounded-full px-3 py-1 text-xs font-semibold">
                Most popular
              </span>
            )}
            <h2 className="text-lg font-bold text-white">{plan.name}</h2>
            <p className="mt-2">
              <span className="text-gradient-live text-4xl font-extrabold">
                {plan.price}
              </span>{" "}
              <span className="text-sm text-zinc-400">{plan.period}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="text-gradient-live mt-0.5" aria-hidden>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`mt-8 rounded-xl px-5 py-2.5 text-center text-sm font-semibold transition-colors ${
                plan.highlight
                  ? "btn-gradient"
                  : "border border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
