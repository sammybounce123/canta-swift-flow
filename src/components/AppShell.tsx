import { Link, useRouterState, useNavigate, useHydrated } from "@tanstack/react-router";
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
  Menu,
  FileText,
  Ship,
  Truck,
  Factory,
  Globe,
  Brain,
  ShieldCheck,
  Plug,
  MessageCircle,
  CheckSquare,
  Crown,
  Calculator,
  Link as LinkIcon,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRole, ALL_ROLES, type Role } from "@/components/RoleProvider";
import {
  loadProfile,
  getSidebarForWorkspace,
  defaultFlagsFor,
  type SidebarItem,
} from "@/lib/profile";
import { useMode, ALL_MODES, MODE_DISPLAY_LABEL, type Mode } from "@/components/ModeProvider";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { PARTNER_ROLES, PARTNER_ORG, MARKETERS, setActivePartnerUser } from "@/lib/partner";
import {
  resolveActiveWorkspace,
  saveActiveWorkspace,
  workspaceFromPath,
} from "@/lib/workspace-guard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

const ICONS: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  wallet: Wallet,
  fx: ArrowLeftRight,
  receipt: Receipt,
  users: Users,
  building: Building2,
  settings: Settings,
  team: Shield,
  trade: FileText,
  ship: Ship,
  freight: Truck,
  factory: Factory,
  globe: Globe,
  brain: Brain,
  "shield-check": ShieldCheck,
  plug: Plug,
  whatsapp: MessageCircle,
  check: CheckSquare,
  crown: Crown,
  calculator: Calculator,
  file: FileText,
  link: LinkIcon,
  chart: BarChart3,
  importer: Building2,
  shield: ShieldCheck,
  sparkles: Sparkles,
};
// Sidebar is now derived per-workspace from getSidebarForWorkspace() in profile.ts.

