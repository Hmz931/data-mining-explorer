import { ReactNode } from "react";
import { Lightbulb, AlertTriangle, Info, Sigma } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "intuition" | "warning" | "info" | "math";

const styles: Record<Variant, { bg: string; border: string; icon: ReactNode; label: string }> = {
  intuition: {
    bg: "bg-[hsl(45_90%_60%/0.12)]",
    border: "border-l-4 border-highlight",
    icon: <Lightbulb className="w-4 h-4" />,
    label: "Intuition",
  },
  warning: {
    bg: "bg-[hsl(32_78%_48%/0.10)]",
    border: "border-l-4 border-accent",
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "Attention",
  },
  info: {
    bg: "bg-[hsl(220_45%_16%/0.05)]",
    border: "border-l-4 border-primary",
    icon: <Info className="w-4 h-4" />,
    label: "Note",
  },
  math: {
    bg: "bg-[hsl(145_22%_42%/0.10)]",
    border: "border-l-4 border-sage",
    icon: <Sigma className="w-4 h-4" />,
    label: "Démonstration",
  },
};

export const Callout = ({
  variant = "info",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
}) => {
  const s = styles[variant];
  return (
    <div className={cn("my-6 rounded-r-md p-5", s.bg, s.border)}>
      <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-[0.15em] font-semibold text-primary">
        {s.icon}
        <span>{title || s.label}</span>
      </div>
      <div className="text-foreground/90 leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0">{children}</div>
    </div>
  );
};
