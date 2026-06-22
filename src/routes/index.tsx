import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  ArrowRight, Zap, Shield, Globe2, Sparkles, TrendingUp, CheckCircle2,
  Building2, Lock, Quote, Wallet, Ship, CreditCard, Brain, FileText,
  MessageCircle, Truck, Factory, Users, GraduationCap, Plane, Briefcase,
  ShieldCheck, ScanLine, Receipt, Languages,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canta — Move Money. Move Goods. Collect Globally. Spend Globally." },
      { name: "description", content: "Canta is the financial and trade operating system for African businesses moving money, goods, collections, and global spend. FX, trade shipments, supplier payments, local collections, freight, global cards, and compliance — one platform." },
      { property: "og:title", content: "Canta — The Financial & Trade Operating System for Africa" },
      { property: "og:description", content: "Manage FX, trade shipments, supplier payments, local collections, freight workflows, global cards, and compliance from one operating system." },
    ],
  }),
  component: Landing,
});

const pillars = [
  {
    id: "move-money",
    tag: "Move Money",
    icon: Wallet,
    headline: "Treasury, FX, wallets, beneficiaries and settlements — orchestrated.",
    description: "Manage treasury, FX conversion, wallets, beneficiaries, approvals, and global settlements.",
    features: ["Multi-currency wallets", "Real-time FX", "Beneficiaries", "Transaction approvals", "Settlement tracking", "Audit-ready records"],
    cta: { label: "Explore Treasury Platform", to: "/welcome" },
    accent: "from-primary to-primary-glow",
  },
  {
    id: "move-goods",
    tag: "Move Goods",
    icon: Ship,
    headline: "From pro-forma to port — a full trade workspace.",
    description: "Track shipments, organize documents, manage suppliers, calculate landed cost, and prepare for arrival.",
    features: ["Trade Desk", "Shipment timelines", "Document vault", "Freight forwarder workspace", "Landed cost calculator", "WhatsApp updates", "Clearing readiness"],
    cta: { label: "Start with Canta Trade Desk", to: "/welcome" },
    accent: "from-accent to-primary",
  },
  {
    id: "collect-globally",
    tag: "Collect Globally",
    icon: Globe2,
    headline: "Local African collections. Global settlement.",
    description: "Help global businesses collect locally from African customers and settle globally.",
    features: ["NGN local collections", "Payment links", "Invoice references", "Reconciliation", "USD / GBP / EUR / RMB / AED settlement", "Merchant reports"],
    cta: { label: "Open Global Collections", to: "/welcome" },
    accent: "from-success to-accent",
  },
  {
    id: "spend-globally",
    tag: "Spend Globally",
    icon: CreditCard,
    headline: "Purpose-built global cards for every African business need.",
    description: "Purpose-built global cards for business, travel, import expenses, students, teams, and ad spend.",
    features: ["Travel cards", "Team cards", "Importer cards", "Student cards", "Ad spend cards", "Limits and approvals", "Receipt tracking"],
    cta: { label: "Create Global Spend Card", to: "/welcome" },
    accent: "from-warning to-accent",
  },
] as const;

