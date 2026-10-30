import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, PlayCircle, Sigma, Archive, BookOpen } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const ease = [0.16, 1, 0.3, 1];
const subjects = ["All", "Physics", "Chemistry", "Mathematics", "Biology"];

const typeIcon = {
  Notes: FileText,
  Video: PlayCircle,
  "Formula sheet": Sigma,
  "Previous paper": Archive,
};

export default function Library() {
  const [subject, setSubject] = useState("All");
  const { data: items, isLoading } = useQuery({
    queryKey: ["library", subject],
    queryFn: async () => (await api.get(`/api/library?subject=${subject}`)).data,
  });

  return (
    <div data-testid="library-page">
      <div className="max-w-xl">
        <p className="font-mono text-xs tracking-[0.25em] text-brand">STUDY LIBRARY</p>
        <h1 className="font-display font-extrabold tracking-tight text-4xl mt-2">Distilled, not dumped.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Notes, revision videos, formula sheets and a decade of papers — curated to what actually gets asked.
        </p>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1" role="tablist" data-testid="library-filters">
        {subjects.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={subject === s}
            onClick={() => setSubject(s)}
            data-testid={`library-filter-${s.toLowerCase()}`}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium border transition-colors ${
              subject === s ? "bg-brand border-brand text-white" : "border-border bg-card text-slate-600 hover:border-slate-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-10 font-mono text-sm text-muted-foreground animate-pulse" data-testid="library-loading">stocking the shelves…</p>
      ) : items?.length ? (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((m, i) => {
            const Icon = typeIcon[m.type] || BookOpen;
            return (
              <motion.article
                key={m._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 hover:border-brand/40 transition-colors group"
                data-testid={`library-card-${i}`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-2xl bg-blue-50 text-brand flex items-center justify-center">
                    <Icon size={19} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">{m.level}</span>
                </div>
                <h2 className="font-display font-bold text-lg leading-snug mt-4">{m.title}</h2>
                <p className="mt-2 text-xs text-muted-foreground font-mono">{m.meta}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-[11px] font-semibold text-brand">{m.subject}</span>
                  <button
                    onClick={() => toast.success(`"${m.title}" added to your shelf.`)}
                    data-testid={`library-open-${i}`}
                    className="text-xs font-semibold text-slate-500 group-hover:text-brand transition-colors"
                  >
                    Open
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <p className="mt-10 text-sm text-muted-foreground" data-testid="library-empty">Nothing here yet — try another subject.</p>
      )}
    </div>
  );
}
