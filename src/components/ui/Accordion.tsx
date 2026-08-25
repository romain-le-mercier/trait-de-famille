import { ChevronDown } from "lucide-react";

export interface QaItem {
  question: string;
  answer: string;
}

/** Accordéon natif (details/summary) : accessible sans JavaScript. */
export function Accordion({ items }: { items: QaItem[] }) {
  return (
    <div className="divide-y-2 divide-line overflow-hidden rounded-card border-2 border-ink bg-canvas">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-lg font-semibold transition-colors hover:bg-paper">
            {item.question}
            <ChevronDown
              className="h-5 w-5 shrink-0 text-grape transition-transform group-open:rotate-180"
              strokeWidth={2.4}
            />
          </summary>
          <p className="px-5 pb-5 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
