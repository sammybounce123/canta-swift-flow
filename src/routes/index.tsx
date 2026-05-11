import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Zap, Shield, Globe2, Sparkles, TrendingUp,
  CheckCircle2, Building2, BarChart3, Lock, Quote,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canta — The Treasury Operating System for African Enterprise" },
      { name: "description", content: "Canta is the cross-border payments and FX platform powering Nigeria's largest oil & gas exporters and corporates. Move millions in seconds with bank-grade security and AI-driven insights." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-accent grid place-items-center text-sidebar-primary-foreground font-bold shadow-glow">C</div>
            <div className="font-semibold tracking-tight">Canta</div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#enterprise" className="hover:text-foreground">Enterprise</a>
            <a href="#security" className="hover:text-foreground">Security</a>
            <a href="#customers" className="hover:text-foreground">Customers</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Sign in</Link></Button>
            <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/dashboard">Launch Workspace <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-card opacity-95" />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl -z-10" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-glow/20 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32 text-primary-foreground relative">
          <Badge className="bg-white/10 text-primary-foreground border border-white/20 hover:bg-white/15">
            <Sparkles className="h-3 w-3 mr-1" /> Trusted by Nigeria's largest exporters & corporates
          </Badge>
          <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] max-w-4xl">
            The treasury operating system for <span className="text-accent">global enterprise.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/75">
            Settle nine-figure flows across borders in seconds. Lock institutional FX rates with full
            transparency. Run every entity, currency and counterparty from a single, audit-ready workspace —
            engineered for the CFOs and treasurers building Africa's next era.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6 font-semibold">
              <Link to="/dashboard">Enter the Workspace <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
              <a href="#platform">Explore the platform</a>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
            {[
              { v: "$2.4B+", l: "Settled annually" },
              { v: "<30s", l: "Cross-border settlement" },
              { v: "0.08%", l: "Institutional FX spread" },
              { v: "99.99%", l: "Platform uptime SLA" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl md:text-3xl font-semibold tabular-nums">{s.v}</div>
                <div className="text-xs text-primary-foreground/60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo strip */}
      <section className="border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mr-4">Powering treasuries at</div>
          {["Atlas Petroleum", "Niger Delta LNG", "Sahara Energy", "Meridian Capital", "Coastal Resources", "Lagos Holdings"].map((n) => (
            <div key={n} className="text-sm font-semibold text-muted-foreground/80 tracking-tight">{n}</div>
          ))}
        </div>
      </section>

      {/* Platform features */}
      <section id="platform" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-accent-foreground/80 font-semibold">The Platform</div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mt-3">
            One workspace. Every currency. Total control.
          </h2>
          <p className="text-muted-foreground mt-4">
            Replace the patchwork of bank portals, spreadsheets and brokers with a single platform purpose-built
            for the velocity, scale and scrutiny of enterprise treasury.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {[
            { i: Globe2, t: "Multi-currency wallets", d: "Hold and reconcile NGN, USD, EUR, GBP and 20+ currencies. Local collection accounts in 30+ corridors." },
            { i: TrendingUp, t: "Institutional FX engine", d: "Smart-routed liquidity from tier-1 providers, locked rates, and full pre-trade transparency on every basis point." },
            { i: Zap, t: "Sub-30 second settlement", d: "Move payroll, vendor payouts and intercompany transfers across borders before the kettle boils." },
            { i: Sparkles, t: "AI treasury intelligence", d: "Forecast FX exposure, model hedging strategies and surface anomalies before they hit your P&L." },
            { i: Shield, t: "Bank-grade security", d: "SOC 2 Type II, ISO 27001, granular RBAC, hardware-key MFA and immutable audit trails on every action." },
            { i: BarChart3, t: "Real-time visibility", d: "Live cash position, exposure and counterparty health across every entity, currency and corridor." },
          ].map((f) => (
            <div key={f.t} className="p-6 rounded-2xl border border-border bg-card hover:shadow-elevated transition">
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                <f.i className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 font-semibold">{f.t}</div>
              <div className="text-sm text-muted-foreground mt-1.5">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise / Oil & Gas */}
      <section id="enterprise" className="bg-secondary/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-accent-foreground/80 font-semibold">Built for Oil, Gas & Industry</div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3">
              Engineered for the realities of African export treasury.
            </h2>
            <p className="text-muted-foreground mt-4">
              From repatriating dollar export proceeds to settling upstream contractors across twelve jurisdictions —
              Canta is shaped around the corridors, currencies and compliance that define operating at scale in Nigeria.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "USD-first dashboards with live export proceeds tracking",
                "Automated CBN documentation, Form A/M and audit packs",
                "Multi-entity company switcher for group treasury operations",
                "Named relationship managers and 24/7 enterprise support",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/dashboard">Open the demo workspace <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-gradient-card text-primary-foreground p-6 shadow-elevated">
              <div className="text-xs uppercase tracking-widest text-primary-foreground/60">Group total balance</div>
              <div className="text-4xl font-semibold tabular-nums mt-2">₦2,847,120,000</div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                {[["🇺🇸 USD", "$4.82M"], ["🇪🇺 EUR", "€612K"], ["🇬🇧 GBP", "£318K"], ["🇳🇬 NGN", "₦1.28B"]].map(([a, b]) => (
                  <div key={a} className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-primary-foreground/60">{a}</div>
                    <div className="text-sm font-semibold tabular-nums mt-1">{b}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-3 rounded-lg bg-accent/15 border border-accent/30 text-xs flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> Canta AI: Convert $2.4M today — modelled +1.2% gain vs. T+2.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customers / Quote */}
      <section id="customers" className="max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-3xl border border-border p-10 md:p-14 bg-card">
          <Quote className="h-8 w-8 text-accent" />
          <p className="mt-5 text-2xl md:text-3xl font-medium tracking-tight leading-snug max-w-4xl">
            "Canta collapsed a five-day settlement cycle into thirty seconds. For a treasury moving
            nine figures a quarter, that isn't a feature — it's a competitive advantage."
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            Group Treasurer · Tier-1 Nigerian Energy Exporter
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-widest text-accent-foreground/80 font-semibold">Trust & Security</div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3">
            Built to the standard your auditors expect.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { i: Lock, t: "SOC 2 Type II & ISO 27001", d: "Independently audited security, availability and confidentiality controls — refreshed annually." },
            { i: Shield, t: "Segregated client funds", d: "Funds held with tier-1 partner banks, fully reconciled, NDIC-aligned and never commingled." },
            { i: Building2, t: "Regulated & licensed", d: "Operating under CBN guidance with full KYB, AML and sanctions screening on every counterparty." },
          ].map((f) => (
            <div key={f.t} className="p-6 rounded-2xl border border-border">
              <f.i className="h-6 w-6 text-accent" />
              <div className="font-semibold mt-3">{f.t}</div>
              <div className="text-sm text-muted-foreground mt-1.5">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-card text-primary-foreground p-10 md:p-16 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Give your treasury an unfair advantage.
            </h2>
            <p className="text-primary-foreground/75 mt-4">
              Book a tailored walkthrough with our enterprise team — or step straight into a fully-loaded
              demo workspace and feel the platform for yourself.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6 font-semibold">
                <Link to="/dashboard">Launch Demo Workspace <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
              </Button>
              <Button size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
                Talk to Enterprise Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Canta Financial Technologies. All rights reserved.</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Compliance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
