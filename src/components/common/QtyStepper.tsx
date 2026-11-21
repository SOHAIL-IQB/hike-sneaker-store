import { Minus, Plus } from "lucide-react";
import { MAX_QTY } from "@/store/reducer";

interface Props {
  value: number;
  onChange: (n: number) => void;
  label: string;
}

/** Compact quantity control. Going below 1 removes the line. */
export default function QtyStepper({ value, onChange, label }: Props) {
  const btn =
    "grid h-8 w-8 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-surface-3 hover:text-foreground disabled:opacity-30";
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-surface-3 p-0.5" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} aria-label={value === 1 ? `Remove ${label}` : "Decrease quantity"}>
        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <span className="tabular w-6 text-center text-sm font-semibold" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
