import Link from "next/link";
import type { Plan } from "@/lib/pricing";

export function PlanCard({ plan }: { plan: Plan }) {
  const featured = plan.featured;
  return (
    <div
      className={`flex flex-col rounded-[20px] border p-8 transition-all duration-200 hover:-translate-y-1 ${
        featured ? "border-ink bg-ink" : "surface"
      }`}
      style={
        featured
          ? { boxShadow: "0 30px 60px -40px rgba(33,29,23,.6)" }
          : undefined
      }
    >
      {featured && (
        <span className="eyebrow-sm mb-4 self-start rounded-full bg-accent-tint px-[11px] py-1.5 text-ink" style={{ letterSpacing: "0.12em" }}>
          Most popular
        </span>
      )}
      <div
        className="eyebrow-sm"
        style={{ color: featured ? "#a8cbb6" : "var(--accent)" }}
      >
        {plan.name}
      </div>
      <div className="mb-1 mt-4 flex items-baseline gap-1.5">
        <span
          className="font-serif text-[46px] leading-none"
          style={{ color: featured ? "#f4f1e8" : "var(--ink)" }}
        >
          {plan.price}
        </span>
        <span
          className="text-[15px] leading-none"
          style={{ color: featured ? "#b7b0a2" : "var(--ink-soft)" }}
        >
          {plan.per}
        </span>
      </div>
      <p
        className="m-0 mb-5 min-h-10 text-sm leading-normal"
        style={{ color: featured ? "#b7b0a2" : "var(--ink-soft)" }}
      >
        {plan.tagline}
      </p>
      <div className="mb-6 flex flex-col gap-[11px]">
        {plan.features.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-2.5 text-[15px] leading-snug"
            style={{ color: featured ? "#e4ded3" : "var(--ink)" }}
          >
            <span style={{ color: featured ? "#a8cbb6" : "var(--accent)" }}>✓</span>
            <span>{feature}</span>
          </div>
        ))}
      </div>
      <Link
        href={plan.href}
        className={`mt-auto rounded-full py-3.5 text-center text-[15px] font-semibold leading-none transition-transform hover:-translate-y-0.5 ${
          featured ? "bg-accent-tint text-ink" : "bg-ink text-card"
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
