import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { setActiveMode, type Mode } from "@/components/ModeProvider";
import { seedDemoSupplierPersona } from "@/lib/demo-supplier";
import {
  ArrowRight, Zap, Shield, Sparkles, TrendingUp, CheckCircle2,
  Building2, Lock, Ship, Brain, FileText,
  MessageCircle, Factory, Briefcase, Home,
  ShieldCheck, ScanLine, Receipt, Languages,
} from "lucide-react";

// Set workspace on click so the destination renders its correct shell, sidebar
// and topbar from the very first paint. When the visitor picks Supplier, also
// seed the pre-verified investor-demo persona so /supplier-portal opens
// directly (mirroring the /welcome flow).
const pickWorkspace = (m: Mode) => () => {
  setActiveMode(m);
  if (m === "Supplier") seedDemoSupplierPersona();
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canta — Trade & Treasury Operating System" },
      { name: "description", content: "Canta helps importers, suppliers, enterprises, and partners manage trade files, supplier payments, FX, RMB settlement, documents, and treasury workflows from one trusted workspace." },
      { property: "og:title", content: "Canta — Trade & Treasury Operating System" },
      { property: "og:description", content: "Canta helps importers, suppliers, enterprises, and partners manage trade files, supplier payments, FX, RMB settlement, documents, and treasury workflows from one trusted workspace." },
    ],
  }),
  component: Landing,
});

const aiFeatures = [
  { icon: ScanLine, t: "Document extraction", d: "AI-assisted document review for BLs, invoices and packing lists." },
  { icon: TrendingUp, t: "Trade file insights", d: "Spot which shipments, suppliers and payments need attention next." },
  { icon: Brain, t: "AI assistant", d: "Summarize trade conversations, draft replies, and track next steps." },
      { icon: Receipt, t: "Landed cost estimates", d: "Forecast duty, freight, agent quote inputs and FX before goods ship." },
  { icon: Languages, t: "WhatsApp onboarding", d: "Onboard importers conversationally — no app required." },
  { icon: ShieldCheck, t: "Supplier settlement intelligence", d: "Track NGN buyer payments, RMB settlement status, documents, and receipts." },
];

const trust = [
  { icon: ShieldCheck, t: "KYB / KYC" },
  { icon: FileText, t: "Compliance packs" },
  { icon: Lock, t: "Audit trails" },
  { icon: CheckCircle2, t: "Approval workflows" },
  { icon: TrendingUp, t: "Transaction monitoring" },
  { icon: Shield, t: "Role-based controls" },
];

