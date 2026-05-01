import { useState } from "react";
import { NbCode } from "./Notebook";

interface Props {
  r?: string;
  python?: string;
  /** default tab when both provided */
  defaultLang?: "r" | "python";
}

/**
 * Tabbed code cell : switch between R and Python versions of the same snippet.
 * Both are rendered through NbCode so the In[n] counter stays consistent.
 */
export const CodeTabs = ({ r, python, defaultLang = "r" }: Props) => {
  const hasR = !!r;
  const hasPy = !!python;
  const initial = defaultLang === "r" && hasR ? "r" : hasPy ? "python" : "r";
  const [lang, setLang] = useState<"r" | "python">(initial);

  if (!hasR && !hasPy) return null;
  if (hasR && !hasPy) return <NbCode code={r!} language="r" />;
  if (hasPy && !hasR) return <NbCode code={python!} language="python" />;

  return (
    <div className="border-t border-border/50">
      <div className="flex items-center gap-1 px-4 pt-2 pb-0 bg-card">
        <button
          onClick={() => setLang("r")}
          className={`px-3 py-1 text-[11px] font-mono rounded-t-md border-b-2 transition ${
            lang === "r"
              ? "border-accent text-accent bg-surface/60"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          R
        </button>
        <button
          onClick={() => setLang("python")}
          className={`px-3 py-1 text-[11px] font-mono rounded-t-md border-b-2 transition ${
            lang === "python"
              ? "border-accent text-accent bg-surface/60"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Python
        </button>
        <span className="ml-auto text-[10px] text-muted-foreground italic">
          même opération · 2 langages
        </span>
      </div>
      {lang === "r" ? <NbCode code={r!} language="r" /> : <NbCode code={python!} language="python" />}
    </div>
  );
};
