import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Receipt, Wallet, ArrowRight, Clock, Lock,
  Search, Bell, Sparkles, TrendingUp, ChevronRight, Menu, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  SUPPLIER_TABS, REQUESTS, COMPLIANCE_DISCLAIMER,
  KPI, useVerified, verifiedStore, useFxQuotes,
} from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal")({
  head: () => ({ meta: [{ title: "Supplier Portal — Canta" }] }),
  component: SupplierPortalLayout,
});

function SupplierPortalLayout() {
  const verified = useVerified();
  const fxQuotes = useFxQuotes();
  const [invite, setInvite] = useState<null | "buyer" | "request">(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPaymentRequests =
    pathname === "/supplier-portal/payment-requests" ||
    pathname.startsWith("/supplier-portal/payment-requests/");

  const totals = {
    pending: REQUESTS.filter((r) => r.status === "Awaiting Buyer Payment").length,
    ngnHeld: REQUESTS.filter((r) => ["NGN Received", "Compliance Review", "FX Processing"].includes(r.status))
      .reduce((s, r) => s + r.amountNgn, 0),
    buyers: new Set(REQUESTS.map((r) => r.buyer)).size,
  };
  const activeQuoteCount = fxQuotes.filter(
    (q) => q.status === "Quote Generated" || q.status === "Rate Locked" || q.status === "Sent to Buyer",
  ).length;

  const activeTab = SUPPLIER_TABS.find((t) =>
    t.to === "/supplier-portal"
      ? pathname === "/supplier-portal" || pathname === "/supplier-portal/"
      : pathname === t.to || pathname.startsWith(t.to + "/"),
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_-10%_-10%,color-mix(in_oklab,var(--color-accent)_18%,transparent),transparent_60%),radial-gradient(1000px_500px_at_110%_10%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_55%)]">
      <div className="mx-auto flex w-full max-w-[1500px] gap-6 px-4 py-6 lg:px-6">
        {/* Sidebar */}
        <aside
          className={`${mobileOpen ? "fixed inset-0 z-50 flex" : "hidden"} lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:w-72 lg:flex-none`}
        >
          {mobileOpen && (
            <button
              aria-label="Close menu"
              className="absolute inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}
          <div className="relative z-10 flex h-full w-72 flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-card text-sidebar-foreground shadow-elevated">
            <div className="flex items-center justify-between px-5 pb-4 pt-5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground shadow-glow">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">Canta</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60">Supplier</div>
                </div>
              </div>
              <button
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 pb-3">
              <div className="px-2 pb-2 pt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
                Workspace
              </div>
              {SUPPLIER_TABS.map((item) => {
                const active =
                  item.to === "/supplier-portal"
                    ? pathname === "/supplier-portal" || pathname === "/supplier-portal/"
                    : pathname === item.to || pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                      active
                        ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-accent)_45%,transparent)]"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                        active
                          ? "bg-accent text-accent-foreground"
                          : "bg-white/5 text-white/70 group-hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate font-medium">{item.label}</span>
                      <span className="truncate text-[10px] text-white/45">{item.zh}</span>
                    </span>
                    {active && <ChevronRight className="h-4 w-4 text-accent" />}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/10 p-3">
              <div className="rounded-2xl bg-white/[0.04] p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-accent text-primary shadow-glow">
                    <span className="text-xs font-semibold">李</span>
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="truncate text-sm font-semibold text-white">Li Wei</div>
                    <div className="truncate text-[11px] text-white/50">Guangzhou Tech Factory</div>
                  </div>
                </div>
                <Link
                  to="/welcome"
                  className="mt-3 flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px] text-white/60 hover:bg-white/5 hover:text-white"
                >
                  Switch workspace <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Topbar */}
          <div className="flex items-center gap-3 rounded-2xl border bg-card/70 px-3 py-2.5 backdrop-blur-md shadow-card">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border bg-background lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border bg-background/70 px-3 py-1.5">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                placeholder="Search buyers, invoices, requests…"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
              <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-block">
                ⌘K
              </kbd>
            </div>
            <button className="relative grid h-9 w-9 place-items-center rounded-lg border bg-background hover:bg-secondary">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </button>
            <Button
              size="sm"
              className="hidden md:inline-flex"
              asChild
            >
              <Link to="/supplier-portal/payment-requests" search={{ new: true }}>
                <Receipt className="mr-2 h-4 w-4" /> New request
              </Link>
            </Button>
          </div>

          {/* Breadcrumb / section pill */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link to="/supplier-portal" className="hover:text-foreground">Supplier Portal</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">{activeTab?.label ?? "Overview"}</span>
            <span className="text-muted-foreground/70">· {activeTab?.zh ?? "首页"}</span>
          </div>

          {!isPaymentRequests && (
            <>
              {/* Hero */}
              <section className="relative overflow-hidden rounded-3xl border bg-gradient-card p-6 text-white shadow-elevated md:p-8">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
                <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-primary-glow/40 blur-3xl" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl">
                    <Badge className="border-white/20 bg-white/10 text-white backdrop-blur">
                      <Sparkles className="mr-1 h-3 w-3 text-accent" /> Demo preview · 演示环境
                    </Badge>
                    <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                      欢迎, Li Wei <span className="text-gradient-accent">👋</span>
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">
                      Your Nigerian buyer pays in <b className="text-white">NGN</b> to Canta's regulated collection account.
                      Canta reviews compliance, converts at the locked FX rate, and settles you in{" "}
                      <b className="text-white">RMB</b> directly into your wallet.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge className="border-white/15 bg-white/10 text-white">Supplier Admin</Badge>
                      <Badge className="border-white/15 bg-white/10 text-white">Guangzhou · 广州</Badge>
                      <Badge className="border-emerald-300/30 bg-emerald-400/15 text-emerald-100">
                        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                        FX rails live
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:items-end">
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/60">RMB Wallet</div>
                      <div className="mt-1 text-3xl font-semibold tabular-nums">¥128,400</div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-200">
                        <TrendingUp className="h-3 w-3" /> +¥12,300 this week
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/10 text-white hover:bg-white/20"
                        onClick={() => setInvite("buyer")}
                      >
                        <Users className="mr-2 h-4 w-4" /> Add buyer
                      </Button>
                      <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                        <Link to="/supplier-portal/payment-requests" search={{ new: true }}>
                          <Receipt className="mr-2 h-4 w-4" /> New request
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              {!verified && (
                <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/60 bg-amber-50/80 p-4 text-amber-900 shadow-card backdrop-blur md:flex-row md:items-center">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      Verify your business to unlock RMB payouts · 完成认证以解锁人民币结算
                    </div>
                    <div className="mt-0.5 text-xs">
                      You can view requests and upload documents now. RMB wallet payouts unlock after verification.
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-400 bg-white/60"
                    onClick={() => {
                      verifiedStore.set(true);
                      toast.success("Verification simulated — RMB payouts enabled");
                    }}
                  >
                    Verify now
                  </Button>
                </div>
              )}

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KPI label="Wallet balance · 钱包" value="¥128,400" icon={Wallet} tone="accent" hint="RMB available" />
                <KPI
                  label="Awaiting settlement"
                  value={`¥${(totals.ngnHeld / 204).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  icon={Clock}
                  tone="warning"
                  hint="In compliance / FX"
                />
                <KPI
                  label="Active requests"
                  value={String(totals.pending + activeQuoteCount)}
                  icon={Receipt}
                  tone="default"
                  hint={`${activeQuoteCount} live FX quotes`}
                />
                <KPI
                  label="Nigerian buyers"
                  value={String(totals.buyers)}
                  icon={Users}
                  tone="success"
                  hint="Verified counterparties"
                />
              </div>

              <div className="rounded-xl border-l-4 border-primary/40 bg-card/60 p-3 text-[11px] italic text-muted-foreground backdrop-blur">
                {COMPLIANCE_DISCLAIMER}
              </div>
            </>
          )}

          {/* Route content */}
          <section className="space-y-4">
            <Outlet />
          </section>
        </main>
      </div>

      {/* Dialogs */}
      <Dialog open={!!invite} onOpenChange={(o) => !o && setInvite(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{invite === "buyer" ? "Add Nigerian buyer" : "New payment request"}</DialogTitle>
            <DialogDescription>
              {invite === "buyer"
                ? "Invite a Nigerian buyer to pay you through Canta. Buyer pays in NGN; you receive RMB settlement."
                : "Send a payment request to a Nigerian buyer. Buyer receives a Canta NGN payment link; you receive RMB after payment, FX processing, and compliance approval."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {invite === "buyer" ? (
              <>
                <div><Label className="text-xs">Buyer company</Label><Input placeholder="e.g. Zenith Imports Nigeria" /></div>
                <div><Label className="text-xs">Buyer contact name</Label><Input placeholder="e.g. Tunde Bakare" /></div>
                <div><Label className="text-xs">Buyer WhatsApp or email</Label><Input placeholder="+234 802 111 2233 or tunde@zenithimports.ng" /></div>
                <div><Label className="text-xs">Goods / order description</Label><Input placeholder="Bluetooth speakers x 500" /></div>
                <div><Label className="text-xs">Expected invoice amount (RMB)</Label><Input type="number" placeholder="50000" /></div>
                <div><Label className="text-xs">Notes to buyer</Label><Textarea placeholder="50% deposit, balance on BL" /></div>
                <div className="text-[11px] text-muted-foreground italic">Canta will create a payment reference automatically after you send the invite.</div>
              </>
            ) : (
              <>
                <div><Label className="text-xs">Nigerian buyer</Label><Input placeholder="Zenith Imports Nigeria" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Invoice number</Label><Input placeholder="INV-2026-091" /></div>
                  <div><Label className="text-xs">Amount to receive (RMB)</Label><Input type="number" placeholder="50000" /></div>
                </div>
                <div><Label className="text-xs">Goods / order description</Label><Input placeholder="Bluetooth speakers x 500" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Expiry date</Label><Input type="date" /></div>
                  <div><Label className="text-xs">Settlement currency</Label><Input placeholder="RMB (default)" defaultValue="RMB" /></div>
                </div>
                <div><Label className="text-xs">Notes for buyer</Label><Textarea placeholder="50% deposit, balance on BL" /></div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInvite(null)}>Cancel</Button>
            <Button
              onClick={() => {
                setInvite(null);
                toast.success(invite === "buyer" ? "Buyer invitation sent" : "Payment request sent");
              }}
            >
              {invite === "buyer" ? "Send invitation" : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
