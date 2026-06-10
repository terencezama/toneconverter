import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { USE_CASES } from "@/lib/use-cases";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/use-cases", "/faq", "/pricing"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const useCasePages = USE_CASES.map((useCase) => ({
    url: `${SITE_URL}/${useCase.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...useCasePages];
}
