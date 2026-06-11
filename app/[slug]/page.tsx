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
      <section>
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {useCase.h1}
            </h1>
            <p className="mt-4 text-lg text-zinc-300">{useCase.intro}</p>
          </div>
          <div className="mt-10" id="converter">
            <ToneConverter defaultTone={useCase.presetTone} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {useCase.body.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="mb-4 leading-relaxed text-zinc-300">
            {paragraph}
          </p>
        ))}

        <h2 className="mt-10 text-xl font-bold text-white">Example</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="glass rounded-2xl p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Before
            </p>
            <p className="text-sm leading-relaxed text-zinc-300">
              {useCase.example.before}
            </p>
          </div>
          <div className="glass rounded-2xl border-white/20 p-4">
            <p className="text-gradient-live mb-2 text-xs font-semibold uppercase tracking-wide">
              After
            </p>
            <p className="text-sm leading-relaxed text-zinc-100">
              {useCase.example.after}
            </p>
          </div>
        </div>

        <div className="glass mt-10 rounded-3xl p-6 text-center">
          <p className="text-zinc-300">
            Need a different tone? Try the full{" "}
            <Link href="/" className="text-gradient-live font-semibold">
              Tone Converter
            </Link>{" "}
            with all tone and length options.
          </p>
        </div>

        <h2 className="mt-12 text-xl font-bold text-white">Related tools</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {others.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/${other.slug}`}
                className="glass block rounded-2xl p-4 font-medium text-zinc-100 transition-colors hover:bg-white/10"
              >
                {other.navLabel}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
