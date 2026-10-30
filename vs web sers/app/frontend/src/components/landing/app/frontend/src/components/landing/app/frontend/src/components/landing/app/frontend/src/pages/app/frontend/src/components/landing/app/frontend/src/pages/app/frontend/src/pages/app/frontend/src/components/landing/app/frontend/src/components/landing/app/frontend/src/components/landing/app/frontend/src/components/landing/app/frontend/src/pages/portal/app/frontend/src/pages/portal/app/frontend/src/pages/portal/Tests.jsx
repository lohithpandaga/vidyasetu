import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ListChecks, Play, SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import api from "@/lib/api";

const ease = [0.16, 1, 0.3, 1];

const DiffIcon = ({ d }) =>
  d === "Easy" ? <SignalLow size={14} /> : d === "Moderate" ? <SignalMedium size={14} /> : <SignalHigh size={14} />;

export default function Tests() {
  const navigate = useNavigate();
  const { data: tests, isLoading } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => (await api.get("/api/tests")).data,
  });

  return (
    <div data-testid="tests-page">
      <div className="max-w-xl">
        <p className="font-mono text-xs tracking-[0.25em] text-brand">MOCK ENGINE</p>
        <h1 className="font-display font-extrabold tracking-tight text-4xl mt-2">Pick your battle.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Real timers, real pressure, instant analytics. Your first attempt is free.
        </p>
      </div>

      {isLoading ? (
        <p className="mt-10 font-mono text-sm text-muted-foreground animate-pulse" data-testid="tests-loading">loading tests…</p>
      ) : (
        <div className="mt-9 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((t, i) => (
            <motion.article
              key={t._id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: i * 0.07 }}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 hover:border-brand/40 transition-colors"
              data-testid={`test-card-${i}`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-50 text-brand px-3 py-1 text-[11px] font-semibold">{t.exam}</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                  <DiffIcon d={t.difficulty} /> {t.difficulty}
                </span>
              </div>
              <h2 className="font-display font-bold text-xl mt-4 leading-snug">{t.title}</h2>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">{t.description}</p>
              <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {t.duration_min} min</span>
                <span className="inline-flex items-center gap-1.5"><ListChecks size={13} /> {t.questions_count} questions</span>
              </div>
              <button
                onClick={() => navigate(`/dashboard/tests/${t._id}`)}
                data-testid={`test-start-${i}`}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Play size={14} /> Start test
              </button>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
