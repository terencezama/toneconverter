import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToneConverter } from "@/components/ToneConverter";
import { getUseCase, USE_CASES } from "@/lib/use-cases";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return USE_CASES.map((useCase) => ({ slug: useCase.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getUseCase(slug);
  if (!useCase) return {};
  return {
    title: useCase.metaTitle,
    description: useCase.metaDescription,
    alternates: { canonical: `/${useCase.slug}` },
  };
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params;
  const useCase = getUseCase(slug);
  if (!useCase) notFound();

  const others = USE_CASES.filter((u) => u.slug !== useCase.slug).slice(0, 4);

  return (
    <>
      <div className="mood-glow" aria-hidden />
      <section className="relative z-[1]">
        <div className="mx-auto max-w-[1160px] px-5 pb-14 pt-14 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1
              className="m-0 font-serif text-ink"
              style={{
                fontSize: "clamp(34px, 5vw, 56px)",
                lineHeight: 1.02,
                letterSpacing: "-0.01em",
                textWrap: "balance",
              }}
            >
              {useCase.h1}
            </h1>
            <p className="mb-0 mt-5 text-lg leading-relaxed text-ink-soft">
              {useCase.intro}
            </p>
          </div>
          <div className="mt-10" id="converter">
            <ToneConverter defaultTone={useCase.presetTone} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        {useCase.body.map((paragraph) => (
          <p
            key={paragraph.slice(0, 40)}
            className="mb-4 text-[17px] leading-relaxed text-ink-soft"
          >
            {paragraph}
          </p>
        ))}

        <h2 className="mb-0 mt-12 font-serif text-[28px] leading-tight text-ink">
          Example
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-paper p-5">
            <p className="eyebrow-sm mb-2.5 text-raw">Before</p>
            <p className="m-0 text-[15px] leading-relaxed text-ink-soft">
              {useCase.example.before}
            </p>
          </div>
          <div className="surface rounded-2xl p-5">
            <p className="eyebrow-sm mb-2.5 text-accent">After</p>
            <p className="m-0 text-[15px] leading-relaxed text-ink">
              {useCase.example.after}
            </p>
          </div>
        </div>

        <div className="surface mt-10 rounded-2xl p-6 text-center">
          <p className="m-0 text-ink-soft">
            Need a different tone? Try the full{" "}
            <Link href="/#converter" className="font-semibold text-accent hover:text-accent-strong">
              converter
            </Link>{" "}
            with all tone and length options.
          </p>
        </div>

        <h2 className="mb-0 mt-12 font-serif text-[28px] leading-tight text-ink">
          Related tools
        </h2>
        <ul className="mt-5 grid list-none gap-3 p-0 sm:grid-cols-2">
          {others.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/${other.slug}`}
                className="surface block rounded-2xl p-4 font-medium text-ink transition-colors hover:border-accent"
              >
                {other.navLabel} →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
