export type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="glass divide-y divide-white/10 rounded-3xl">
      {items.map((item) => (
        <details key={item.question} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-white">
            {item.question}
            <span
              className="text-zinc-400 transition-transform group-open:rotate-45"
              aria-hidden
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
