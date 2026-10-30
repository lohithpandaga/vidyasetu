import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, MinusCircle, ArrowLeft, Lightbulb } from "lucide-react";
import api from "@/lib/api";

const ease = [0.16, 1, 0.3, 1];

const ScoreRing = ({ accuracy }) => {
  const r = 84;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" data-testid="result-score-ring" role="img" aria-label={`Accuracy ${accuracy} percent`}>
      <circle cx="100" cy="100" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
      <motion.circle
        cx="100" cy="100" r={r} fill="none"
        stroke="#2563EB" strokeWidth="14" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (accuracy / 100) * circ }}
        transition={{ duration: 1.4, ease }}
        transform="rotate(-90 100 100)"
      />
      <text x="100" y="96" textAnchor="middle" className="font-display" fontSize="44" fontWeight="800" fill="#0f172a">
        {accuracy}%
      </text>
      <text x="100" y="122" textAnchor="middle" fontSize="12" fill="#64748b">ACCURACY</text>
    </svg>
  );
};

export default function TestResult() {
  const { resultId } = useParams();
   const { data: r, isLoading, isError, error } = useQuery({
    queryKey: ["result", resultId],
     queryFn: async () => {
      console.log("result query firing", resultId);
      const res = await api.get(`/api/results/${resultId}`);
      console.log("result query done", res.status);
      return res.data;
    },
    retry: 1,
  });

  if (isError) {
    return <p className="font-mono text-sm text-red-500" data-testid="result-error">Could not load scorecard: {String(error?.message || error)}</p>;
  }
  if (isLoading || !r) {
    return <p className="font-mono text-sm text-muted-foreground animate-pulse" data-testid="result-loading">unsealing your scorecard…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto" data-testid="result-page">
      <Link to="/dashboard/tests" data-testid="result-back-link" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={15} /> All tests
      </Link>

      <div className="mt-6 rounded-3xl border border-border bg-card p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row items-center gap-10">
          <ScoreRing accuracy={r.accuracy} />
          <div className="text-center sm:text-left">
            <p className="font-mono text-[11px] tracking-[0.25em] text-brand">SCORECARD</p>
            <h1 className="font-display font-extrabold tracking-tight text-3xl mt-2">{r.test_title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {new Date(r.created_at).toLocaleString("en-IN", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })} · took {Math.round(r.time_taken / 60)} min
            </p>
            <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-semibold" data-testid="result-correct">
                <CheckCircle2 size={15} /> {r.correct} correct
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-600 px-4 py-2 text-sm font-semibold" data-testid="result-incorrect">
                <XCircle size={15} /> {r.incorrect} incorrect
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-4 py-2 text-sm font-semibold" data-testid="result-skipped">
                <MinusCircle size={15} /> {r.skipped} skipped
              </span>
            </div>
          </div>
        </div>

        {r.subject_breakdown?.length > 0 && (
          <div className="mt-10 border-t border-border pt-8" data-testid="result-subjects">
            <h2 className="font-display font-bold text-xl">Where the marks came from</h2>
            <div className="mt-5 grid sm:grid-cols-3 gap-4">
              {r.subject_breakdown.map((s) => {
                const pct = Math.round((s.correct / s.total) * 100);
                return (
                  <div key={s.subject} className="rounded-2xl border border-border bg-background p-5">
                    <p className="text-sm font-semibold">{s.subject}</p>
                    <p className="font-display font-extrabold text-3xl mt-2">{pct}%</p>
                    <p className="text-[11px] text-muted-foreground mt-1 font-mono">{s.correct}/{s.total} correct</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, ease, delay: 0.2 }}
                        className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-brand" : "bg-red-400"}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {r.review?.length > 0 && (
        <div className="mt-8 space-y-4" data-testid="result-review">
          <h2 className="font-display font-extrabold tracking-tight text-2xl">Question review</h2>
          {r.review.map((q, i) => {
            const ok = q.chosen === q.correct_idx;
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6"
                data-testid={`result-review-${i}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${ok ? "bg-emerald-100 text-emerald-700" : q.chosen == null ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm leading-relaxed">{q.text}</p>
                    <div className="mt-3 grid sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => {
                        const isCorrect = oi === q.correct_idx;
                        const isChosen = oi === q.chosen;
                        return (
                          <span
                            key={oi}
                            className={`rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${
                              isCorrect ? "border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold"
                              : isChosen ? "border-red-300 bg-red-50 text-red-700"
                              : "border-border text-slate-600"
                            }`}
                          >
                            {"ABCD"[oi]}. {opt} {isCorrect ? "· correct" : isChosen ? "· your pick" : ""}
                          </span>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <p className="mt-3 flex items-start gap-2 rounded-xl bg-blue-50 text-brand-dark px-4 py-3 text-xs leading-relaxed">
                        <Lightbulb size={14} className="shrink-0 mt-0.5" />
                        <span><span className="font-semibold">Why:</span> {q.explanation}</span>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
