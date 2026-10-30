import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Bot, Library, CalendarCheck, Radio } from "lucide-react";
import { Link } from "react-router-dom";

const ease = [0.16, 1, 0.3, 1];
const card =
  "relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden hover:bg-white/[0.06] transition-colors duration-500 group";

const Eyebrow = () => (
  <div className="mb-14 max-w-2xl" data-testid="features-heading">
    <p className="font-mono text-xs tracking-[0.3em] text-brand-light">THE SYSTEM</p>
    <h2 className="font-display font-extrabold tracking-tight text-4xl sm:text-6xl leading-[1.02] mt-4">
      Everything between <span className="text-brand-light">doubt</span> and rank, in one place.
    </h2>
  </div>
);

const MiniChart = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const bars = [42, 38, 55, 61, 58, 72, 84, 91];
  return (
    <div ref={ref} className="mt-8 flex items-end gap-2.5 h-36" aria-hidden="true">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end h-full">
          <motion.div
            initial={{ height: 0 }}
            animate={inView ? { height: `${h}%` } : {}}
            transition={{ duration: 0.9, ease, delay: i * 0.07 }}
            className={`rounded-t-lg ${i === bars.length - 1 ? "bg-brand shadow-glow" : "bg-gradient-to-t from-blue-900/60 to-brand/70"}`}
          />
        </div>
      ))}
    </div>
  );
};

const TypingChat = () => {
  const exchanges = [
    { q: "Why is entropy always increasing?", a: "The universe moves toward disorder — think of milk in chai, never un-mixing." },
    { q: "Trick to remember Mandler's rule?", a: "Anchor the formula to a story, not a list. Try this one…" },
  ];
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    const ex = exchanges[idx];
    let i = 0;
    setTyped("");
    const t = setInterval(() => {
      i += 1;
      setTyped(ex.a.slice(0, i));
      if (i >= ex.a.length) {
        clearInterval(t);
        setTimeout(() => setIdx((idx + 1) % exchanges.length), 3200);
      }
    }, 34);
    return () => clearInterval(t);
  }, [idx]);

  return (
    <div className="mt-8 space-y-3" aria-hidden="true" data-testid="bento-typing-demo">
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-sm text-white">
        {exchanges[idx].q}
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.07] border border-white/10 px-4 py-2.5 text-sm text-white/80 min-h-[42px]">
        {typed}
        <span className="inline-block w-[2px] h-4 bg-brand-light ml-0.5 animate-pulse align-middle" />
      </div>
    </div>
  );
};

const WeekGrid = () => (
  <div className="mt-8 grid grid-cols-7 gap-2" aria-hidden="true">
    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
      <div key={i} className="flex flex-col items-center gap-2">
        <span className="text-[10px] text-white/40 font-mono">{d}</span>
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 16 }}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-[10px] font-bold ${
            i < 5 ? "bg-brand/90 text-white" : i === 5 ? "bg-amber-400/90 text-black" : "border border-dashed border-white/20 text-white/30"
          }`}
        >
          {i < 5 ? "✓" : i === 5 ? "AI" : "—"}
        </motion.div>
      </div>
    ))}
  </div>
);

export default function Bento() {
  return (
    <section id="features" className="py-24 sm:py-32 relative" data-testid="bento-section">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-brand/[0.07] blur-[160px]" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <Eyebrow />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease }}
            className={`${card} lg:col-span-7 p-8`}
            data-testid="bento-mock-tests"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.25em] text-brand-light">01 · MOCK ENGINE</p>
                <h3 className="font-display font-bold text-2xl sm:text-3xl mt-3 leading-tight">
                  Mock tests that think like examiners
                </h3>
                <p className="mt-3 text-sm text-white/55 max-w-md leading-relaxed">
                  Real exam timers, negative marking, and question-level analytics that show
                  exactly where your marks leak.
                </p>
              </div>
              <Link to="/signup" data-testid="bento-mock-tests-link" aria-label="Try mock tests" className="shrink-0 w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/70 group-hover:bg-brand group-hover:border-brand group-hover:text-white transition-colors duration-300">
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <MiniChart />
            <div className="flex justify-between mt-3 font-mono text-[10px] text-white/35">
              <span>TEST 1</span><span>TEST 8 · 91%</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease, delay: 0.08 }}
            className={`${card} lg:col-span-5 p-8`}
            data-testid="bento-ai"
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] tracking-[0.25em] text-brand-light">02 · SETU AI</p>
              <Bot size={20} className="text-brand-light" />
            </div>
            <h3 className="font-display font-bold text-2xl sm:text-3xl mt-3 leading-tight">
              A mentor for every 2 a.m. doubt
            </h3>
            <p className="mt-3 text-sm text-white/55 leading-relaxed">
              Step-by-step explanations with a memory trick at the end — not just the answer.
            </p>
            <TypingChat />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease, delay: 0.05 }}
            className={`${card} lg:col-span-4 p-0`}
            data-testid="bento-library"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1514369118554-e20d93546b30?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBzdHVkZW50JTIwc3R1ZHlpbmd8ZW58MHx8fHwxNzkzMjc1OTIxfDA&ixlib=rb-4.1.0&q=85"
                alt="Student studying with notes"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent" />
              <div className="absolute bottom-3 left-4 flex gap-2">
                {["Physics", "Biology", "Maths"].map((s) => (
                  <span key={s} className="rounded-full bg-black/50 backdrop-blur px-3 py-1 text-[11px] font-medium text-white/85">{s}</span>
                ))}
              </div>
            </div>
            <div className="p-7 pt-5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] tracking-[0.25em] text-brand-light">03 · LIBRARY</p>
                <Library size={18} className="text-brand-light" />
              </div>
              <h3 className="font-display font-bold text-xl mt-3">Notes, videos &amp; PYQs, curated</h3>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">
                Every chapter distilled to what actually gets asked.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease, delay: 0.12 }}
            className={`${card} lg:col-span-4 p-8`}
            data-testid="bento-timetable"
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] tracking-[0.25em] text-brand-light">04 · DISCIPLINE</p>
              <CalendarCheck size={18} className="text-brand-light" />
            </div>
            <h3 className="font-display font-bold text-xl mt-3">Timetable &amp; streaks that stick</h3>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">
              A daily plan you can actually keep — and a flame you won't want to lose.
            </p>
            <WeekGrid />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease, delay: 0.18 }}
            className={`${card} lg:col-span-4 p-0`}
            data-testid="bento-live"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1766074903112-79661da9ab45?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwzfHxvbmxpbmUlMjBsaXZlJTIwY2xhc3N8ZW58MHx8fHwxNzkzMjc1OTIxfDA&ixlib=rb-4.1.0&q=85"
                alt="Live online class in progress"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-[11px] font-semibold">
                <Radio size={11} /> LIVE SOON
              </span>
            </div>
            <div className="p-7 pt-5">
              <p className="font-mono text-[11px] tracking-[0.25em] text-brand-light">05 · LIVE CLASSES</p>
              <h3 className="font-display font-bold text-xl mt-3">Small batches, mentors who cracked it</h3>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">
                IIT-B and AIIMS mentors, max 30 students per batch.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
