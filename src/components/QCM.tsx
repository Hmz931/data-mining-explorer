import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Sparkles, ChevronDown } from "lucide-react";

export interface QCMQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Props {
  title?: string;
  questions: QCMQuestion[];
}

export const QCM = ({ title = "Testez vos connaissances", questions }: Props) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [openExpl, setOpenExpl] = useState<Record<number, boolean>>({});

  const score = questions.reduce(
    (s, q) => s + (answers[q.id] === q.correct ? 1 : 0),
    0
  );
  const pct = Math.round((score / questions.length) * 100);

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setOpenExpl({});
  };

  const message =
    pct >= 80
      ? "Excellent — méthode maîtrisée."
      : pct >= 50
      ? "Bon début — relis les points marqués en rouge."
      : "À retravailler — reprends la fiche puis recommence.";

  return (
    <div className="my-10 rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-surface/60">
        <Sparkles className="w-4 h-4 text-accent" />
        <h3 className="font-serif text-xl font-semibold text-primary">{title}</h3>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {questions.length} questions
        </span>
      </div>

      <div className="divide-y divide-border">
        {questions.map((q, qi) => {
          const sel = answers[q.id];
          const isCorrect = submitted && sel === q.correct;
          const isWrong = submitted && sel !== undefined && sel !== q.correct;
          const isUnanswered = submitted && sel === undefined;

          return (
            <div key={q.id} className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="font-mono text-xs text-accent mt-1 shrink-0">
                  Q{qi + 1}.
                </span>
                <div className="flex-1">
                  <div className="font-medium text-primary leading-relaxed">
                    {q.question}
                  </div>
                </div>
                {isCorrect && <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />}
                {(isWrong || isUnanswered) && (
                  <XCircle className="w-5 h-5 text-accent shrink-0" />
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-2 ml-8">
                {q.options.map((opt, i) => {
                  const chosen = sel === i;
                  const correct = q.correct === i;
                  let cls =
                    "border-border bg-card hover:border-accent/40 hover:bg-surface/60";
                  if (submitted) {
                    if (correct) cls = "border-sage bg-sage/10 text-primary";
                    else if (chosen)
                      cls = "border-accent bg-accent/10 text-primary";
                    else cls = "border-border bg-card opacity-70";
                  } else if (chosen) {
                    cls = "border-accent bg-accent/10 text-primary";
                  }
                  return (
                    <button
                      key={i}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                      className={`text-left px-4 py-2.5 rounded-md border text-sm transition flex items-center gap-2 ${cls}`}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className="flex-1">{opt}</span>
                      {submitted && correct && (
                        <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                      )}
                      {submitted && chosen && !correct && (
                        <XCircle className="w-4 h-4 text-accent shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="ml-8 mt-3">
                  <button
                    onClick={() =>
                      setOpenExpl((o) => ({ ...o, [q.id]: !o[q.id] }))
                    }
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline underline-offset-4"
                  >
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        openExpl[q.id] ? "rotate-180" : ""
                      }`}
                    />
                    {openExpl[q.id] ? "Masquer" : "Voir"} l'explication
                  </button>
                  {openExpl[q.id] && (
                    <div className="mt-2 p-3 rounded border-l-2 border-accent bg-surface/60 text-sm text-foreground/85 leading-relaxed">
                      {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-6 py-5 bg-surface/60 border-t border-border">
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length === 0}
            className="px-5 py-2.5 rounded-md bg-accent text-accent-foreground font-medium text-sm shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            Valider mes réponses
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-serif text-2xl font-semibold text-primary">
                {score} / {questions.length}
              </span>
              <span className="font-mono text-sm text-accent">· {pct}%</span>
              <span className="text-sm text-muted-foreground">— {message}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition mt-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Recommencer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
