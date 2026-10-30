import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

const ease = [0.16, 1, 0.3, 1];

const CountUp = ({ to, decimals = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, {
      duration: 1.8,
      ease,
      onUpdate: (val) => setV(val),
    });
    return () => c.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-IN")}
    </span>
  );
};

const stats = [
  { value: 100000, suffix: "+", label: "Active students" },
  { value: 40000, suffix: "+", label: "Hours of live classes" },
  { value: 92, suffix: "%", label: "Average score lift" },
  { value: 4.9, suffix: "/5", label: "Student rating", decimals: 1 },
];

export default function Stats() {
  return (
    <section className="py-20 sm:py-28" data-testid="stats-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-2 lg:grid-cols-4 gap-y-14 gap-x-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease, delay: i * 0.08 }}
            className="lg:border-l lg:border-white/10 lg:pl-8 first:border-0 first:pl-0"
          >
            <p className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl text-white" data-testid={`stat-value-${i}`}>
              <CountUp to={s.value} decimals={s.decimals || 0} />
              <span className="text-brand-light">{s.suffix}</span>
            </p>
            <p className="mt-3 text-sm text-white/50">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