const segments = [
  { icon: Briefcase, t: "Importers" },
  { icon: Factory, t: "Suppliers" },
  { icon: Building2, t: "Enterprises" },
  { icon: Home, t: "Partners" },
];

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
            <a href="#workspaces" className="hover:text-foreground">Workspaces</a>
            <a href="#ai" className="hover:text-foreground">AI</a>
            <a href="#trust" className="hover:text-foreground">Trust</a>
            <a href="#segments" className="hover:text-foreground">Who it's for</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Sign in</Link></Button>
            <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/welcome">Get started <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 -z-10 bg-gradient-card" />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/15 blur-3xl -z-10" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-glow/25 blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32 text-primary-foreground relative flex flex-col items-center text-center">
          <Badge className="bg-white/10 text-primary-foreground border border-white/20 hover:bg-white/15">
            <Sparkles className="h-3 w-3 mr-1" /> Interactive demo · no sign-up
          </Badge>
          <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] max-w-5xl mx-auto">
            Pay your supplier. Get paid by your buyer.{" "}
            <span className="text-accent">Move treasury globally.</span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-primary-foreground/80">
            Nigerian importers pay Chinese suppliers safely. Chinese suppliers receive
            <strong className="text-primary-foreground"> RMB settlement</strong> after buyers pay locally in NGN.
            Enterprises run FX, wallets and payouts — all from one workspace with full audit trails.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6 font-semibold">
              <Link to="/welcome">Try the demo <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
              <Link to="/importer" onClick={pickWorkspace("Importer")}>Importer Trade Desk</Link>
            </Button>
            <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1FB855] hover:shadow-lg hover:shadow-[#25D366]/30 transition h-12 px-6 font-semibold">
              <Link to="/track/whatsapp">
                <MessageCircle className="h-4 w-4 mr-1.5" /> Track on WhatsApp
              </Link>
            </Button>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-xs text-primary-foreground/70">
            <ShieldCheck className="h-3.5 w-3.5" /> KYB · Audit trail · Compliance review on every settlement
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto w-full items-start">
            {[
              { v: "Pay China suppliers in RMB", l: "Nigerian buyers fund locally in NGN" },
              { v: "4 connected workspaces", l: "Importer · Supplier · Treasury · Partner" },
              { v: "One trade operating system", l: "Shipments, invoices, FX, payments and documents" },
              { v: "Audit-ready by design", l: "Every action, approval, payment and receipt recorded" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl md:text-3xl font-semibold tabular-nums text-balance">{s.v}</div>
                <div className="text-xs text-primary-foreground/60 mt-1 text-balance">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Logo strip */}
      <section className="border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mr-4">Built for</div>
          {["Importers", "Suppliers", "Enterprises", "Partners"].map((n) => (
            <div key={n} className="text-sm font-semibold text-muted-foreground/80 tracking-tight">{n}</div>
          ))}
        </div>
      </section>

      {/* Workspaces */}
      <section id="workspaces" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-widest text-accent-foreground/80 font-semibold">Pick your workspace</div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mt-3">
            Four focused workspaces. One platform.
          </h2>
          <p className="text-muted-foreground mt-4">
            Each workspace comes with its own dashboard, navigation, and tools — purpose-built for the role.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {([
            { icon: Ship,      tag: "Importer Trade Desk",   desc: "Send your BL, track shipments, organize documents, and pay suppliers safely. Compare clearing agent bids inside each Trade File.", cta: "Enter Importer Trade Desk", to: "/importer",         mode: "Importer" as Mode,            tone: "bg-accent/15 text-accent" },
            { icon: Factory,   tag: "Supplier Portal",       desc: "Nigerian buyers can pay locally in NGN while suppliers receive RMB settlement through Canta. Suppliers can send payment requests, upload invoices, and track settlement receipts.", cta: "Enter Supplier Portal",     to: "/supplier-portal",  mode: "Supplier" as Mode,            tone: "bg-amber-500/15 text-amber-700" },
            { icon: Building2, tag: "Enterprise Treasury",   desc: "Multi-currency balances, FX, bulk payouts, approvals, beneficiaries, and treasury reports.",          cta: "Enter Treasury",              to: "/treasury",         mode: "Enterprise Treasury" as Mode, tone: "bg-primary/10 text-primary" },
            { icon: Home,      tag: "Partner Mode",          desc: "Property and company partners referring clients to Canta. Track referrals, payments and commission.",  cta: "Enter Partner Mode",          to: "/partner",          mode: "Partner Property" as Mode,    tone: "bg-primary/10 text-primary" },
          ] as const).map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.tag} to={c.to} onClick={pickWorkspace(c.mode)} className="group p-6 rounded-2xl border border-border bg-card hover:shadow-elevated hover:-translate-y-0.5 transition">
                <div className={`h-12 w-12 rounded-2xl grid place-items-center ${c.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-5 text-lg font-semibold tracking-tight">{c.tag}</div>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  {c.cta} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AI section */}
      <section id="ai" className="bg-secondary/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <Badge className="bg-accent/15 text-accent-foreground border border-accent/30 hover:bg-accent/15">
                <Sparkles className="h-3 w-3 mr-1" /> Canta AI
              </Badge>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-4">
                AI-powered trade intelligence.
              </h2>
              <p className="text-muted-foreground mt-4">
                Embedded across every workspace — so your team works on outcomes, not paperwork.
              </p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.t} className="p-5 rounded-2xl border border-border bg-card">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="mt-3 font-semibold">{f.t}</div>
                    <div className="text-sm text-muted-foreground mt-1">{f.d}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-widest text-accent-foreground/80 font-semibold">Trust & Compliance</div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3">
            Built for regulated trade and payments.
          </h2>
          <p className="text-muted-foreground mt-4">
            Every action — every approval, document and payment — is auditable, reviewable and policy-controlled.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trust.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.t} className="p-5 rounded-2xl border border-border bg-card text-center">
                <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center mx-auto">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-3 text-sm font-semibold">{t.t}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Segments */}
      <section id="segments" className="bg-secondary/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs uppercase tracking-widest text-accent-foreground/80 font-semibold">Who Canta serves</div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3">
              Built for importers, suppliers, enterprises, and partners.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {segments.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.t} className="p-6 rounded-2xl border border-border bg-card hover:shadow-elevated transition flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-accent grid place-items-center text-primary-foreground shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-semibold text-sm">{s.t}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product benefit */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-3xl border border-border p-10 md:p-14 bg-card">
          <FileText className="h-8 w-8 text-accent" />
          <p className="mt-5 text-2xl md:text-3xl font-medium tracking-tight leading-snug max-w-4xl">
            Built for documented trade.
          </p>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Keep invoices, payment requests, FX quotes, compliance checks, receipts, and settlement updates in one auditable workspace.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-card text-primary-foreground p-10 md:p-16 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-primary-glow/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
              One trusted workspace. Trade files. Supplier settlement. Treasury.
            </h2>
            <p className="text-primary-foreground/75 mt-4">
              Step into a Canta workspace and feel the platform — from trade files to FX,
              from supplier settlement to payouts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6 font-semibold">
                <Link to="/importer" onClick={pickWorkspace("Importer")}>Start with Importer Trade Desk <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
                <Link to="/treasury" onClick={pickWorkspace("Enterprise Treasury")}>Explore Enterprise Treasury</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
                <Link to="/welcome">All Workspaces</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs text-primary-foreground/70">
              <MessageCircle className="h-3.5 w-3.5" />
              Prefer WhatsApp? Send your BL, container number, or shipment details and Canta will guide you from there.
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Canta Financial Technologies. The trade & treasury operating system.</div>
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
