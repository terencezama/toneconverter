import type { Metadata } from "next";
import { PlanCard } from "@/components/PlanCard";
import { PLANS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing | Free, Pro, and Team Plans",
  description:
    "Poise pricing: start free, upgrade to Pro for unlimited conversions and the browser extension, or choose Team for your whole organization.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow text-accent">Pricing</span>
        <h1
          className="mb-0 mt-4 font-serif text-ink"
          style={{
            fontSize: "clamp(30px, 4vw, 46px)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
          }}
        >
          Start free. Upgrade when it saves you daily.
        </h1>
      </div>

      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard key={plan.key} plan={plan} />
        ))}
      </div>
    </section>
  );
}
