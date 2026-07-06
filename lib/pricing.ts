export type Plan = {
  key: string;
  name: string;
  price: string;
  per: string;
  tagline: string;
  features: string[];
  cta: string;
  href: string;
  featured: boolean;
};

export const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    per: "forever",
    tagline: "For the occasional message you want to get right.",
    features: ["20 conversions a day", "All tones & length options", "Sentence clarifier"],
    cta: "Start free",
    href: "/#converter",
    featured: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: "$8",
    per: "/ month",
    tagline: "For anyone who writes all day and hates re-drafting.",
    features: [
      "Unlimited conversions",
      "Browser extension",
      "AI originality checker",
      "Priority quality model",
    ],
    cta: "Get Pro",
    href: "/#converter",
    featured: true,
  },
  {
    key: "team",
    name: "Team",
    price: "$6",
    per: "/ seat",
    tagline: "Shared voice guidelines for support & sales teams.",
    features: ["Everything in Pro", "Shared tone presets", "Team billing & admin"],
    cta: "Talk to us",
    href: "/#converter",
    featured: false,
  },
];
