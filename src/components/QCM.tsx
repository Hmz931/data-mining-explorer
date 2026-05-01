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

/**
 * QCM with **per-question validation**:
 * - Each question has its own "Valider" button.
 * - Once validated, the correct/wrong feedback + explanation appears for that question.
 * - A global progress bar tracks how many are answered correctly.
 */
export const QCM = ({ title = "Testez vos connaissances", questions }: Props) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [validated, setValidated] = useState<Record<number, boolean>>({});
  const [openExpl, setOpenExpl] = useState<Record<number, boolean>>({});

  const validatedIds = Object.keys(validated).filter((k) => validated[+k]).map(Number);
  const correctCount = validatedIds.filter((id) => {
    const q = questions.find((q) => q.id === id);
    return q && answers[id] === q.correct;
  }).length;
  const pct = Math.round((correctCount / questions.length) * 100);

  const reset = () => {
    setAnswers({});
    setValidated({});
    setOpenExpl({});
  };

  return (
    <div className="my-10 rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-border bg-surface/60 flex-wrap">
        <Sparkles className="w-4 h-4 text-accent shrink-0" />
        <h3 className="font-serif text-lg sm:text-xl font-semibold text-primary">{title}</h3>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {correctCount}/{questions.length} ✓
        </span>
      </div>

      <div className="px-4 sm:px-6 pt-3">
        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-border">
        {questions.map((q, qi) => {
          const sel = answers[q.id];
          const isVal = !!validated[q.id];
          const isCorrect = isVal && sel === q.correct;
          const isWrong = isVal && sel !== undefined && sel !== q.correct;

          return (
            <div key={q.id} className="p-4 sm:p-6">
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="font-mono text-xs text-accent mt-1 shrink-0">
                  Q{qi + 1}.
                </span>
                <div className="flex-1 font-medium text-primary leading-relaxed text-sm sm:text-base">
                  {q.question}
                </div>
                {isCorrect && <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />}
                {isWrong && <XCircle className="w-5 h-5 text-accent shrink-0" />}
              </div>

              <div className="grid sm:grid-cols-2 gap-2 sm:ml-8">
                {q.options.map((opt, i) => {
                  const chosen = sel === i;
                  const correct = q.correct === i;
                  let cls =
                    "border-border bg-card hover:border-accent/40 hover:bg-surface/60";
                  if (isVal) {
                    if (correct) cls = "border-sage bg-sage/10 text-primary";
                    else if (chosen) cls = "border-accent bg-accent/10 text-primary";
                    else cls = "border-border bg-card opacity-70";
                  } else if (chosen) {
                    cls = "border-accent bg-accent/10 text-primary";
                  }
                  return (
                    <button
                      key={i}
                      disabled={isVal}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                      className={`text-left px-3 sm:px-4 py-2.5 rounded-md border text-sm transition flex items-center gap-2 ${cls}`}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isVal && correct && (
                        <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                      )}
                      {isVal && chosen && !correct && (
                        <XCircle className="w-4 h-4 text-accent shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="sm:ml-8 mt-4 flex items-center gap-3 flex-wrap">
                {!isVal ? (
                  <button
                    onClick={() => setValidated((v) => ({ ...v, [q.id]: true }))}
                    disabled={sel === undefined}
                    className="px-4 py-1.5 rounded-md bg-accent text-accent-foreground text-xs font-medium shadow-soft hover:shadow-card transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Valider
                  </button>
                ) : (
                  <>
                    <span
                      className={`text-xs font-semibold ${
                        isCorrect ? "text-sage" : "text-accent"
                      }`}
                    >
                      {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
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
                    <button
                      onClick={() => {
                        setValidated((v) => ({ ...v, [q.id]: false }));
                        setOpenExpl((o) => ({ ...o, [q.id]: false }));
                      }}
                      className="text-xs text-muted-foreground hover:text-accent transition inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Refaire
                    </button>
                  </>
                )}
              </div>

              {isVal && openExpl[q.id] && (
                <div className="sm:ml-8 mt-3 p-3 rounded border-l-2 border-accent bg-surface/60 text-sm text-foreground/85 leading-relaxed">
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 sm:px-6 py-4 bg-surface/60 border-t border-border flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm">
          <span className="font-serif text-xl font-semibold text-primary">
            {correctCount} / {questions.length}
          </span>
          <span className="ml-2 font-mono text-xs text-accent">{pct}%</span>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition"
        >
          <RotateCcw className="w-3 h-3" /> Tout recommencer
        </button>
      </div>
    </div>
  );
};
