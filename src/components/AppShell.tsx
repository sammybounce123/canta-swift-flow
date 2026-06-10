import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Wallet, ArrowLeftRight, Receipt, Users, Building2,
  Sparkles, Shield, Settings, Bell, Search, ChevronDown, TrendingUp, TrendingDown,
  UserCog, Check, Menu, FileText, Ship, Truck, Factory, Globe, CreditCard,
  Brain, ShieldCheck, Plug, MessageCircle, CheckSquare, Crown, Calculator,
  Link as LinkIcon, BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRole, ALL_ROLES, type Role } from "@/components/RoleProvider";
import { loadProfile, getSidebarForWorkspace, defaultFlagsFor, type SidebarItem } from "@/lib/profile";
import { useMode, ALL_MODES } from "@/components/ModeProvider";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

const ICONS: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard, wallet: Wallet, fx: ArrowLeftRight, receipt: Receipt,
  users: Users, building: Building2, settings: Settings, team: Shield,
  trade: FileText, ship: Ship, freight: Truck, factory: Factory, globe: Globe,
  card: CreditCard, brain: Brain, "shield-check": ShieldCheck, plug: Plug,
  whatsapp: MessageCircle, check: CheckSquare, crown: Crown, calculator: Calculator,
  file: FileText, link: LinkIcon, chart: BarChart3, importer: Building2,
  shield: ShieldCheck, sparkles: Sparkles,
};
// Sidebar is now derived per-workspace from getSidebarForWorkspace() in profile.ts.

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
    <div className="hidden xl:flex items-center gap-4 px-4 py-1.5 rounded-full bg-secondary/60 border border-border">
      {rates.map((r) => (
        <div key={r.pair} className={`flex items-center gap-2 text-xs font-medium ${flash[r.pair] === "up" ? "flash-up" : flash[r.pair] === "down" ? "flash-down" : ""} px-2 py-0.5 rounded`}>
          <span className="text-muted-foreground">{r.pair}</span>
          <span className="font-semibold tabular-nums">{r.rate.toLocaleString()}</span>
          <span className={`flex items-center gap-0.5 ${r.change >= 0 ? "text-success" : "text-destructive"}`}>
            {r.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(r.change).toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

const MODE_TO_WORKSPACE: Record<string, "enterprise_treasury" | "importer_portal" | "freight_workspace" | "supplier_dashboard" | "global_collections" | "canta_admin"> = {
  "Enterprise Treasury": "enterprise_treasury",
  "Importer": "importer_portal",
  "Freight Forwarder": "freight_workspace",
  "Supplier": "supplier_dashboard",
  "Global Merchant": "global_collections",
  "Canta Admin": "canta_admin",
};

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { role, profile } = useRole();
  const { mode } = useMode();
  const userProfile = loadProfile();
  const workspace = MODE_TO_WORKSPACE[mode] ?? userProfile?.workspace_type ?? "enterprise_treasury";
  const flags = userProfile?.feature_flags ?? defaultFlagsFor(workspace);
  const items: SidebarItem[] = getSidebarForWorkspace(workspace, flags);
  const groups: string[] = Array.from(new Set(items.map((n) => n.group)));
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <Link to="/dashboard" onClick={onNavigate} className="px-6 py-5 flex items-center gap-2 border-b border-sidebar-border hover:bg-sidebar-accent/30">
        <div className="h-9 w-9 rounded-xl bg-gradient-accent grid place-items-center text-sidebar-primary-foreground font-bold shadow-glow">C</div>
        <div>
          <div className="font-semibold tracking-tight">Canta</div>
          <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Trade · Treasury · Spend</div>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {groups.map((g) => (
          <div key={g}>
            <div className="px-3 mb-1 text-[10px] uppercase tracking-widest text-sidebar-foreground/40">{g}</div>
            <div className="space-y-0.5">
              {items.filter((n) => n.group === g).map((item) => {
                const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
                const Icon = ICONS[item.iconKey] ?? LayoutDashboard;
                return (
                  <Link
                    key={`${item.to}-${item.label}`}
                    to={item.to as never}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
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
            </div>
          </div>
        ))}
      </nav>


      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="rounded-xl p-3 bg-sidebar-accent/60 border border-sidebar-border">
          <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60 mb-1">Signed in as</div>
          <div className="text-sm font-semibold">{profile.name}</div>
          <div className="text-[11px] text-sidebar-foreground/70">{role} · {profile.title}</div>
        </div>
      </div>
    </div>
  );
}

function ModeSwitcher() {
  const { mode, setMode } = useMode();
  const current = ALL_MODES.find((m) => m.id === mode)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-sm font-medium min-w-0">
          <div className="h-6 w-6 rounded bg-gradient-accent text-sidebar-primary-foreground grid place-items-center text-[10px] font-bold flex-shrink-0">{current.tag}</div>
          <span className="hidden sm:inline truncate max-w-[140px] md:max-w-none">{current.id} Mode</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Switch workspace mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ALL_MODES.map((m) => (
          <DropdownMenuItem key={m.id} onClick={() => { setMode(m.id); toast.success(`${m.id} mode`); }} className="flex items-start gap-3 py-2">
            <div className="h-7 w-7 rounded bg-secondary text-foreground grid place-items-center text-[10px] font-bold flex-shrink-0">{m.tag}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium flex items-center gap-2">
                {m.id}
                {mode === m.id && <Check className="h-3.5 w-3.5 text-accent" />}
              </div>
              <div className="text-[11px] text-muted-foreground">{m.desc}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role, setRole, profile } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex w-64 flex-col sticky top-0 h-screen">
        <SidebarContent pathname={pathname} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="h-16 px-3 sm:px-4 lg:px-8 flex items-center gap-2 sm:gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary -ml-1 flex-shrink-0" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>

            <ModeSwitcher />

            <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md ml-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input className="w-full pl-9 pr-3 py-2 text-sm bg-secondary/60 border border-transparent focus:border-ring focus:outline-none rounded-lg" placeholder="Search shipments, suppliers, trade files…" />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <FxTicker />
              <button className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary flex-shrink-0">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 sm:pl-2 sm:border-l sm:border-border hover:opacity-80">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold flex-shrink-0">{profile.initials}</div>
                    <div className="hidden sm:block leading-tight text-left">
                      <div className="text-xs font-semibold">{profile.name}</div>
                      <div className="text-[10px] text-muted-foreground">{role} · {profile.title}</div>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="flex items-center gap-2"><UserCog className="h-3.5 w-3.5" /> Switch role (demo)</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ALL_ROLES.map((r: Role) => (
                    <DropdownMenuItem key={r} onClick={() => { setRole(r); toast.success(`Viewing as ${r}`); }} className="flex items-center justify-between">
                      <span>{r}</span>
                      {role === r && <Check className="h-4 w-4 text-accent" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast.success("Signed out")}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1600px] w-full mx-auto">
          <RouteGuard pathname={pathname}>{children}</RouteGuard>
        </main>
      </div>
    </div>
  );
}

function RouteGuard({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const { can, role } = useRole();
  const match = nav.find((n) => (n.exact ? pathname === n.to : pathname.startsWith(n.to)));
  if (match && !can(match.perm)) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 grid place-items-center mx-auto mb-4">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Access restricted</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Your role <span className="font-semibold text-foreground">{role}</span> doesn't have permission to view this page.
        </p>
        <Link to="/dashboard" className="inline-block mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Back to Dashboard</Link>
      </div>
    );
  }
  return <>{children}</>;
}
