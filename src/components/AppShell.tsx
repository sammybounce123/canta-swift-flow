import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Receipt,
  Users,
  Building2,
  Sparkles,
  Shield,
  Settings,
  Bell,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  UserCog,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRole, ALL_ROLES, type Permission, type Role } from "@/components/RoleProvider";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; perm: Permission };
const nav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true, perm: "view_dashboard" },
  { to: "/wallets", label: "Wallets", icon: Wallet, perm: "view_wallets" },
  { to: "/fx", label: "FX / Exchange", icon: ArrowLeftRight, perm: "view_fx" },
  { to: "/transactions", label: "Transactions", icon: Receipt, perm: "view_transactions" },
  { to: "/beneficiaries", label: "Beneficiaries", icon: Users, perm: "view_beneficiaries" },
  { to: "/treasury", label: "Treasury", icon: Building2, perm: "view_treasury" },
  { to: "/ai-insights", label: "AI Insights", icon: Sparkles, perm: "view_ai" },
  { to: "/team", label: "Team & Roles", icon: Shield, perm: "view_team" },
  { to: "/settings", label: "Settings", icon: Settings, perm: "view_settings" },
];

const initialRates = [
  { pair: "USD/NGN", rate: 1612.45, change: 0.32 },
  { pair: "EUR/NGN", rate: 1745.10, change: -0.18 },
  { pair: "GBP/NGN", rate: 2048.77, change: 0.21 },
];

function FxTicker() {
  const [rates, setRates] = useState(initialRates);
  const [flash, setFlash] = useState<Record<string, "up" | "down" | null>>({});

  useEffect(() => {
    const id = setInterval(() => {
      setRates((prev) =>
        prev.map((r) => {
          const delta = (Math.random() - 0.5) * 4;
          const newRate = +(r.rate + delta).toFixed(2);
          setFlash((f) => ({ ...f, [r.pair]: delta >= 0 ? "up" : "down" }));
          return { ...r, rate: newRate, change: +(((delta / r.rate) * 100) + r.change * 0.6).toFixed(2) };
        })
      );
      setTimeout(() => setFlash({}), 800);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-full bg-secondary/60 border border-border">
      {rates.map((r) => (
        <div
          key={r.pair}
          className={`flex items-center gap-2 text-xs font-medium ${
            flash[r.pair] === "up" ? "flash-up" : flash[r.pair] === "down" ? "flash-down" : ""
          } px-2 py-0.5 rounded`}
        >
          <span className="text-muted-foreground">{r.pair}</span>
          <span className="font-semibold tabular-nums">{r.rate.toLocaleString()}</span>
          <span
            className={`flex items-center gap-0.5 ${
              r.change >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {r.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(r.change).toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role, setRole, can, profile } = useRole();
  const visibleNav = nav.filter((n) => can(n.perm));

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground sticky top-0 h-screen">
        <Link to="/dashboard" className="px-6 py-5 flex items-center gap-2 border-b border-sidebar-border hover:bg-sidebar-accent/30">
          <div className="h-9 w-9 rounded-xl bg-gradient-accent grid place-items-center text-sidebar-primary-foreground font-bold shadow-glow">
            C
          </div>
          <div>
            <div className="font-semibold tracking-tight">Canta</div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              Enterprise FX
            </div>
          </div>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as never}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="rounded-xl p-3 bg-sidebar-accent/60 border border-sidebar-border">
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60 mb-1">Signed in as</div>
            <div className="text-sm font-semibold">{profile.name}</div>
            <div className="text-[11px] text-sidebar-foreground/70">{role} · {profile.title}</div>
          </div>
          <div className="rounded-xl p-3 bg-sidebar-accent/60 border border-sidebar-border">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sidebar-foreground/80">Bank-grade · NDIC ready</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="h-16 px-4 lg:px-8 flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-sm font-medium">
              <div className="h-6 w-6 rounded bg-gradient-primary text-primary-foreground grid place-items-center text-[10px] font-bold">
                NX
              </div>
              <span className="hidden sm:inline">Niger Delta Exploration</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md ml-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full pl-9 pr-3 py-2 text-sm bg-secondary/60 border border-transparent focus:border-ring focus:outline-none rounded-lg"
                  placeholder="Search transactions, beneficiaries…"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <FxTicker />
              <button className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                  AO
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-semibold">Adaeze O.</div>
                  <div className="text-[10px] text-muted-foreground">Treasury Admin</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
