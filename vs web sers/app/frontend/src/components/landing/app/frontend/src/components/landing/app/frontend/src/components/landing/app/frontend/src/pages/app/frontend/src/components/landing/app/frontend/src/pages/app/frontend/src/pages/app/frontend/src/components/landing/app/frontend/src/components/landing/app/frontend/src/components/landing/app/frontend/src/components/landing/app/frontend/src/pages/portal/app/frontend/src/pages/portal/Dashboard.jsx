import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Flame, FileText, Target, Trophy, CalendarClock, ArrowRight, Radio } from "lucide-react";
import api from "@/lib/api";

const ease = [0.16, 1, 0.3, 1];

const StatCard = ({ icon: Icon, label, value, tint, testid }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease }}
    className="rounded-2xl border border-border bg-card p-6"
    data-testid={testid}
  >
    <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${tint}`}>
      <Icon size={18} />
    </span>
    <p className="mt-4 font-display font-extrabold text-3xl tracking-tight">{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/api/dashboard")).data,
  });

  if (isLoading || !data) {
    return <p className="font-mono text-sm text-muted-foreground animate-pulse" data-testid="dashboard-loading">crunching your numbers…</p>;
  }

  const { stats } = data;

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.25em] text-brand">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}</p>
          <h1 className="font-display font-extrabold tracking-tight text-4xl mt-2">
            Good to see you, {data.name}.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">One test today keeps the rank fear away.</p>
        </div>
        <Link
          to="/dashboard/tests"
          data-testid="dashboard-start-test"
          className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-glow"
        >
          Take a mock test <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Mock tests taken" value={stats.tests_taken} tint="bg-blue-50 text-brand" testid="stat-tests-taken" />
        <StatCard icon={Target} label="Average accuracy" value={`${stats.avg_accuracy}%`} tint="bg-indigo-50 text-indigo-600" testid="stat-avg-accuracy" />
        <StatCard icon={Trophy} label="Best score" value={`${stats.best_accuracy}%`} tint="bg-amber-50 text-amber-600" testid="stat-best-score" />
        <StatCard icon={Flame} label="Day streak" value={stats.streak} tint="bg-red-50 text-red-500" testid="stat-streak" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card p-6"
          data-testid="dashboard-progress-chart"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl">Accuracy curve</h2>
              <p className="text-xs text-muted-foreground mt-1">Last {data.progress.length} tests — the only trend that matters</p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">%</span>
          </div>
          <div className="mt-6 h-64">
            {data.progress.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.progress} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="acc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Accuracy"]}
                    contentStyle={{ borderRadius: 14, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="accuracy" stroke="#2563EB" strokeWidth={2.5} fill="url(#acc)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                <FileText size={28} className="text-slate-300" />
                <p className="text-sm">Take two tests to unlock your curve.</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          className="rounded-2xl border border-border bg-card p-6"
          data-testid="dashboard-subjects"
        >
          <h2 className="font-display font-bold text-xl">Subject strength</h2>
          <p className="text-xs text-muted-foreground mt-1">Attack the shortest bar first</p>
          <div className="mt-6 space-y-5">
            {data.subjects.length ? (
              data.subjects.map((s) => (
                <div key={s.subject} data-testid={`subject-bar-${s.subject.toLowerCase()}`}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium">{s.subject}</span>
                    <span className="font-mono text-muted-foreground">{s.accuracy}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.accuracy}%` }}
                      transition={{ duration: 1, ease, delay: 0.3 }}
                      className={`h-full rounded-full ${s.accuracy >= 70 ? "bg-emerald-500" : s.accuracy >= 50 ? "bg-brand" : "bg-amber-500"}`}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Take your first test to see subject strength.</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6"
          data-testid="dashboard-schedule"
        >
          <div className="flex items-center gap-2.5">
            <CalendarClock size={18} className="text-brand" />
            <h2 className="font-display font-bold text-xl">Upcoming live classes</h2>
          </div>
          <ul className="mt-5 space-y-3">
            {data.schedule.map((s) => (
              <li key={s._id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.mentor}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-brand inline-flex items-center gap-1"><Radio size={11} /> {new Date(s.when).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{s.duration}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.25 }}
          className="rounded-2xl border border-border bg-card p-6"
          data-testid="dashboard-recent"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl">Recent results</h2>
            <Link to="/dashboard/tests" className="text-xs font-semibold text-brand hover:underline" data-testid="dashboard-view-tests">All tests</Link>
          </div>
          <ul className="mt-5 space-y-3">
            {data.recent_results.length ? (
              data.recent_results.map((r) => (
                <li key={r._id}>
                  <Link
                    to={`/dashboard/results/${r._id}`}
                    data-testid={`recent-result-${r._id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3.5 hover:border-brand/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{r.test_title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                        {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {r.correct}/{r.total} correct
                      </p>
                    </div>
                    <span className={`font-display font-extrabold text-2xl ${r.accuracy >= 70 ? "text-emerald-600" : r.accuracy >= 50 ? "text-brand" : "text-amber-600"}`}>
                      {r.accuracy}%
                    </span>
                  </Link>
                </li>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No attempts yet — your first one is free.</p>
            )}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
