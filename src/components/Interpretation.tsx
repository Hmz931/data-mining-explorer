import { ReactNode } from "react";
import { Quote } from "lucide-react";

interface Props {
  title?: string;
  children: ReactNode;
}

// Pedagogic block: "How to read this result?"
export const Interpretation = ({ title = "Interprétation", children }: Props) => (
  <aside className="my-7 relative pl-6 border-l-4 border-accent bg-gradient-to-r from-accent/8 to-transparent rounded-r-md py-5 pr-5">
    <div className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-soft">
      <Quote className="w-3 h-3 text-accent-foreground" />
    </div>
    <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-accent mb-2">{title}</div>
    <div className="text-foreground/90 leading-[1.7] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:text-primary">
      {children}
    </div>
  </aside>
);
