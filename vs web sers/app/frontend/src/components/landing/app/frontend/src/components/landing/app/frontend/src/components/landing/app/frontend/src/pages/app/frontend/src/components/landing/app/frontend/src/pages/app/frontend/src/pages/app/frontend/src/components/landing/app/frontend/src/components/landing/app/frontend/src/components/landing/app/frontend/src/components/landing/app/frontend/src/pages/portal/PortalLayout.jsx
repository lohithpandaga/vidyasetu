import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Library as LibraryIcon, Bot, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const items = [
  { to: "/dashboard", end: true, label: "Dashboard", icon: LayoutDashboard, id: "nav-dashboard" },
  { to: "/dashboard/tests", label: "Mock tests", icon: FileText, id: "nav-tests" },
  { to: "/dashboard/library", label: "Library", icon: LibraryIcon, id: "nav-library" },
  { to: "/dashboard/ai", label: "Doubt AI", icon: Bot, id: "nav-ai" },
];

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = async () => {
    await logout();
    toast.success("Logged out. See you tomorrow — streaks matter.");
    navigate("/");
  };

  const NavItems = ({ onNavigate }) => (
    <>
      {items.map(({ to, end, label, icon: Icon, id }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          data-testid={id}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand text-white shadow-glow"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`
          }
        >
          <Icon size={17} /> {label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="theme-light min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" data-testid="portal-layout">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col border-r border-border bg-card px-5 py-7 z-40">
        <a href="/" aria-label="Vidhyasetu home" data-testid="portal-logo-link">
          <Logo dark size={34} />
        </a>
        <nav className="mt-10 space-y-2 flex-1">
          <NavItems />
        </nav>
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold shrink-0">
              {user?.name?.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{user?.exam} track</p>
            </div>
          </div>
          <button
            onClick={doLogout}
            data-testid="portal-logout-button"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full border border-border py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LogOut size={13} /> Log out
          </button>
        </div>
      </aside>

      <div className="lg:hidden sticky top-0 z-40 glass !bg-white/80 border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <a href="/"><Logo dark size={30} /></a>
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu" data-testid="portal-mobile-toggle" className="p-2 text-slate-700">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <nav className="px-4 pb-4 space-y-1.5" onClick={() => setOpen(false)}>
            <NavItems onNavigate={() => setOpen(false)} />
            <button onClick={doLogout} data-testid="portal-logout-button-mobile" className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-semibold text-slate-600">
              <LogOut size={15} /> Log out
            </button>
          </nav>
        )}
      </div>

      <main className="lg:pl-72">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
