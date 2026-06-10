export type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
      {items.map((item) => (
        <details key={item.question} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-zinc-900">
            {item.question}
            <span
              className="text-zinc-400 transition-transform group-open:rotate-45"
              aria-hidden
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
