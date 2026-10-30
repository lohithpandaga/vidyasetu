import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Target } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { formatApiError } from "@/lib/api";

const exams = ["JEE", "NEET", "CBSE", "CUET"];

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", exam: "JEE" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form.name, form.email, form.password, form.exam);
      toast.success("Account created. Let's get that rank.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-2xl border border-white/12 bg-white/[0.05] py-3.5 pl-11 pr-4 text-sm placeholder:text-white/30 focus:border-brand focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-brand-ink text-white flex" data-testid="signup-page">
      <div className="flex-1 flex flex-col p-6 sm:p-12 order-2 lg:order-1">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Back to home" data-testid="signup-back-home"><Logo /></Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors" data-testid="signup-back-link">
            <ArrowLeft size={15} /> Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="w-full max-w-md py-8">
            <h1 className="font-display font-extrabold tracking-tight text-4xl">Start free</h1>
            <p className="mt-2 text-sm text-white/50">First mock test is on us. No card needed.</p>

            <form onSubmit={submit} className="mt-9 space-y-5" data-testid="signup-form">
              <label className="block">
                <span className="text-xs font-medium text-white/60">Full name</span>
                <div className="relative mt-2">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input type="text" required minLength={2} value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Aarav Sharma" data-testid="signup-name-input" className={inputCls} />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-white/60">Email</span>
                <div className="relative mt-2">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com" data-testid="signup-email-input" className={inputCls} />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-white/60">Password</span>
                <div className="relative mt-2">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input type="password" required minLength={6} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="6+ characters" data-testid="signup-password-input" className={inputCls} />
                </div>
              </label>

              <div>
                <span className="text-xs font-medium text-white/60 inline-flex items-center gap-1.5">
                  <Target size={13} /> Your target exam
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {exams.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setForm({ ...form, exam: ex })}
                      data-testid={`signup-exam-${ex.toLowerCase()}`}
                      className={`rounded-full px-5 py-2.5 text-sm font-medium border transition-colors ${
                        form.exam === ex
                          ? "bg-brand border-brand text-white"
                          : "border-white/15 text-white/60 hover:border-white/35 hover:text-white"
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={busy}
                data-testid="signup-submit-button"
                className="w-full rounded-full bg-brand py-4 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-glow"
              >
                {busy ? "Creating account…" : "Create free account"}
              </motion.button>
            </form>

            <p className="mt-8 text-sm text-white/50 text-center">
              Already training?{" "}
              <Link to="/login" data-testid="signup-to-login-link" className="text-brand-light font-semibold hover:text-white transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex w-[45%] relative items-end p-12 overflow-hidden order-1 lg:order-2">
        <img
          src="https://images.unsplash.com/photo-1604177091072-b7b677a077f6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjBzdHVkZW50JTIwc3R1ZHlpbmd8ZW58MHx8fHwxNzkzMjc1OTIxfDA&ixlib=rb-4.1.0&q=85"
          alt="Focused student at a study desk"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/40 to-brand-ink/10" />
        <div className="relative z-10">
          <p className="font-mono text-xs tracking-[0.3em] text-brand-light">DAY ONE</p>
          <p className="font-display font-extrabold text-4xl leading-tight mt-4 max-w-sm">
            Every topper started with a single test.
          </p>
        </div>
      </div>
    </div>
  );
}
