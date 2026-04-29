import { ReactNode } from "react";
import { CheckCircle2, AlertCircle, Target } from "lucide-react";

interface CardProps {
  title: string;
  icon: ReactNode;
  tone: "ok" | "warn" | "info";
  items: ReactNode[];
}

const tones = {
  ok: "border-sage/40 bg-sage/5",
  warn: "border-accent/40 bg-accent/5",
  info: "border-primary/30 bg-primary/5",
};
const iconTones = { ok: "text-sage", warn: "text-accent", info: "text-primary" };

const Card = ({ title, icon, tone, items }: CardProps) => (
  <div className={`p-5 rounded-lg border ${tones[tone]}`}>
    <div className={`flex items-center gap-2 mb-3 ${iconTones[tone]}`}>
      {icon}
      <h4 className="font-serif text-sm font-bold uppercase tracking-[0.12em]">{title}</h4>
    </div>
    <ul className="space-y-2 text-sm text-foreground/85 leading-relaxed">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-muted-foreground mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  </div>
);

interface Props {
  objectif: ReactNode[];
  conditions: ReactNode[];
  attention: ReactNode[];
}

export const MethodMeta = ({ objectif, conditions, attention }: Props) => (
  <div className="my-8 grid md:grid-cols-3 gap-4">
    <Card tone="info" title="Objectif" icon={<Target className="w-4 h-4" />} items={objectif} />
    <Card tone="ok" title="Conditions d'application" icon={<CheckCircle2 className="w-4 h-4" />} items={conditions} />
    <Card tone="warn" title="Points de vigilance" icon={<AlertCircle className="w-4 h-4" />} items={attention} />
  </div>
);
