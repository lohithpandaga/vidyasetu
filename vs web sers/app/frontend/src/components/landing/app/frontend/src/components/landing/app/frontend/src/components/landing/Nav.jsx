import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/auth";

const links = [
  { label: "Features", href: "#features" },
  { label: "Live classes", href: "#courses" },
  { label: "Stories", href: "#stories" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "glass" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
        <a href="#top" aria-label="Vidhyasetu home" data-testid="nav-logo-link">
          <Logo />
        </a>

        <div className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-sm text-white/65 hover:text-white transition-colors after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-brand-light after:transition-all after:duration-300 hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              data-testid="nav-dashboard-button"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Open dashboard <ArrowUpRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                data-testid="nav-login-link"
                className="text-sm text-white/70 hover:text-white transition-colors px-3 py-2"
              >
                Log in
              </Link>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Link
                  to="/signup"
                  data-testid="nav-signup-button"
                  className="inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-glow"
                >
                  Get started free
                </Link>
              </motion.div>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-white"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          data-testid="nav-mobile-toggle"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden glass mx-4 rounded-2xl p-5 space-y-1"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-3 px-2 text-white/80 border-b border-white/5 last:border-0"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              {user ? (
                <Link to="/dashboard" onClick={() => setOpen(false)} className="flex-1 text-center rounded-full bg-brand px-5 py-3 text-sm font-semibold">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center rounded-full border border-white/15 px-5 py-3 text-sm font-medium">
                    Log in
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 text-center rounded-full bg-brand px-5 py-3 text-sm font-semibold">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
