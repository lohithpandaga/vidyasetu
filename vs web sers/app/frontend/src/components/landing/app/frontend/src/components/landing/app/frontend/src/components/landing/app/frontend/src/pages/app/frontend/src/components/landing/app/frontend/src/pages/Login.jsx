import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { formatApiError } from "@/lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back, topper.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-ink text-white flex" data-testid="login-page">
      <div className="hidden lg:flex w-[45%] relative items-end p-12 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1514369118554-e20d93546b30?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBzdHVkZW50JTIwc3R1ZHlpbmd8ZW58MHx8fHwxNzkzMjc1OTIxfDA&ixlib=rb-4.1.0&q=85"
          alt="Student preparing for exams"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/40 to-brand-ink/10" />
        <div className="relative z-10">
          <p className="font-mono text-xs tracking-[0.3em] text-brand-light">WELCOME BACK</p>
          <p className="font-display font-extrabold text-4xl leading-tight mt-4 max-w-sm">
            Your streak is waiting for you.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 sm:p-12">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Back to home" data-testid="login-back-home"><Logo /></Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors" data-testid="login-back-link">
            <ArrowLeft size={15} /> Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="w-full max-w-md">
            <h1 className="font-display font-extrabold tracking-tight text-4xl">Log in</h1>
            <p className="mt-2 text-sm text-white/50">Pick up exactly where you left off.</p>

            <form onSubmit={submit} className="mt-9 space-y-5" data-testid="login-form">
              <label className="block">
                <span className="text-xs font-medium text-white/60">Email</span>
                <div className="relative mt-2">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    data-testid="login-email-input"
                    className="w-full rounded-2xl border border-white/12 bg-white/[0.05] py-3.5 pl-11 pr-4 text-sm placeholder:text-white/30 focus:border-brand focus:outline-none transition-colors"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-white/60">Password</span>
                <div className="relative mt-2">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Your password"
                    data-testid="login-password-input"
                    className="w-full rounded-2xl border border-white/12 bg-white/[0.05] py-3.5 pl-11 pr-4 text-sm placeholder:text-white/30 focus:border-brand focus:outline-none transition-colors"
                  />
                </div>
              </label>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={busy}
                data-testid="login-submit-button"
                className="w-full rounded-full bg-brand py-4 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-glow"
              >
                {busy ? "Logging in…" : "Log in"}
              </motion.button>
            </form>

            <div className="mt-6 rounded-2xl border border-brand/25 bg-brand/10 px-5 py-4 text-sm text-white/70" data-testid="login-demo-hint">
              <span className="font-semibold text-brand-light">Try the demo —</span>{" "}
              student@vidhyasetu.in &nbsp;/&nbsp; demo1234
            </div>

            <p className="mt-8 text-sm text-white/50 text-center">
              New here?{" "}
              <Link to="/signup" data-testid="login-to-signup-link" className="text-brand-light font-semibold hover:text-white transition-colors">
                Create a free account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
