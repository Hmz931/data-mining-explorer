import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Props {
  code: string;
  language?: string;
  title?: string;
}

// Very lightweight syntax highlighter for Python (keywords / strings / comments / numbers).
// We avoid pulling a heavy dep — pedagogical readability is enough.
function highlightPython(src: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const KW = /\b(import|from|as|def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|class|with|lambda|try|except|raise|pass|break|continue|yield|global|nonlocal)\b/g;
  const BUILTINS = /\b(print|len|range|list|dict|tuple|set|str|int|float|sum|min|max|abs|round|enumerate|zip|map|filter|sorted|open|type)\b/g;

  const lines = escape(src).split("\n").map((line) => {
    // comments first
    let out = line.replace(/(#[^\n]*)/g, '<span class="text-emerald-700/80 italic">$1</span>');
    // strings
    out = out.replace(/("[^"\n]*"|'[^'\n]*')/g, '<span class="text-amber-700">$1</span>');
    // numbers
    out = out.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-rose-700">$1</span>');
    // builtins
    out = out.replace(BUILTINS, '<span class="text-sky-700">$1</span>');
    // keywords
    out = out.replace(KW, '<span class="text-violet-700 font-semibold">$1</span>');
    return out;
  });
  return lines.join("\n");
}

export const CodeBlock = ({ code, language = "python", title }: Props) => {
  const [copied, setCopied] = useState(false);
  const html = language === "python" ? highlightPython(code) : code;

  return (
    <figure className="my-6 rounded-lg border border-border bg-[hsl(220_30%_10%)] overflow-hidden shadow-soft">
      <figcaption className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20 text-[11px] uppercase tracking-[0.18em] font-semibold text-white/80">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[hsl(32_78%_55%)]" />
          {title ?? language.toUpperCase()}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1.5 text-white/60 hover:text-white transition normal-case tracking-normal text-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copié" : "Copier"}
        </button>
      </figcaption>
      <pre className="px-4 py-4 overflow-x-auto text-[13px] leading-[1.65] font-mono text-[hsl(42_30%_92%)]">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </figure>
  );
};
