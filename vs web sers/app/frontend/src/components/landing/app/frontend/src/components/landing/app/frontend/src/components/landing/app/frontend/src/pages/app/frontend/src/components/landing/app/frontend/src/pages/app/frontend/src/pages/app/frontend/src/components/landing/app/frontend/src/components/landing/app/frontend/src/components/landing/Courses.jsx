import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const ease = [0.16, 1, 0.3, 1];

const courses = [
  {
    title: "Rotational Mechanics Masterclass",
    mentor: "Dr. Meera Iyer · IIT Bombay",
    when: "Tomorrow, 6:00 PM IST",
    duration: "90 min",
    seats: "14 of 30 seats left",
    img: "https://images.unsplash.com/photo-1766074903112-79661da9ab45?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwzfHxvbmxpbmUlMjBsaXZlJTIwY2xhc3N8ZW58MHx8fHwxNzkzMjc1OTIxfDA&ixlib=rb-4.1.0&q=85",
    tag: "Physics",
  },
  {
    title: "Organic: Named Reactions Sprint",
    mentor: "Prof. Arjun Rao · IISc",
    when: "Sat, 11:00 AM IST",
    duration: "60 min",
    seats: "22 of 30 seats left",
    img: "https://images.unsplash.com/photo-1514369118554-e20d93546b30?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBzdHVkZW50JTIwc3R1ZHlpbmd8ZW58MHx8fHwxNzkzMjc1OTIxfDA&ixlib=rb-4.1.0&q=85",
    tag: "Chemistry",
  },
  {
    title: "Human Physiology Rapid Revision",
    mentor: "Dr. Nandita Bose · AIIMS Delhi",
    when: "Sun, 5:00 PM IST",
    duration: "75 min",
    seats: "9 of 30 seats left",
    img: "https://images.unsplash.com/photo-1604177091072-b7b677a077f6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjBzdHVkZW50JTIwc3R1ZHlpbmd8ZW58MHx8fHwxNzkzMjc1OTIxfDA&ixlib=rb-4.1.0&q=85",
    tag: "Biology",
  },
  {
    title: "Calculus for JEE Mains 2026",
    mentor: "Vikram Shetty · 12-yr mentor",
    when: "Mon, 7:30 PM IST",
    duration: "90 min",
    seats: "27 of 30 seats left",
    img: "https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGJsdWUlMjB0ZWNobm9sb2d5fGVufDB8fHx8MTc5MzI3NTkyMXww&ixlib=rb-4.1.0&q=85",
    tag: "Mathematics",
  },
];

export default function Courses() {
  return (
    <section id="courses" className="py-24 sm:py-32" data-testid="courses-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <p className="font-mono text-xs tracking-[0.3em] text-brand-light">LIVE &amp; LIMITLESS</p>
            <h2 className="font-display font-extrabold tracking-tight text-4xl sm:text-6xl leading-[1.02] mt-4">
              Learn live from mentors who cracked it.
            </h2>
          </div>
          <p className="text-sm text-white/50 max-w-xs leading-relaxed">
            Small batches. Recorded forever. Doubt window right after every class.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {courses.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, ease, delay: i * 0.08 }}
              className="group relative rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden hover:bg-white/[0.06] transition-colors duration-500"
              data-testid={`course-card-${i}`}
            >
              <div className="relative h-44 overflow-hidden">
                <img src={c.img} alt={c.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                <span className="absolute top-3 left-3 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold">{c.tag}</span>
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-lg leading-snug min-h-[3.2rem]">{c.title}</h3>
                <p className="mt-2 text-xs text-white/50">{c.mentor}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                  <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {c.when}</span>
                  <span className="font-mono">{c.duration}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-4">
                  <span className="text-[11px] text-amber-300/90">{c.seats}</span>
                  <Link to="/signup" data-testid={`course-reserve-${i}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-light hover:text-white transition-colors">
                    Reserve <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
