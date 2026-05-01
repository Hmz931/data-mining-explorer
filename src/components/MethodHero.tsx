import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface Props {
  code: string;
  tag: string;
  title: string;
  subtitle: string;
}

export const MethodHero = ({ code, tag, title, subtitle }: Props) => (
  <section className="relative border-b border-border bg-gradient-hero overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.05] pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(circle at 80% 20%, hsl(var(--accent)) 0, transparent 35%), radial-gradient(circle at 20% 90%, hsl(var(--sage)) 0, transparent 40%)",
      }}
    />
    <div className="container relative py-10 sm:py-14 md:py-20">
      <Link
        to="/data-mining"
        className="inline-flex items-center gap-1 text-sm text-accent hover:underline underline-offset-4 mb-5 sm:mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Chapitre Data Mining
      </Link>
      <div className="flex items-baseline gap-3 sm:gap-4 mb-3 flex-wrap">
        <span className="font-mono text-[11px] tracking-[0.2em] text-accent">{code}</span>
        <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">· {tag}</span>
      </div>
      <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-semibold text-primary leading-[1.05] tracking-tight mb-4 sm:mb-5 max-w-3xl">
        {title}
      </h1>
      <p className="text-base sm:text-lg text-foreground/75 max-w-2xl leading-relaxed">{subtitle}</p>
    </div>
  </section>
);
