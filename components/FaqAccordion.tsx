export type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <details key={item.question} className="faq-item group border-t border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-1 py-6 text-left">
            <span className="text-[19px] font-medium leading-snug text-ink">
              {item.question}
            </span>
            <span
              className="shrink-0 font-serif text-[26px] leading-none text-accent"
              aria-hidden
            >
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">–</span>
            </span>
          </summary>
          <p className="m-0 max-w-[64ch] px-1 pb-6 text-base leading-relaxed text-ink-soft">
            {item.answer}
          </p>
        </details>
      ))}
      <div className="border-t border-line" />
    </div>
  );
}