const initialRates = [
  { pair: "USD/NGN", rate: 1612.45, change: 0.32 },
  { pair: "EUR/NGN", rate: 1745.1, change: -0.18 },
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
          return {
            ...r,
            rate: newRate,
            change: +((delta / r.rate) * 100 + r.change * 0.6).toFixed(2),
          };
        }),
      );
      setTimeout(() => setFlash({}), 800);
    }, 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hidden md:flex min-w-0 max-w-[46vw] items-center gap-2 overflow-hidden rounded-full border border-border bg-secondary/60 px-2 py-1.5 lg:max-w-none lg:gap-4 lg:px-4">
      {rates.map((r, i) => (
        <div
          key={r.pair}
          className={`flex shrink-0 items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium lg:gap-2 lg:px-2 lg:text-xs ${
            i > 0 ? "hidden lg:flex" : ""
          } ${i > 1 ? "xl:flex" : ""} ${flash[r.pair] === "up" ? "flash-up" : flash[r.pair] === "down" ? "flash-down" : ""}`}
        >
          <span className="text-muted-foreground">{r.pair}</span>
          <span className="font-semibold tabular-nums">{r.rate.toLocaleString("en-US")}</span>
          <span
            className={`flex items-center gap-0.5 ${r.change >= 0 ? "text-success" : "text-destructive"}`}
          >
            {r.change >= 0 ? (
              <TrendingUp className="h-3 w-3 shrink-0" />
            ) : (
              <TrendingDown className="h-3 w-3 shrink-0" />
            )}
            {Math.abs(r.change).toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

const WORKSPACE_TO_MODE: Record<import("@/lib/profile").WorkspaceType, Mode> = {
  enterprise_treasury: "Enterprise Treasury",
  importer_portal: "Importer",
  supplier_dashboard: "Supplier",
  global_collections: "Global Merchant",
  global_spend_cards: "Enterprise Treasury",
  partner_property: "Partner Property",
  // canta_ops is internal-only and never surfaced as a customer mode; if a
  // legacy profile points here, fall back to Enterprise Treasury.
  canta_ops: "Enterprise Treasury",
};

// Per-workspace demo identity. Drives topbar avatar/name/role and sidebar footer.
type WorkspaceProfile = { name: string; initials: string; title: string; badge: string };
const WORKSPACE_PROFILES: Record<import("@/lib/profile").WorkspaceType, WorkspaceProfile> = {
  enterprise_treasury: {
    name: "Adaeze Okonkwo",
    initials: "AO",
    title: "Treasury Admin",
    badge: "Enterprise Treasury Mode",
  },
  importer_portal: {
    name: "Tunde Bakare",
    initials: "TB",
    title: "Importer Owner",
    badge: "Importer Mode",
  },
  global_collections: {
    name: "Amaka Bello",
    initials: "AB",
    title: "Merchant Owner",
    badge: "Global Collections Mode",
  },
  supplier_dashboard: {
    name: "Li Wei",
    initials: "LW",
    title: "Supplier Admin",
    badge: "Supplier Mode",
  },
  partner_property: {
    name: "Charlotte Baron",
    initials: "CB",
    title: "Partner Admin",
    badge: "Partner Mode",
  },
  global_spend_cards: {
    name: "Adaeze Okonkwo",
    initials: "AO",
    title: "Treasury Admin",
    badge: "Enterprise Treasury Mode",
  },
  canta_ops: {
    name: "Ezekiel Oni",
    initials: "EO",
    title: "Canta Operations Admin",
    badge: "Canta Ops Mode",
  },
};

function SidebarContent({
  pathname,
  search,
  onNavigate,
}: {
  pathname: string;
  search?: Record<string, unknown>;
  onNavigate?: () => void;
}) {
  const { role } = useRole();
  const { mode, setMode } = useMode();
  const userProfile = loadProfile();
  const pathWorkspace = workspaceFromPath(pathname);
  const hydrated = useHydrated();
  // Stored workspace lives in localStorage, which the server cannot read. Only
  // consult it after hydration so SSR and the first client render agree.
  const resolvedWorkspace =
    pathWorkspace ?? (hydrated ? resolveActiveWorkspace(pathname, mode) : null);
  // On shared routes the workspace is unknown until hydration. Render a neutral
  // shell instead of guessing, so Treasury/Partner users never see an Importer
  // sidebar or persona flash before hydration.
  const pendingWorkspace = resolvedWorkspace === null;
  const workspace = resolvedWorkspace ?? "importer_portal";

  // Persist the active workspace whenever the user lands on any workspace-scoped
  // route (direct URL visit, refresh, or link click). Without this, shared
  // routes like /reports, /support and /whatsapp silently fall back to
  // Enterprise Treasury when the user never clicked a sidebar link.
  useEffect(() => {
    if (pathWorkspace && pathWorkspace !== "canta_ops") {
      saveActiveWorkspace(pathWorkspace);
      const nextMode = WORKSPACE_TO_MODE[pathWorkspace];
      if (nextMode && nextMode !== mode) setMode(nextMode);
    }
  }, [pathWorkspace, mode, setMode]);
  const flags = userProfile?.feature_flags ?? defaultFlagsFor(workspace);
  const items: SidebarItem[] = getSidebarForWorkspace(workspace, flags);
  const groups: string[] = Array.from(new Set(items.map((n) => n.group)));
  const partner = usePartnerRole();
  const isPartner = workspace === "partner_property";
  const partnerRoleLabel = PARTNER_ROLES.find((r) => r.id === partner.role)?.label ?? partner.role;
  const wsProfile = WORKSPACE_PROFILES[workspace];
  const displayName = wsProfile.name;
  const displayTitle = wsProfile.title;

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <Link
        to="/dashboard"
        onClick={onNavigate}
        className="px-6 py-5 flex items-center gap-2 border-b border-sidebar-border hover:bg-sidebar-accent/30"
      >
        <div className="h-9 w-9 rounded-xl bg-gradient-accent grid place-items-center text-sidebar-primary-foreground font-bold shadow-glow">
          C
        </div>
        <div>
          <div className="font-semibold tracking-tight">Canta</div>
          <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
            Trade · Treasury
          </div>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-3 space-y-3 overflow-y-auto scrollbar-thin">
        {pendingWorkspace && (
          <div className="space-y-2 px-3 py-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-sidebar-accent/40 animate-pulse" />
            ))}
          </div>
        )}
        {!pendingWorkspace &&
          groups.map((g) => (

          <div key={g}>
            <div className="px-3 mb-1 text-[10px] uppercase tracking-widest text-sidebar-foreground/40">
              {g}
            </div>
            <div className="space-y-0.5">
              {items
                .filter((n) => n.group === g)
                .map((item) => {
                  const searchMatches = (it: SidebarItem) =>
                    it.search
                      ? Object.entries(it.search).every(
                          ([key, value]) =>
                            (search?.[key] ??
                              (key === "tab" && pathname === "/supplier-portal"
                                ? "overview"
                                : undefined)) === value,
                        )
                      : true;
                  const pathMatches = (it: SidebarItem) =>
                    it.exact
                      ? pathname === it.to
                      : pathname === it.to || pathname.startsWith(it.to + "/");
                  // Mode-aware active: only the most specific matching item in
                  // the current sidebar highlights. Ties broken by whether the
                  // item declares a `search` (more specific) and by label to
                  // stay deterministic across renders.
                  const bestMatch = items
                    .filter((it) => pathMatches(it) && searchMatches(it))
                    .sort((a, b) => {
                      if (b.to.length !== a.to.length) return b.to.length - a.to.length;
                      const aHas = a.search ? 1 : 0;
                      const bHas = b.search ? 1 : 0;
                      if (bHas !== aHas) return bHas - aHas;
                      return a.label.localeCompare(b.label);
                    })[0];
                  const active = bestMatch === item;
                  const Icon = ICONS[item.iconKey] ?? LayoutDashboard;
                  return (
                    <Link
                      key={`${item.to}-${item.label}`}
                      to={item.to as never}
                      search={item.search as never}
                      onClick={() => {
                        saveActiveWorkspace(workspace);
                        setMode(WORKSPACE_TO_MODE[workspace]);
                        onNavigate?.();
                      }}
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
          <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60 mb-1">
            Signed in as
          </div>
          {pendingWorkspace ? (
            <>
              <div className="h-4 w-28 rounded bg-sidebar-accent/50 animate-pulse" />
              <div className="mt-1.5 h-3 w-20 rounded bg-sidebar-accent/40 animate-pulse" />
            </>
          ) : isPartner && partner.user ? (
            <>
              <div className="text-sm font-semibold">{partner.user.name}</div>
              <div className="text-[11px] text-sidebar-foreground/70">
                {partnerRoleLabel} · {PARTNER_ORG.name}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold">{displayName}</div>
              <div className="text-[11px] text-sidebar-foreground/70">{displayTitle}</div>
              <div className="text-[10px] text-sidebar-foreground/50 mt-1">{wsProfile.badge}</div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function ModeSwitcher({ displayMode }: { displayMode: Mode }) {
  const { setMode } = useMode();
  const navigate = useNavigate();
  const current = ALL_MODES.find((m) => m.id === displayMode) ?? ALL_MODES[0];
  const MODE_HOME: Record<Mode, string> = {
    "Enterprise Treasury": "/treasury",
    Importer: "/importer",
    Supplier: "/supplier-portal",
    "Global Merchant": "/collections",
    "Partner Property": "/partner",
    "Canta Ops": "/whatsapp",
  };
  // Scope which modes appear in the switcher based on current workspace.
  // Importer / Supplier / Partner users must not see Enterprise Treasury.
  const scopedModes = (() => {
    if (displayMode === "Importer") return ALL_MODES.filter((m) => m.id !== "Enterprise Treasury");
    if (displayMode === "Supplier") return ALL_MODES.filter((m) => m.id === "Supplier");
    if (displayMode === "Partner Property")
      return ALL_MODES.filter((m) => m.id === "Partner Property");
    return ALL_MODES;
  })();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-sm font-medium min-w-0">
          <div className="h-6 w-6 rounded bg-gradient-accent text-sidebar-primary-foreground grid place-items-center text-[10px] font-bold flex-shrink-0">
            {current.tag}
          </div>
          <span className="hidden sm:inline truncate max-w-[160px] md:max-w-none">
            {MODE_DISPLAY_LABEL[current.id]} Mode
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Switch workspace mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {scopedModes.map((m) => (
          <DropdownMenuItem
            key={m.id}
            onClick={() => {
              setMode(m.id);
              const home = MODE_HOME[m.id];
              navigate({ to: home as never });
              toast.success(`${MODE_DISPLAY_LABEL[m.id]} mode`);
            }}
            className="flex items-start gap-3 py-2"
          >
            <div className="h-7 w-7 rounded bg-secondary text-foreground grid place-items-center text-[10px] font-bold flex-shrink-0">
              {m.tag}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium flex items-center gap-2">
                {MODE_DISPLAY_LABEL[m.id]}
                {displayMode === m.id && <Check className="h-3.5 w-3.5 text-accent" />}
              </div>
              <div className="text-[11px] text-muted-foreground">{m.desc}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const WORKSPACE_DASHBOARD_PATHS: Record<string, string> = {
  enterprise_treasury: "/treasury",
  importer_portal: "/importer",
  supplier_dashboard: "/supplier-portal",
  partner_property: "/partner",
  global_collections: "/collections",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as Record<string, unknown> });
  const navigate = useNavigate();
  const { role, setRole } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, setMode } = useMode();
  const partner = usePartnerRole();

  // Derive the active workspace from path first, then fall back to saved mode.
  const pathWorkspace = workspaceFromPath(pathname);
  const hydrated = useHydrated();
  const resolvedWorkspace =
    pathWorkspace ?? (hydrated ? resolveActiveWorkspace(pathname, mode) : null);
  const pendingWorkspace = resolvedWorkspace === null;
  const activeWorkspace = resolvedWorkspace ?? "importer_portal";
  const displayMode: Mode = WORKSPACE_TO_MODE[activeWorkspace];


  // Persist the inferred mode so other surfaces (dashboard hero, etc.) follow.
  useEffect(() => {
    if (pathWorkspace && pathWorkspace !== "canta_ops") saveActiveWorkspace(pathWorkspace);
    if (
      pathWorkspace &&
      pathWorkspace !== "canta_ops" &&
      WORKSPACE_TO_MODE[pathWorkspace] !== mode
    ) {
      setMode(WORKSPACE_TO_MODE[pathWorkspace]);
    }
  }, [pathWorkspace, mode, setMode]);

  // KYB route guard: block workspace dashboard until KYB is complete for that workspace.
  useEffect(() => {
    const dashPath = WORKSPACE_DASHBOARD_PATHS[activeWorkspace];
    if (!dashPath) return;
    if (pathname !== dashPath) return;
    const done =
      typeof window !== "undefined" &&
      window.localStorage.getItem("canta:kyb:" + activeWorkspace) === "done";
    if (!done) {
      navigate({
        to: "/kyb-onboarding",
        search: { workspace: activeWorkspace } as never,
        replace: true,
      });
    }
  }, [pathname, activeWorkspace, navigate]);

  const isPartner = activeWorkspace === "partner_property";
  const partnerRoleLabel = PARTNER_ROLES.find((r) => r.id === partner.role)?.label ?? partner.role;
  const partnerInitials = partner.user
    ? partner.user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "BC";
  const wsProfile = WORKSPACE_PROFILES[activeWorkspace];
  const tbName = wsProfile.name;
  const tbInitials = wsProfile.initials;
  const tbTitle = wsProfile.title;

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <aside className="hidden md:flex w-60 lg:w-64 flex-col h-screen shrink-0 border-r border-sidebar-border">
        <SidebarContent pathname={pathname} search={search} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent
            pathname={pathname}
            search={search}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="h-16 px-3 sm:px-4 lg:px-8 flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary -ml-1 flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {pendingWorkspace ? (
              <div className="h-8 w-40 rounded-lg bg-secondary animate-pulse" />
            ) : (
              <ModeSwitcher displayMode={displayMode} />
            )}


            {!isPartner && (
              <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md ml-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    className="w-full pl-9 pr-3 py-2 text-sm bg-secondary/60 border border-transparent focus:border-ring focus:outline-none rounded-lg"
                    placeholder={
                      activeWorkspace === "supplier_dashboard"
                        ? "Search buyers, payment requests, invoices…"
                        : "Search shipments, suppliers, trade files…"
                    }
                  />
                </div>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <FxTicker />
              <button className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary flex-shrink-0">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 sm:pl-2 sm:border-l sm:border-border hover:opacity-80">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold flex-shrink-0">
                      {pendingWorkspace ? "" : isPartner ? partnerInitials : tbInitials}
                    </div>
                    <div className="hidden sm:block leading-tight text-left">
                      {pendingWorkspace ? (
                        <>
                          <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
                          <div className="mt-1 h-2.5 w-16 rounded bg-secondary animate-pulse" />
                        </>
                      ) : isPartner && partner.user ? (
                        <>
                          <div className="text-xs font-semibold">{partner.user.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {partnerRoleLabel} · {PARTNER_ORG.name}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs font-semibold">{tbName}</div>
                          <div className="text-[10px] text-muted-foreground">{tbTitle}</div>
                        </>
                      )}
                    </div>


                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {isPartner ? (
                    <>
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <UserCog className="h-3.5 w-3.5" /> Switch partner user (demo)
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {MARKETERS.map((m) => (
                        <DropdownMenuItem
                          key={m.id}
                          onClick={() => {
                            setActivePartnerUser(m.id);
                            toast.success(`Signed in as ${m.name}`);
                          }}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="text-sm">{m.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {PARTNER_ROLES.find((r) => r.id === m.role)?.label}
                            </div>
                          </div>
                          {partner.userId === m.id && <Check className="h-4 w-4 text-accent" />}
                        </DropdownMenuItem>
                      ))}
                    </>
                  ) : (
                    <>
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <UserCog className="h-3.5 w-3.5" /> Switch role (demo)
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {activeWorkspace === "supplier_dashboard" ? (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          {wsProfile.name} · {wsProfile.title}
                        </div>
                      ) : (
                        ALL_ROLES.map((r: Role) => (
                          <DropdownMenuItem
                            key={r}
                            onClick={() => {
                              setRole(r);
                              toast.success(`Viewing as ${r}`);
                            }}
                            className="flex items-center justify-between"
                          >
                            <span>{r}</span>
                            {role === r && <Check className="h-4 w-4 text-accent" />}
                          </DropdownMenuItem>
                        ))
                      )}
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast.success("Signed out")}>
                    Sign out
                  </DropdownMenuItem>
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

function RouteGuard({
  pathname: _pathname,
  children,
}: {
  pathname: string;
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
