import { motion } from "framer-motion";
import { ArrowRight, Youtube, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const ease = [0.16, 1, 0.3, 1];

const cols = [
  { title: "Product", links: ["Mock tests", "Study library", "Setu AI", "Live classes"] },
  { title: "Company", links: ["About", "Mentors", "Careers", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Refunds"] },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07]">
      <section className="py-24 sm:py-32 text-center relative overflow-hidden" data-testid="cta-section">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-brand/15 blur-[130px]" />
        <div className="relative max-w-3xl mx-auto px-5">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease }}
            className="font-display font-extrabold tracking-tight text-4xl sm:text-6xl leading-[1.02]"
          >
            Your first mock test is <span className="text-brand-light">on us.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="mt-5 text-white/55"
          >
            No card. No commitment. Just a clear picture of where you stand.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease, delay: 0.2 }}
            className="mt-9"
          >
            <Link
              to="/signup"
              data-testid="cta-signup-button"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-glow hover:bg-blue-700 transition-colors"
            >
              Create free account
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="border-t border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-8">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="max-w-xs">
              <Logo />
              <p className="mt-4 text-sm text-white/45 leading-relaxed">
                The AI-powered exam companion for India's most ambitious students.
              </p>
              <div className="mt-6 flex gap-3">
                {[Youtube, Instagram, Twitter].map((Icon, i) => (
                  <a key={i} href="#top" aria-label="Social link" className="w-10 h-10 rounded-full border border-white/12 flex items-center justify-center text-white/55 hover:text-white hover:border-white/35 transition-colors" data-testid={`footer-social-${i}`}>
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-16">
              {cols.map((c) => (
                <div key={c.title}>
                  <p className="font-mono text-[11px] tracking-[0.25em] text-white/40">{c.title.toUpperCase()}</p>
                  <ul className="mt-5 space-y-3">
                    {c.links.map((l) => (
                      <li key={l}>
                        <a href="#top" className="text-sm text-white/60 hover:text-white transition-colors">{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-16 select-none font-display font-extrabold tracking-tight leading-none text-center text-[15vw] md:text-[13vw] text-white/[0.05]" data-testid="footer-wordmark">
            Vidhyasetu
          </p>

          <div className="mt-6 pt-6 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
            <p>© 2026 Vidhyasetu Learning. Made for ambitious students.</p>
            <p className="font-mono">Every topper started with a single test.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
