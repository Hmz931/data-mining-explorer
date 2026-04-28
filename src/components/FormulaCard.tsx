import { ReactNode } from "react";
import { BlockMath } from "react-katex";

interface Props {
  label?: string;
  formula: string;
  legend?: ReactNode;
}

export const FormulaCard = ({ label, formula, legend }: Props) => (
  <div className="my-6 rounded-lg border border-border bg-card overflow-hidden shadow-soft">
    {label && (
      <div className="px-5 py-2 border-b border-border bg-surface/60 text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">
        {label}
      </div>
    )}
    <div className="px-5 py-5 overflow-x-auto">
      <BlockMath math={formula} />
    </div>
    {legend && (
      <div className="px-5 py-3 border-t border-border bg-surface/40 text-sm text-foreground/75 leading-relaxed">
        {legend}
      </div>
    )}
  </div>
);
