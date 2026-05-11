import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Zap, Shield, Globe2, Sparkles, TrendingUp,
  CheckCircle2, Building2, BarChart3, Lock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canta — Cross-Border Payments & FX for Enterprises" },
      { name: "description", content: "Enterprise-grade FX and cross-border payments for oil & gas and large corporates in Nigeria. Instant settlement, AI insights, bank-grade security." },
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
            <a href="#product" className="hover:text-foreground">Product</a>
            <a href="#why" className="hover:text-foreground">Why Canta</a>
            <a href="#security" className="hover:text-foreground">Security</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Sign in</Link></Button>
            <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/dashboard">Launch App <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
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
            <Sparkles className="h-3 w-3 mr-1" /> Built for Oil & Gas and Large Corporates
          </Badge>
          <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] max-w-4xl">
            Cross-border payments &<br />FX, <span className="text-accent">re-engineered.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/75">
            Move millions across borders in seconds. Lock the best rates with AI-powered insights.
            Built for the treasury teams powering Nigeria's largest exporters.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6 font-semibold">
              <Link to="/dashboard">Open the Platform <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
              <a href="#product">See how it works</a>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
            {[
              { v: "$2.4B+", l: "Settled annually" },
              { v: "<30s", l: "Average settlement" },
              { v: "0.08%", l: "Best-in-class spread" },
              { v: "99.99%", l: "Uptime SLA" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl md:text-3xl font-semibold tabular-nums">{s.v}</div>
                <div className="text-xs text-primary-foreground/60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product features */}
      <section id="product" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-accent-foreground/80 font-semibold">The Platform</div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mt-3">
            Everything your treasury team needs.
          </h2>
          <p className="text-muted-foreground mt-4">
            One operating system for multi-currency wallets, FX, payments, compliance, and cash visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {[
            { i: Globe2, t: "Multi-currency wallets", d: "Hold NGN, USD, EUR, GBP and more. Local accounts in 30+ corridors." },
            { i: TrendingUp, t: "Best-rate FX engine", d: "Smart routing across liquidity providers with locked rates and full transparency." },
            { i: Zap, t: "Instant settlement", d: "Cross-border payments that arrive in under 30 seconds, not 3 days." },
            { i: Sparkles, t: "AI treasury insights", d: "Forecast FX moves, optimize hedging, and act on signals — all in one place." },
            { i: Shield, t: "Bank-grade security", d: "SOC 2, ISO 27001, granular roles, MFA, and full audit trails." },
            { i: BarChart3, t: "Real-time visibility", d: "Live cash flow, exposure, and P&L across every entity and currency." },
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

      {/* Why Canta */}
      <section id="why" className="bg-secondary/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-accent-foreground/80 font-semibold">Built for Oil & Gas</div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3">
              Designed for the realities of Nigerian export treasury.
            </h2>
            <p className="text-muted-foreground mt-4">
              From repatriating USD export proceeds to paying upstream vendors in 12 countries —
              Canta handles the corridors, compliance, and currencies that matter to Nigeria's largest corporates.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "USD-heavy dashboards with export proceeds tracking",
                "Automated CBN documentation & compliance",
                "Multi-entity company switcher for group treasuries",
                "Dedicated relationship managers and 24/7 support",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/dashboard">Try the Demo Workspace <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-gradient-card text-primary-foreground p-6 shadow-elevated">
              <div className="text-xs uppercase tracking-widest text-primary-foreground/60">Total balance</div>
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
                <Sparkles className="h-3.5 w-3.5 text-accent" /> AI: Convert $2.4M today — predicted +1.2% gain
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { i: Lock, t: "SOC 2 & ISO 27001", d: "Independently audited security controls and processes." },
            { i: Shield, t: "Bank-grade infrastructure", d: "Segregated client funds, NDIC-ready architecture, MFA everywhere." },
            { i: Building2, t: "Regulated & licensed", d: "Operating under CBN guidance with full KYB and AML programs." },
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
      <section id="pricing" className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-card text-primary-foreground p-10 md:p-16 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Ready to upgrade your treasury?
            </h2>
            <p className="text-primary-foreground/75 mt-4">
              Get a tailored walkthrough with our enterprise team — or jump straight into the demo workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6 font-semibold">
                <Link to="/dashboard">Launch Demo <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
              </Button>
              <Button size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
                Talk to Sales
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
