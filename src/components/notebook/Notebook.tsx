import { ReactNode, useState } from "react";
import { Check, Copy } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────
 * Jupyter-notebook style primitives
 * - <Notebook>           : page container with notebook chrome
 * - <NbMarkdown>         : markdown / prose cell
 * - <NbCode>             : code input cell ("In [n]:")
 * - <NbOutput>           : text/stdout cell ("Out[n]:")
 * - <NbRich>             : rich output cell (charts, tables, anything React)
 * Counter increments automatically across In/Out cells.
 * ───────────────────────────────────────────────────────────────────── */

let _ctxCounter = { value: 0 };
export const nbReset = () => { _ctxCounter.value = 0; };
const nextIn = () => ++_ctxCounter.value;

export const Notebook = ({ children, kernel = "Python 3 · ESB Analytics" }: { children: ReactNode; kernel?: string }) => {
  // reset counter when a new Notebook mounts (per render)
  _ctxCounter = { value: 0 };
  return (
    <div className="my-8 rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface/70">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-400/80" />
          <span className="w-3 h-3 rounded-full bg-amber-400/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
          <span className="ml-3 font-mono text-[12px] text-muted-foreground">notebook.ipynb</span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {kernel}
        </span>
      </div>
      <div className="divide-y divide-border/50">{children}</div>
    </div>
  );
};

/* ───────────── Markdown / prose cell ───────────── */
export const NbMarkdown = ({ children, title }: { children: ReactNode; title?: string }) => (
  <div className="px-5 md:px-8 py-5 bg-card">
    {title && <h3 className="font-serif text-xl font-semibold text-primary mb-2">{title}</h3>}
    <div className="text-foreground/85 leading-relaxed text-[15px] [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_strong]:text-primary [&_strong]:font-semibold">
      {children}
    </div>
  </div>
);

/* ───────────── Code cell ───────────── */
function highlightCode(src: string, language: string): string {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const KW_PY = /\b(import|from|as|def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|class|with|lambda|try|except|raise|pass|break|continue|yield|global|nonlocal)\b/g;
  const BUILTINS_PY = /\b(print|len|range|list|dict|tuple|set|str|int|float|sum|min|max|abs|round|enumerate|zip|map|filter|sorted|open|type)\b/g;
  const KW_R = /\b(library|require|install\.packages|function|return|if|else|for|while|in|TRUE|FALSE|NULL|NA|NaN|Inf|next|break|repeat)\b/g;
  const BUILTINS_R = /\b(c|data|str|dim|head|tail|summary|nrow|ncol|rownames|colnames|matrix|data\.frame|factor|as\.factor|as\.numeric|as\.character|table|prop\.table|addmargins|chisq\.test|scale|cor|mean|median|sd|var|sum|min|max|abs|round|print|paste|cat|plot|barplot|hist|boxplot|PCA|CA|MCA|HCPC|kmeans|hclust|dist|cutree|fviz_eig|fviz_pca_biplot|fviz_pca_ind|fviz_pca_var|fviz_mca|fviz_mca_ind|fviz_mca_var|fviz_screeplot|fviz_dend|fviz_cluster|ddply|corrgram|geom_hline|invisible)\b/g;
  return escape(src).split("\n").map((line) => {
    let out = line.replace(/(#[^\n]*)/g, '<span class="text-emerald-400/90 italic">$1</span>');
    out = out.replace(/("[^"\n]*"|'[^'\n]*')/g, '<span class="text-amber-300">$1</span>');
    out = out.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-rose-300">$1</span>');
    if (language === "r") {
      out = out.replace(BUILTINS_R, '<span class="text-sky-300">$1</span>');
      out = out.replace(KW_R, '<span class="text-violet-300 font-semibold">$1</span>');
      out = out.replace(/(&lt;-|-&gt;|~)/g, '<span class="text-fuchsia-300">$1</span>');
    } else {
      out = out.replace(BUILTINS_PY, '<span class="text-sky-300">$1</span>');
      out = out.replace(KW_PY, '<span class="text-violet-300 font-semibold">$1</span>');
    }
    return out;
  }).join("\n");
}

export const NbCode = ({ code, language = "python" }: { code: string; language?: "python" | "r" }) => {
  const [copied, setCopied] = useState(false);
  const n = nextIn();
  const html = highlightCode(code, language);
  const langLabel = language === "r" ? "R" : "Py";
  return (
    <div className="grid grid-cols-[60px_1fr] bg-card group">
      <div className="pt-3 pr-2 text-right font-mono text-[11px] text-sky-700/70 dark:text-sky-400/70 select-none border-r border-border/40">
        In&nbsp;[{n}]:
      </div>
      <div className="relative bg-[hsl(220_30%_10%)]">
        <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded text-[10px] font-mono text-white/60 bg-white/10">
          {langLabel}
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-white/60 hover:text-white bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "copié" : "copier"}
        </button>
        <pre className="px-4 pt-7 pb-3 overflow-x-auto text-[12.5px] leading-[1.6] font-mono text-[hsl(42_30%_92%)]">
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </div>
  );
};

/* ───────────── Text output cell ───────────── */
export const NbOutput = ({ children, kind = "stdout" }: { children: ReactNode; kind?: "stdout" | "result" }) => {
  const n = _ctxCounter.value;
  return (
    <div className="grid grid-cols-[60px_1fr] bg-surface/30">
      <div className="pt-3 pr-2 text-right font-mono text-[11px] text-rose-700/70 select-none border-r border-border/40">
        {kind === "result" ? `Out[${n}]:` : ""}
      </div>
      <div className="px-4 py-3">
        <pre className="font-mono text-[12.5px] leading-[1.55] text-foreground/85 whitespace-pre-wrap">{children}</pre>
      </div>
    </div>
  );
};

/* ───────────── Rich (React) output cell ───────────── */
export const NbRich = ({ children, label }: { children: ReactNode; label?: string }) => {
  const n = _ctxCounter.value;
  return (
    <div className="grid grid-cols-[60px_1fr] bg-surface/30">
      <div className="pt-3 pr-2 text-right font-mono text-[11px] text-rose-700/70 select-none border-r border-border/40">
        Out[{n}]:
      </div>
      <div className="px-4 py-3">
        {label && <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-2">{label}</div>}
        {children}
      </div>
    </div>
  );
};
