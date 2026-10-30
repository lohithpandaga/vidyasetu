import MarqueeBase from "react-fast-marquee";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const ease = [0.16, 1, 0.3, 1];

const reviews = [
  { name: "Ananya S.", exam: "NEET 2025 · AIR 312", initials: "AS", color: "bg-blue-600", text: "The analytics showed me I was losing 20 marks to silly mistakes. Fixed that in three weeks." },
  { name: "Rohan V.", exam: "JEE Advanced", initials: "RV", color: "bg-indigo-700", text: "Setu AI explains better than my coaching did at 11pm. That alone took me from 84 to 96 in Chemistry." },
  { name: "Priya M.", exam: "CBSE Class 10", initials: "PM", color: "bg-blue-500", text: "My whole timetable is planned for me. I just show up and tick boxes." },
  { name: "Aditya K.", exam: "JEE Main 99.1%ile", initials: "AK", color: "bg-blue-800", text: "The mock timer feels exactly like the real NTA interface. Exam day had zero surprises." },
  { name: "Sneha R.", exam: "NEET Dropper", initials: "SR", color: "bg-cyan-700", text: "NCERT line-by-line notes in the library are gold. Nothing outside them was asked." },
  { name: "Kabir T.", exam: "CUET 2025", initials: "KT", color: "bg-blue-700", text: "My 40-day streak turned revision into a habit. Missed exactly zero deadlines since." },
];

const Card = ({ r }) => (
  <figure className="mx-3 w-[320px] sm:w-[380px] shrink-0 rounded-3xl border border-white/10 bg-white/[0.04] p-7">
    <Quote size={18} className="text-brand-light" />
    <blockquote className="mt-4 text-sm sm:text-[15px] text-white/80 leading-relaxed min-h-[84px]">
      {r.text}
    </blockquote>
    <figcaption className="mt-5 flex items-center gap-3">
      <span className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center text-xs font-bold`}>{r.initials}</span>
      <div>
        <p className="text-sm font-semibold">{r.name}</p>
        <p className="text-[11px] text-white/45 font-mono">{r.exam}</p>
      </div>
    </figcaption>
  </figure>
);

export default function Testimonials() {
  return (
    <section id="stories" className="py-24 sm:py-32 overflow-hidden" data-testid="stories-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-14">
        <p className="font-mono text-xs tracking-[0.3em] text-brand-light">PROOF, NOT PROMISES</p>
        <h2 className="font-display font-extrabold tracking-tight text-4xl sm:text-6xl leading-[1.02] mt-4 max-w-2xl">
          Students who put in the work.
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease }}
        className="space-y-5 mask-fade-x"
        data-testid="stories-marquee"
      >
        <MarqueeBase speed={38} gradient={false}>
          <div className="flex">{reviews.slice(0, 3).map((r) => <Card key={r.name} r={r} />)}</div>
        </MarqueeBase>
        <MarqueeBase speed={38} gradient={false} direction="right">
          <div className="flex">{reviews.slice(3).map((r) => <Card key={r.name} r={r} />)}</div>
        </MarqueeBase>
      </motion.div>
    </section>
  );
}
