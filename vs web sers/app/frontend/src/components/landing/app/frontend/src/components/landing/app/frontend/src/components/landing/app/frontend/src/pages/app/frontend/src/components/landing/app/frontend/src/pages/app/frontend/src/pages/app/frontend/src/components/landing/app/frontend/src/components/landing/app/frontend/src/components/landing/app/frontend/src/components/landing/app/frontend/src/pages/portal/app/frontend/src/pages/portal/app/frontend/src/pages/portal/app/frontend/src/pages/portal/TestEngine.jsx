import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Flag, Timer, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";

export default function TestEngine() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: test, isLoading, error } = useQuery({
    queryKey: ["test", testId],
    queryFn: async () => (await api.get(`/api/tests/${testId}`)).data,
  });

  useEffect(() => {
    if (test && !timeLeft) setTimeLeft(test.duration_min * 60);
  }, [test]);

  const submit = async (auto = false) => {
    if (submitted) return;
    setSubmitted(true);
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/tests/${testId}/submit`, {
        answers,
        time_taken: test.duration_min * 60 - timeLeft,
      });
      toast.success(auto ? "Time's up — submitted automatically." : "Submitted. Analyzing your shots…");
      navigate(`/dashboard/results/${data.result_id}`);
    } catch (e) {
      toast.error(formatApiError(e));
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!test) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          submit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [test]);

  const questions = test?.questions || [];
  const q = questions[idx];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  if (error) {
    return (
      <div className="text-center py-24" data-testid="test-error">
        <p className="text-muted-foreground">This test flew away.</p>
        <Link to="/dashboard/tests" className="mt-4 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">Back to tests</Link>
      </div>
    );
  }

  if (isLoading || !test) {
    return <p className="font-mono text-sm text-muted-foreground animate-pulse" data-testid="test-loading">setting the exam hall…</p>;
  }

  return (
    <div className="max-w-5xl mx-auto" data-testid="test-engine">
      <div className="sticky top-0 z-30 -mx-5 sm:-mx-8 px-5 sm:px-8 py-4 bg-[hsl(var(--background))]/85 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.2em] text-brand">LIVE MOCK</p>
            <h1 className="font-display font-bold text-lg truncate">{test.title}</h1>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-mono font-semibold text-lg border ${timeLeft < 60 ? "border-red-200 bg-red-50 text-red-600" : "border-border bg-card text-foreground"}`} data-testid="test-timer">
            <Timer size={16} /> {mm}:{ss}
          </div>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-brand transition-all duration-300" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_240px] gap-8 mt-8">
        <div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full bg-blue-50 text-brand font-semibold px-3 py-1" data-testid="test-question-counter">Q{idx + 1} of {questions.length}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{q.subject}</span>
          </div>
          <h2 className="font-display font-bold text-xl sm:text-2xl leading-snug mt-5 min-h-[4rem]" data-testid="test-question-text">
            {q.text}
          </h2>
          <div className="mt-7 space-y-3">
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                  data-testid={`test-option-${idx}-${oi}`}
                  className={`w-full flex items-center gap-4 rounded-2xl border px-5 py-4 text-left text-sm transition-colors ${
                    selected ? "border-brand bg-blue-50 text-foreground font-medium" : "border-border bg-card hover:border-slate-300"
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${selected ? "bg-brand text-white" : "bg-slate-100 text-slate-500"}`}>
                    {"ABCD"[oi]}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setIdx(Math.max(0, idx - 1))}
              disabled={idx === 0}
              data-testid="test-prev-button"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={15} /> Prev
            </button>
            <button
              onClick={() => setMarked({ ...marked, [idx]: !marked[idx] })}
              data-testid="test-mark-button"
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-colors ${marked[idx] ? "border-amber-300 bg-amber-50 text-amber-700" : "border-border text-muted-foreground hover:bg-slate-50"}`}
            >
              <Flag size={14} /> {marked[idx] ? "Marked" : "Mark for review"}
            </button>
            {idx < questions.length - 1 ? (
              <button
                onClick={() => setIdx(idx + 1)}
                data-testid="test-next-button"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                data-testid="test-submit-button"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Submit test
              </button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 self-start">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">QUESTION PALETTE</p>
          <div className="mt-4 grid grid-cols-6 lg:grid-cols-5 gap-2" data-testid="test-palette">
            {questions.map((_, qi) => {
              const answered = answers[questions[qi].id] !== undefined;
              return (
                <button
                  key={qi}
                  onClick={() => setIdx(qi)}
                  data-testid={`test-palette-${qi}`}
                  className={`h-10 rounded-xl text-xs font-bold transition-colors ${
                    qi === idx
                      ? "ring-2 ring-brand bg-brand text-white"
                      : marked[qi]
                      ? "bg-amber-100 text-amber-700 border border-amber-300"
                      : answered
                      ? "bg-brand text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {qi + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-5 space-y-2 text-[11px] text-muted-foreground">
            <p><span className="inline-block w-3 h-3 rounded bg-brand mr-2 align-middle" />Answered · {answeredCount}</p>
            <p><span className="inline-block w-3 h-3 rounded bg-amber-200 mr-2 align-middle" />Marked · {Object.values(marked).filter(Boolean).length}</p>
            <p><span className="inline-block w-3 h-3 rounded bg-slate-200 mr-2 align-middle" />Unanswered · {questions.length - answeredCount}</p>
          </div>
          <button
            onClick={() => setConfirming(true)}
            data-testid="test-submit-side-button"
            className="mt-6 w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Submit test
          </button>
        </aside>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" role="dialog" aria-modal="true" data-testid="test-submit-dialog">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-3xl bg-card border border-border p-7"
          >
            <span className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </span>
            <h2 className="font-display font-bold text-xl mt-4">Submit this mock?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {answeredCount} of {questions.length} answered. {questions.length - answeredCount} will be scored as skipped.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirming(false)} data-testid="test-submit-cancel" className="flex-1 rounded-full border border-border py-3 text-sm font-semibold hover:bg-slate-50 transition-colors">
                Keep solving
              </button>
              <button
                onClick={() => submit()}
                disabled={submitting}
                data-testid="test-submit-confirm"
                className="flex-1 rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Scoring…" : "Submit"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
