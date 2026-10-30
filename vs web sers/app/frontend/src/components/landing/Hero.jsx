import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { ArrowRight, Play, TrendingUp, Flame, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ease = [0.16, 1, 0.3, 1];

const Line = ({ children, delay }) => (
  <span className="block overflow-hidden pb-1">
    <motion.span
      className="block"
      initial={{ y: "110%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 1, ease, delay }}
    >
      {children}
    </motion.span>
  </span>
);

const Face = ({ transform, children, className = "" }) => (
  <div
    className={`absolute inset-0 flex items-center justify-center rounded-[4px] border border-brand/30 bg-gradient-to-br from-white/[0.06] to-white/[0.015] ${className}`}
    style={{ transform }}
  >
    {children}
  </div>
);

const KnowledgeCube = () => {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const srx = useSpring(my, { stiffness: 55, damping: 15 });
  const sry = useSpring(mx, { stiffness: 55, damping: 15 });
  const rotateX = useTransform(srx, (v) => -10 + v * -14);
  const rotateY = useTransform(sry, (v) => v * 16);

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  return (
    <div ref={ref} onMouseMove={onMove} className="relative h-[420px] sm:h-[480px] flex items-center justify-center" data-testid="hero-cube">
      <motion.div
        className="w-56 h-56 sm:w-64 sm:h-64 [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
      >
        <div className="cube-spin absolute inset-0 [transform-style:preserve-3d]">
          <Face transform="translateZ(112px)">
            <span className="font-display font-extrabold text-7xl text-white">वि</span>
          </Face>
          <Face transform="rotateY(90deg) translateZ(112px)">
            <span className="font-display font-extrabold text-7xl text-brand-light">द्या</span>
          </Face>
          <Face transform="rotateY(180deg) translateZ(112px)">
            <span className="font-mono text-5xl text-white/80">VS</span>
          </Face>
          <Face transform="rotateY(-90deg) translateZ(112px)">
            <span className="font-display font-extrabold text-7xl text-white">ज्ञा</span>
          </Face>
          <Face transform="rotateX(90deg) translateZ(112px)">
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i % 3 === 0 ? "bg-brand-light" : "bg-white/25"}`} />
              ))}
            </div>
          </Face>
          <Face transform="rotateX(-90deg) translateZ(112px)">
            <span className="font-mono text-sm tracking-[0.4em] text-brand-light">EST. 2026</span>
          </Face>
        </div>
      </motion.div>
      <div className="absolute inset-0 -z-10 rounded-full bg-brand/20 blur-[110px]" />
    </div>
  );
};

export default function Hero() {
  const { scrollYProgress } = useScroll();
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const cubeY = useTransform(scrollYProgress, [0, 0.25], [0, -50]);

  return (
    <section id="top" className="relative pt-36 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
      <motion.div style={{ y: glowY }} className="pointer-events-none absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-brand/15 blur-[140px]" />
      <motion.div style={{ y: glowY }} className="pointer-events-none absolute top-1/3 -right-52 w-[640px] h-[640px] rounded-full bg-blue-800/20 blur-[130px]" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-14 items-center">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="inline-flex items-center gap-2.5 rounded-full glass px-4 py-2 text-xs font-medium text-white/75"
            data-testid="hero-eyebrow"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            Setu AI is live — ask any doubt, anytime
          </motion.div>

          <h1 className="font-display font-extrabold tracking-[-0.035em] text-[clamp(2.75rem,7.2vw,5.5rem)] leading-[0.98] mt-7" data-testid="hero-heading">
            <Line delay={0.1}>Every topper</Line>
            <Line delay={0.22}>started with</Line>
            <Line delay={0.34}>
              <span className="text-brand-light">a single test.</span>
            </Line>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.55 }}
            className="mt-7 max-w-xl text-base sm:text-lg text-white/60 leading-relaxed"
            data-testid="hero-subline"
          >
            Vidhyasetu turns your syllabus into a system — adaptive mock tests, an AI mentor
            for every doubt, and analytics that tell you exactly what to fix next.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.7 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              <Link
                to="/signup"
                data-testid="hero-cta-primary"
                className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-sm sm:text-base font-semibold text-white shadow-glow hover:bg-blue-700 transition-colors"
              >
                Start free
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <a
                href="#features"
                data-testid="hero-cta-secondary"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm sm:text-base font-medium text-white/85 hover:border-white/35 hover:text-white transition-colors"
              >
                <Play size={16} /> See how it works
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-12 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {["AS", "RV", "PM", "AK"].map((n, i) => (
                <span key={n} className={`w-10 h-10 rounded-full border-2 border-brand-ink flex items-center justify-center text-[11px] font-bold ${["bg-blue-600", "bg-blue-800", "bg-blue-500", "bg-indigo-700"][i]}`}>
                  {n}
                </span>
              ))}
            </div>
            <p className="text-sm text-white/55">
              Trusted by <span className="text-white font-semibold">1,00,000+</span> JEE, NEET &amp; CBSE aspirants
            </p>
          </motion.div>
        </div>

        <motion.div style={{ y: cubeY }} className="lg:col-span-5 relative" data-testid="hero-visual">
          <KnowledgeCube />
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-8 right-2 sm:right-8 glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-card"
            data-testid="hero-chip-accuracy"
          >
            <span className="w-9 h-9 rounded-xl bg-emerald-400/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </span>
            <div>
              <p className="font-display font-bold text-lg leading-none">+18%</p>
              <p className="text-[11px] text-white/55 mt-1">accuracy in 3 weeks</p>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute bottom-14 left-0 sm:left-6 glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-card"
            data-testid="hero-chip-streak"
          >
            <span className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
              <Flame size={18} />
            </span>
            <div>
              <p className="font-display font-bold text-lg leading-none">12-day streak</p>
              <p className="text-[11px] text-white/55 mt-1">keep the fire going</p>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
            className="absolute bottom-0 right-4 sm:right-14 glass rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-card"
            data-testid="hero-chip-ai"
          >
            <span className="w-8 h-8 rounded-lg bg-brand/20 text-brand-light flex items-center justify-center">
              <Sparkles size={15} />
            </span>
            <p className="font-mono text-xs text-white/70">rank predictor · 98.2</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