const aiFeatures = [
  { icon: ScanLine, t: "Document extraction", d: "AI parses BLs, invoices, packing lists and receipts in seconds." },
  { icon: TrendingUp, t: "Lead scoring", d: "Rank importer, supplier and merchant prospects by conversion intent." },
  { icon: Brain, t: "Sales copilot", d: "Auto-draft outreach, follow-ups and call summaries for Canta teams." },
  { icon: Receipt, t: "Landed cost estimates", d: "Forecast duty, freight, clearing and FX before the goods ship." },
  { icon: Factory, t: "Supplier matching", d: "Match importers to verified Chinese, Turkish and UAE suppliers." },
  { icon: Languages, t: "WhatsApp onboarding", d: "Onboard non-tech importers conversationally — no app required." },
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
  { icon: Truck, t: "Freight Forwarders" },
  { icon: Factory, t: "Suppliers" },
  { icon: Globe2, t: "Global Merchants" },
  { icon: Building2, t: "Enterprises" },
  { icon: GraduationCap, t: "Students" },
  { icon: Plane, t: "Travelers" },
  { icon: Users, t: "SMEs & Teams" },
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
            <a href="#pillars" className="hover:text-foreground">Platform</a>
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

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32 text-primary-foreground relative">
          <Badge className="bg-white/10 text-primary-foreground border border-white/20 hover:bg-white/15">
            <Sparkles className="h-3 w-3 mr-1" /> The financial & trade operating system for Africa
          </Badge>
          <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] max-w-5xl">
            Move money, move goods, collect globally, and{" "}
            <span className="text-accent">spend globally</span> — from one trusted Canta workspace.
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-primary-foreground/80">
            Canta helps African businesses manage FX, supplier payments, shipments, local
            collections, global cards, and compliance across one operating system.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1FB855] hover:shadow-lg hover:shadow-[#25D366]/30 transition h-12 px-6 font-semibold">
              <a href={buildWhatsAppUrl("sendInvoice")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-1.5" /> Send Invoice on WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6 font-semibold">
              <a href={buildWhatsAppUrl("trackShipment")} target="_blank" rel="noopener noreferrer">
                <Ship className="h-4 w-4 mr-1.5" /> Track My Shipment
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
              <Link to="/trade-desk">Start with Canta Trade Desk <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
              <Link to="/dashboard">Explore Treasury Platform</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
              <Link to="/cards">Create Global Spend Card</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
            {[
              { v: "1 platform", l: "Money, goods, collections, cards" },
              { v: "30+", l: "Currencies & corridors" },
              { v: "<30s", l: "Cross-border settlement" },
              { v: "24/7", l: "Trade & treasury support" },
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
          <div className="text-xs uppercase tracking-widest text-muted-foreground mr-4">Powering African trade & treasury for</div>
          {["Importers", "Freight Forwarders", "Suppliers", "Global Merchants", "Enterprises", "Universities"].map((n) => (
            <div key={n} className="text-sm font-semibold text-muted-foreground/80 tracking-tight">{n}</div>
          ))}
        </div>
      </section>

      {/* What do you want to do with Canta? */}
      <section id="do" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-widest text-accent-foreground/80 font-semibold">Pick your workspace</div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mt-3">
            What do you want to do with Canta?
          </h2>
          <p className="text-muted-foreground mt-4">
            Choose how you'll use Canta. Each workspace comes with its own dashboard, navigation, and tools.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Ship, tag: "Track My Shipment", desc: "For importers managing goods, suppliers, documents, landed cost, and arrival readiness.", cta: "Start Import Desk", to: "/welcome", tone: "bg-accent/15 text-accent" },
            { icon: Truck, tag: "Manage Freight Customers", desc: "For freight forwarders and clearing agents managing shipments, documents, invoices, and WhatsApp updates.", cta: "Open Freight Workspace", to: "/welcome", tone: "bg-warning/15 text-warning" },
            { icon: Globe2, tag: "Collect from African Customers", desc: "For universities, hospitals, airlines, property firms, travel companies, and global merchants collecting locally and settling globally.", cta: "Start Global Collections", to: "/welcome", tone: "bg-success/15 text-success" },
            { icon: Factory, tag: "Invoice African Buyers", desc: "For suppliers and exporters in China, UAE, Turkey, India, and other markets selling to African buyers.", cta: "Open Supplier Dashboard", to: "/welcome", tone: "bg-amber-500/15 text-amber-700" },
            { icon: Building2, tag: "Manage Company Treasury", desc: "For enterprises managing FX, wallets, beneficiaries, approvals, settlement, and company cards.", cta: "Explore Treasury", to: "/welcome", tone: "bg-primary/10 text-primary" },
            { icon: CreditCard, tag: "Create Global Spend Cards", desc: "For businesses, travelers, students, teams, importers, and ad spend.", cta: "Create Card", to: "/welcome", tone: "bg-destructive/10 text-destructive" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.tag} to={c.to} className="group p-6 rounded-2xl border border-border bg-card hover:shadow-elevated hover:-translate-y-0.5 transition">
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

      {/* Four product pillars */}
      <section id="pillars" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-accent-foreground/80 font-semibold">The Canta Platform</div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mt-3">
            Four products. One operating system.
          </h2>
          <p className="text-muted-foreground mt-4">
            Each pillar replaces a category of bank portals, brokers, spreadsheets and WhatsApp threads
            that African businesses use today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-14">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.id} className="group relative p-8 rounded-3xl border border-border bg-card hover:shadow-elevated transition overflow-hidden">
                <div className={`absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br ${p.accent} opacity-10 blur-3xl group-hover:opacity-20 transition`} />
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${p.accent} grid place-items-center text-primary-foreground shadow-glow`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-xs uppercase tracking-widest font-semibold text-accent-foreground/80">{p.tag}</div>
                </div>
                <div className="mt-5 text-xl md:text-2xl font-semibold tracking-tight leading-snug">{p.headline}</div>
                <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.features.map((f) => (
                    <Badge key={f} variant="outline" className="text-[11px] border-border bg-secondary/40 font-normal">{f}</Badge>
                  ))}
                </div>
                <Button asChild variant="ghost" className="mt-6 px-0 hover:bg-transparent hover:text-accent text-accent-foreground/90 font-semibold">
                  <Link to={p.cta.to}>{p.cta.label} <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
                </Button>
              </div>
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
                AI-powered trade and growth intelligence.
              </h2>
              <p className="text-muted-foreground mt-4">
                Embedded across every module — so your team works on outcomes, not paperwork.
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
            Built for regulated global trade and payments.
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
              One operating system. Every kind of African business.
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

      {/* Quote */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-3xl border border-border p-10 md:p-14 bg-card">
          <Quote className="h-8 w-8 text-accent" />
          <p className="mt-5 text-2xl md:text-3xl font-medium tracking-tight leading-snug max-w-4xl">
            "Canta replaced four tools — our FX broker, freight tracker, supplier WhatsApp chaos
            and bank portal — with one workspace. Our trade cycle dropped from weeks to days."
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            COO · West African Importer Group
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-card text-primary-foreground p-10 md:p-16 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-primary-glow/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Move money. Move goods. Collect globally. Spend globally.
            </h2>
            <p className="text-primary-foreground/75 mt-4">
              Step into a fully-loaded Canta workspace and feel the entire operating system —
              from trade files to FX, from collections to global cards.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6 font-semibold">
                <Link to="/trade-desk">Start with Canta Trade Desk <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
                <Link to="/dashboard">Explore Treasury Platform</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="bg-white/10 text-primary-foreground border border-white/15 hover:bg-white/15 h-12 px-6">
                <Link to="/cards">Create Global Spend Card</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs text-primary-foreground/70">
              <MessageCircle className="h-3.5 w-3.5" />
              Prefer WhatsApp? Canta Trade Officers can onboard your business directly on WhatsApp.
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Canta Financial Technologies. The financial & trade operating system for African businesses.</div>
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
