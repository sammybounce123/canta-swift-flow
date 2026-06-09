import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { fmtMoney } from "@/lib/mock";
import { WorkspaceCardsPanel } from "@/components/CardsPanel";
import { WorkspaceWelcome } from "@/components/WorkspaceWelcome";
import {
  Users, FileText, ShieldCheck, Wallet, CheckCircle2, AlertTriangle, Plus, Copy,
  Lock, Banknote, Calendar, Download, Globe, Award, Receipt, Upload, Building2,
  MessageCircle, Clock, TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/suppliers")({
  head: () => ({ meta: [{ title: "Supplier Dashboard — Canta" }] }),
  component: SupplierDashboard,
});

// ---------- Supplier-side mock data ----------
type Buyer = {
  name: string; country: string; flag: string; verified: boolean;
  totalValue: number; openInvoices: number; lastTx: string; risk: "Low" | "Medium" | "High";
};

const buyers: Buyer[] = [
  { name: "ABC Electronics",     country: "Nigeria",  flag: "🇳🇬", verified: true,  totalValue: 412_000, openInvoices: 2, lastTx: "2026-06-04", risk: "Low" },
  { name: "Balogun Trade Hub",   country: "Nigeria",  flag: "🇳🇬", verified: true,  totalValue: 287_500, openInvoices: 1, lastTx: "2026-06-06", risk: "Low" },
  { name: "Accra Imports Ltd",   country: "Ghana",    flag: "🇬🇭", verified: true,  totalValue: 168_300, openInvoices: 1, lastTx: "2026-05-30", risk: "Medium" },
  { name: "Nairobi Tech Hub",    country: "Kenya",    flag: "🇰🇪", verified: false, totalValue: 41_000,  openInvoices: 1, lastTx: "2026-05-22", risk: "Medium" },
  { name: "Dakar Mode SARL",     country: "Senegal",  flag: "🇸🇳", verified: true,  totalValue: 96_400,  openInvoices: 0, lastTx: "2026-05-15", risk: "Low" },
  { name: "Trade Fair Imports",  country: "Nigeria",  flag: "🇳🇬", verified: false, totalValue: 58_700,  openInvoices: 1, lastTx: "2026-05-28", risk: "High" },
];

type PayStatus =
  | "Awaiting Buyer Payment" | "Payment Received" | "Funds Secured"
  | "Under Review" | "Settlement Scheduled" | "Settled";

type SupplierInvoice = {
  id: string; ref: string; buyer: string; buyerCountry: string;
  amount: number; ccy: string; settleCcy: "RMB" | "USD" | "AED" | "GBP" | "EUR";
  goods: string; terms: string; due: string; issued: string;
  status: PayStatus; collectionRef: string;
};

const invoices: SupplierInvoice[] = [
  { id: "SI-7041", ref: "INV-CN-7041", buyer: "ABC Electronics",     buyerCountry: "Nigeria", amount: 184_000, ccy: "USD", settleCcy: "RMB", goods: "Mixed consumer electronics, 240 cartons", terms: "30% deposit, 70% on BL", due: "2026-06-25", issued: "2026-05-25", status: "Funds Secured",         collectionRef: "CANTA-NGN-7041-AB" },
  { id: "SI-7042", ref: "INV-CN-7042", buyer: "Balogun Trade Hub",   buyerCountry: "Nigeria", amount: 67_400,  ccy: "USD", settleCcy: "RMB", goods: "Mixed fashion bales, 180 bales",      terms: "T/T 30 days",         due: "2026-06-30", issued: "2026-05-30", status: "Settlement Scheduled", collectionRef: "CANTA-NGN-7042-BT" },
  { id: "SI-7043", ref: "INV-AE-7043", buyer: "Accra Imports Ltd",   buyerCountry: "Ghana",   amount: 41_900,  ccy: "USD", settleCcy: "AED", goods: "Auto spare parts, 88 cartons",        terms: "50/50",               due: "2026-06-18", issued: "2026-05-18", status: "Payment Received",     collectionRef: "CANTA-GHS-7043-AI" },
  { id: "SI-7044", ref: "INV-CN-7044", buyer: "Nairobi Tech Hub",    buyerCountry: "Kenya",   amount: 28_400,  ccy: "USD", settleCcy: "USD", goods: "Phone accessories, 14 cartons",       terms: "100% prepayment",     due: "2026-06-12", issued: "2026-05-22", status: "Awaiting Buyer Payment", collectionRef: "CANTA-KES-7044-NT" },
  { id: "SI-7045", ref: "INV-TR-7045", buyer: "Dakar Mode SARL",     buyerCountry: "Senegal", amount: 96_400,  ccy: "EUR", settleCcy: "EUR", goods: "Apparel SS26 collection",             terms: "30/70",               due: "2026-05-30", issued: "2026-04-30", status: "Settled",              collectionRef: "CANTA-XOF-7045-DM" },
  { id: "SI-7046", ref: "INV-CN-7046", buyer: "Trade Fair Imports",  buyerCountry: "Nigeria", amount: 12_800,  ccy: "USD", settleCcy: "RMB", goods: "Office furniture, 60 cartons",        terms: "T/T on arrival",      due: "2026-06-15", issued: "2026-05-20", status: "Under Review",         collectionRef: "CANTA-NGN-7046-TF" },
];

type EscrowMilestone = { label: string; done: boolean };
type Escrow = {
  id: string; invoice: string; buyer: string; amount: number; ccy: string;
  milestones: EscrowMilestone[]; release: "Pending" | "Released" | "Held"; dispute: "None" | "Open" | "Resolved";
};

const escrows: Escrow[] = [
  { id: "ESC-3301", invoice: "SI-7041", buyer: "ABC Electronics", amount: 184_000, ccy: "USD", release: "Pending", dispute: "None",
    milestones: [
      { label: "Order confirmed", done: true }, { label: "Goods ready", done: true },
      { label: "Goods received at warehouse", done: true }, { label: "Bill of Lading uploaded", done: true },
      { label: "Shipped", done: true }, { label: "Delivered", done: false },
    ] },
  { id: "ESC-3302", invoice: "SI-7042", buyer: "Balogun Trade Hub", amount: 67_400, ccy: "USD", release: "Released", dispute: "None",
    milestones: [
      { label: "Order confirmed", done: true }, { label: "Goods ready", done: true },
      { label: "Goods received at warehouse", done: true }, { label: "Bill of Lading uploaded", done: true },
      { label: "Shipped", done: true }, { label: "Delivered", done: true },
    ] },
  { id: "ESC-3303", invoice: "SI-7046", buyer: "Trade Fair Imports", amount: 12_800, ccy: "USD", release: "Held", dispute: "Open",
    milestones: [
      { label: "Order confirmed", done: true }, { label: "Goods ready", done: true },
      { label: "Goods received at warehouse", done: false }, { label: "Bill of Lading uploaded", done: false },
      { label: "Shipped", done: false }, { label: "Delivered", done: false },
    ] },
];

type Settlement = {
  id: string; invoice: string; ccy: string; amount: number; fxRate: number;
  payoutDate: string; status: "Scheduled" | "Processing" | "Paid"; receipt?: string;
};

const settlements: Settlement[] = [
  { id: "SET-9901", invoice: "SI-7042", ccy: "RMB", amount: 482_300, fxRate: 7.16, payoutDate: "2026-06-14", status: "Scheduled" },
  { id: "SET-9902", invoice: "SI-7043", ccy: "AED", amount: 153_900, fxRate: 3.67, payoutDate: "2026-06-12", status: "Processing" },
  { id: "SET-9903", invoice: "SI-7045", ccy: "EUR", amount: 96_400,  fxRate: 1.00, payoutDate: "2026-05-31", status: "Paid", receipt: "REC-2031" },
  { id: "SET-9904", invoice: "SI-7041", ccy: "RMB", amount: 1_317_400, fxRate: 7.16, payoutDate: "2026-06-22", status: "Scheduled" },
];

const PAY_TONES: Record<PayStatus, string> = {
  "Awaiting Buyer Payment": "bg-secondary text-secondary-foreground border-border",
  "Payment Received":       "bg-blue-500/15 text-blue-700 border-blue-500/30",
  "Funds Secured":          "bg-success/15 text-success border-success/30",
  "Under Review":           "bg-amber-500/15 text-amber-700 border-amber-500/30",
  "Settlement Scheduled":   "bg-primary/10 text-primary border-primary/20",
  "Settled":                "bg-success/15 text-success border-success/30",
};

function SupplierDashboard() {
  const [createOpen, setCreateOpen] = useState(false);

  const stats = useMemo(() => {
    const open = invoices.filter((i) => i.status !== "Settled").length;
    const secured = invoices.filter((i) => ["Funds Secured", "Settlement Scheduled"].includes(i.status)).reduce((a, b) => a + b.amount, 0);
    const pending = invoices.filter((i) => i.status === "Settlement Scheduled").reduce((a, b) => a + b.amount, 0);
    const settledMonth = invoices.filter((i) => i.status === "Settled").reduce((a, b) => a + b.amount, 0);
    const disputed = escrows.filter((e) => e.dispute === "Open").length;
    return { open, secured, pending, settledMonth, disputed };
  }, []);

  const kpis = [
    { l: "Active buyers",         v: String(buyers.length),               icon: Users,        tone: "" },
    { l: "Open invoices",         v: String(stats.open),                  icon: FileText,     tone: "" },
    { l: "Funds secured",         v: fmtMoney(stats.secured, "USD"),       icon: ShieldCheck,  tone: "text-success" },
    { l: "Pending settlement",    v: fmtMoney(stats.pending, "USD"),       icon: Wallet,       tone: "" },
    { l: "Settled this month",    v: fmtMoney(stats.settledMonth, "USD"),  icon: CheckCircle2, tone: "text-success" },
    { l: "Escrow transactions",   v: String(escrows.length),              icon: Lock,         tone: "" },
    { l: "Disputed transactions", v: String(stats.disputed),              icon: AlertTriangle, tone: stats.disputed ? "text-destructive" : "" },
  ];

  return (
    <div className="space-y-6">
      <WorkspaceWelcome workspace="supplier_dashboard" />
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Supplier Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Safely invoice African buyers, secure funds in escrow, and settle in your home currency.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> New Invoice</Button></DialogTrigger>
          <NewInvoiceDialog onClose={() => setCreateOpen(false)} />
        </Dialog>
      </div>

      {/* Foreign Supplier Trust Pack (especially for Chinese exporters) */}
      <Card className="p-5 shadow-card border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent" /> Foreign Supplier Trust Pack
            </div>
            <div className="text-xs text-muted-foreground mt-1">Built for exporters in China, Turkey, UAE & beyond — sell to African buyers with confidence.</div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success("Language: 中文")}>中文</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Language: English")}>EN</Button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { i: MessageCircle, l: "WeChat support", v: "@CantaSupportCN", tone: "bg-success/10 text-success" },
            { i: Users, l: "China rep on the ground", v: "Shenzhen · Guangzhou", tone: "bg-primary/10 text-primary" },
            { i: Clock, l: "Settlement SLA", v: "T+2 to RMB account", tone: "bg-accent/15 text-accent" },
            { i: ShieldCheck, l: "Verified African Buyer", v: "KYB + business licence", tone: "bg-success/10 text-success" },
            { i: TrendingUp, l: "Buyer reliability score", v: "Average 87 / 100", tone: "bg-primary/10 text-primary" },
            { i: Award, l: "Funds Secured certificate", v: "Issued per invoice", tone: "bg-warning/10 text-warning" },
          ].map((b) => (
            <div key={b.l} className="p-3 rounded-xl bg-card border border-border">
              <div className={`h-8 w-8 rounded-lg grid place-items-center ${b.tone}`}>
                <b.i className="h-4 w-4" />
              </div>
              <div className="mt-2 text-xs font-semibold">{b.l}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{b.v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trust signals strip */}
      <div className="flex flex-wrap gap-2">
        <TrustBadge icon={<ShieldCheck className="h-3 w-3" />} label="Verified Buyers" tone="success" />
        <TrustBadge icon={<Lock className="h-3 w-3" />} label="Funds Secured" tone="success" />
        <TrustBadge icon={<Banknote className="h-3 w-3" />} label="Escrow Active" tone="primary" />
        <TrustBadge icon={<Calendar className="h-3 w-3" />} label="Settlement Scheduled" tone="primary" />
        <TrustBadge icon={<Award className="h-3 w-3" />} label="Completed Transactions: 142" tone="accent" />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map((k) => (
          <Card key={k.l} className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
              <k.icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className={`text-2xl font-semibold tabular-nums mt-2 ${k.tone}`}>{k.v}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="buyers">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="buyers">Buyers</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payment Status</TabsTrigger>
          <TabsTrigger value="escrow">Escrow</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="profile">Supplier Profile</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="buyers" className="mt-6"><BuyersTable /></TabsContent>
        <TabsContent value="invoices" className="mt-6"><InvoicesPanel onCreate={() => setCreateOpen(true)} /></TabsContent>
        <TabsContent value="payments" className="mt-6"><PaymentStatusBoard /></TabsContent>
        <TabsContent value="escrow" className="mt-6"><EscrowPanel /></TabsContent>
        <TabsContent value="settlements" className="mt-6"><SettlementsTable /></TabsContent>
        <TabsContent value="documents" className="mt-6"><DocumentsPanel /></TabsContent>
        <TabsContent value="profile" className="mt-6"><ProfilePanel /></TabsContent>
        <TabsContent value="reports" className="mt-6"><SupplierReportsPanel /></TabsContent>
        <TabsContent value="team" className="mt-6"><SupplierTeamPanel /></TabsContent>
      </Tabs>

      <WorkspaceCardsPanel
        title="Supplier Cards"
        subtitle="Cards for sample shipping, factory inspections, certifications, sourcing trips and platform fees."
        categories={["Sample shipping", "Inspections", "Certifications", "Sourcing travel", "Platform fees"]}
        pendingApprovals={1}
        receiptsMissing={2}
        groupedLabel="buyer"
        groupedSpend={[
          { label: "ABC Electronics",   amount: 4_200 },
          { label: "Global Motors",     amount: 2_900 },
          { label: "Balogun Trade Hub", amount: 1_700 },
        ]}
        cards={[
          { id: "S1", label: "Sample Shipping",   holder: "Logistics", last4: "2240", status: "Active", monthlySpend: 1800, limit: 4000, category: "Sample shipping" },
          { id: "S2", label: "QC Inspections",    holder: "Quality",   last4: "8814", status: "Active", monthlySpend: 950,  limit: 3000, category: "Inspections" },
          { id: "S3", label: "Sourcing Travel",   holder: "Sales",     last4: "5567", status: "Active", monthlySpend: 1400, limit: 5000, category: "Sourcing travel" },
        ]}
      />
    </div>
  );
}

function TrustBadge({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: "success" | "primary" | "accent" }) {
  const cls = tone === "success" ? "bg-success/10 text-success border-success/30"
    : tone === "primary" ? "bg-primary/10 text-primary border-primary/20"
    : "bg-accent/10 text-accent border-accent/30";
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${cls}`}>{icon} {label}</span>;
}

function BuyersTable() {
  const riskTone: Record<Buyer["risk"], string> = {
    Low: "bg-success/15 text-success border-success/30",
    Medium: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    High: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
            <th className="px-4 py-3">Buyer</th>
            <th className="px-4 py-3">Country</th>
            <th className="px-4 py-3">Verification</th>
            <th className="px-4 py-3 text-right">Total value</th>
            <th className="px-4 py-3">Open invoices</th>
            <th className="px-4 py-3">Last transaction</th>
            <th className="px-4 py-3">Risk</th>
          </tr></thead>
          <tbody>
            {buyers.map((b) => (
              <tr key={b.name} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3"><span className="mr-1">{b.flag}</span>{b.country}</td>
                <td className="px-4 py-3">
                  {b.verified
                    ? <Badge variant="outline" className="text-[10px] border-success/30 text-success"><ShieldCheck className="h-3 w-3 mr-1" /> Verified</Badge>
                    : <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-700">Pending KYB</Badge>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(b.totalValue, "USD")}</td>
                <td className="px-4 py-3 tabular-nums">{b.openInvoices}</td>
                <td className="px-4 py-3 text-xs">{b.lastTx}</td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskTone[b.risk]}`}>{b.risk}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function InvoicesPanel({ onCreate }: { onCreate: () => void }) {
  const [selected, setSelected] = useState<SupplierInvoice | null>(null);
  return (
    <>
      <Card className="shadow-card overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-border">
          <div className="text-sm font-semibold">All invoices</div>
          <Button size="sm" className="bg-primary" onClick={onCreate}><Plus className="h-3.5 w-3.5 mr-1" /> New invoice</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Settles in</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr></thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{i.ref}</td>
                  <td className="px-4 py-3">{i.buyer}<div className="text-xs text-muted-foreground">{i.buyerCountry}</div></td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(i.amount, i.ccy)}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{i.settleCcy}</Badge></td>
                  <td className="px-4 py-3 text-xs">{i.due}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${PAY_TONES[i.status]}`}>{i.status}</span></td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => setSelected(i)}>View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && <InvoiceDetailDialog invoice={selected} />}
      </Dialog>
    </>
  );
}

function InvoiceDetailDialog({ invoice }: { invoice: SupplierInvoice }) {
  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">{invoice.ref} <span className={`text-[10px] px-2 py-0.5 rounded-full border ${PAY_TONES[invoice.status]}`}>{invoice.status}</span></DialogTitle>
        <p className="text-xs text-muted-foreground">Buyer: {invoice.buyer} · {invoice.buyerCountry}</p>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <Field label="Amount" value={fmtMoney(invoice.amount, invoice.ccy)} />
        <Field label="Settles in" value={invoice.settleCcy} />
        <Field label="Issued" value={invoice.issued} />
        <Field label="Due" value={invoice.due} />
        <Field label="Payment terms" value={invoice.terms} />
        <Field label="Goods" value={invoice.goods} wide />
      </div>

      <Card className="p-4 bg-secondary/40 border-dashed mt-2">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Buyer payment instruction</div>
        <p className="text-sm mt-2">
          Ask <strong>{invoice.buyer}</strong> to fund this invoice using the Dedicated Collection Reference below.
          Once funds arrive, they will be marked <em>Funds Secured</em> in escrow and settled to your account in {invoice.settleCcy}.
        </p>
        <div className="mt-3 p-3 rounded-lg bg-background border border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">NGN Local Collection Account</div>
          <div className="flex items-center justify-between mt-1">
            <div className="font-mono text-sm font-semibold">{invoice.collectionRef}</div>
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(invoice.collectionRef); toast.success("Reference copied"); }}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Dedicated collection reference · Canta acts as collection agent</div>
        </div>
      </Card>

      <Card className="p-4 mt-2">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Payment status tracker</div>
        <Tracker status={invoice.status} />
      </Card>

      <DialogFooter>
        <Button variant="outline" onClick={() => toast.success("Sent to buyer")}>Send to buyer</Button>
        <Button className="bg-primary" onClick={() => toast.success("PDF downloaded")}><Download className="h-3.5 w-3.5 mr-1.5" /> Download invoice</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function Tracker({ status }: { status: PayStatus }) {
  const order: PayStatus[] = ["Awaiting Buyer Payment", "Payment Received", "Funds Secured", "Settlement Scheduled", "Settled"];
  const idx = order.indexOf(status);
  return (
    <ol className="flex items-center justify-between">
      {order.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s} className="flex-1 flex flex-col items-center text-center">
            <div className={`h-7 w-7 rounded-full grid place-items-center text-[10px] font-semibold ${done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{i + 1}</div>
            <div className={`text-[10px] mt-1 ${active ? "font-semibold text-primary" : "text-muted-foreground"}`}>{s}</div>
            {i < order.length - 1 && <div className={`h-0.5 w-full ${done ? "bg-success" : "bg-border"} absolute`} style={{ display: "none" }} />}
          </li>
        );
      })}
    </ol>
  );
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

function PaymentStatusBoard() {
  const buckets: PayStatus[] = ["Awaiting Buyer Payment", "Payment Received", "Funds Secured", "Under Review", "Settlement Scheduled", "Settled"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {buckets.map((b) => {
        const list = invoices.filter((i) => i.status === b);
        return (
          <Card key={b} className="p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${PAY_TONES[b]}`}>{b}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{list.length}</span>
            </div>
            <div className="space-y-2">
              {list.map((i) => (
                <div key={i.id} className="p-2.5 rounded-lg border border-border bg-card text-xs">
                  <div className="font-semibold">{i.ref}</div>
                  <div className="text-muted-foreground">{i.buyer}</div>
                  <div className="flex justify-between mt-1"><span className="text-muted-foreground">Due {i.due}</span><span className="font-medium tabular-nums">{fmtMoney(i.amount, i.ccy)}</span></div>
                </div>
              ))}
              {list.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No invoices in this stage.</div>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function EscrowPanel() {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {escrows.map((e) => {
        const releaseTone = e.release === "Released" ? "border-success/30 text-success" : e.release === "Held" ? "border-destructive/30 text-destructive" : "border-primary/20 text-primary";
        const disputeTone = e.dispute === "Open" ? "border-destructive/30 text-destructive" : e.dispute === "Resolved" ? "border-success/30 text-success" : "border-border text-muted-foreground";
        const done = e.milestones.filter((m) => m.done).length;
        return (
          <Card key={e.id} className="p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">{e.id} · Invoice {e.invoice}</div>
                <div className="font-semibold mt-0.5">{e.buyer}</div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <Badge variant="outline" className={`text-[10px] ${releaseTone}`}>Release: {e.release}</Badge>
                <Badge variant="outline" className={`text-[10px] ${disputeTone}`}>Dispute: {e.dispute}</Badge>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-lg bg-secondary/40 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Escrow amount</div>
                <div className="text-xl font-semibold tabular-nums">{fmtMoney(e.amount, e.ccy)}</div>
              </div>
              <Lock className="h-6 w-6 text-primary" />
            </div>

            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Milestones ({done}/{e.milestones.length})</div>
              <ol className="space-y-1.5">
                {e.milestones.map((m) => (
                  <li key={m.label} className="flex items-center gap-2 text-sm">
                    {m.done ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                    <span className={m.done ? "" : "text-muted-foreground"}>{m.label}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 p-3 rounded-lg border border-dashed text-xs">
              <strong>Release conditions:</strong> Funds will be released to supplier once <em>Goods delivered</em> milestone is confirmed by buyer and forwarder, and no dispute is open.
            </div>

            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" disabled={e.release !== "Pending" || e.dispute === "Open"} onClick={() => toast.success("Release requested")}>Request release</Button>
              <Button size="sm" variant="ghost" onClick={() => toast.info("Dispute filed")}>Open dispute</Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function SettlementsTable() {
  const tones: Record<Settlement["status"], string> = {
    Scheduled:  "bg-primary/10 text-primary border-primary/20",
    Processing: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    Paid:       "bg-success/15 text-success border-success/30",
  };
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
            <th className="px-4 py-3">Settlement</th>
            <th className="px-4 py-3">Invoice</th>
            <th className="px-4 py-3">Currency</th>
            <th className="px-4 py-3 text-right">Payout amount</th>
            <th className="px-4 py-3 text-right">FX rate</th>
            <th className="px-4 py-3">Payout date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Receipt</th>
          </tr></thead>
          <tbody>
            {settlements.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{s.invoice}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{s.ccy}</Badge></td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(s.amount, s.ccy)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-xs">{s.fxRate}</td>
                <td className="px-4 py-3 text-xs">{s.payoutDate}</td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${tones[s.status]}`}>{s.status}</span></td>
                <td className="px-4 py-3 text-right">
                  {s.receipt
                    ? <Button size="sm" variant="ghost" onClick={() => toast.success("Receipt downloaded")}><Download className="h-3.5 w-3.5 mr-1" /> {s.receipt}</Button>
                    : <span className="text-xs text-muted-foreground">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DocumentsPanel() {
  const docs = [
    { type: "Commercial Invoice", invoice: "SI-7041", status: "Uploaded" },
    { type: "Packing List",       invoice: "SI-7041", status: "Uploaded" },
    { type: "Bill of Lading",     invoice: "SI-7041", status: "Uploaded" },
    { type: "Commercial Invoice", invoice: "SI-7042", status: "Uploaded" },
    { type: "Bill of Lading",     invoice: "SI-7042", status: "Uploaded" },
    { type: "Bill of Lading",     invoice: "SI-7046", status: "Missing"  },
    { type: "Packing List",       invoice: "SI-7044", status: "Missing"  },
  ];
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-border">
        <div className="text-sm font-semibold flex items-center gap-2"><Receipt className="h-4 w-4" /> Trade documents</div>
        <Button size="sm" variant="outline"><Upload className="h-3.5 w-3.5 mr-1" /> Upload</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
            <th className="px-4 py-3">Document</th><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th>
          </tr></thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-3">{d.type}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.invoice}</td>
                <td className="px-4 py-3">
                  {d.status === "Uploaded"
                    ? <Badge variant="outline" className="text-[10px] border-success/30 text-success"><CheckCircle2 className="h-3 w-3 mr-1" /> Uploaded</Badge>
                    : <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-700">Missing</Badge>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => toast.success(d.status === "Missing" ? "Upload dialog" : "Download")}>{d.status === "Missing" ? "Upload" : "Download"}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ProfilePanel() {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="p-5 shadow-card lg:col-span-2 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-primary/10 grid place-items-center"><Building2 className="h-7 w-7 text-primary" /></div>
          <div>
            <div className="font-semibold text-lg">Guangzhou Tech Factory Ltd.</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Globe className="h-3 w-3" /> Guangzhou, China · CN</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <Field label="Business registration" value="91440101MA9XXXXXXX" />
          <Field label="Primary contact" value="Mr. Wei Chen · wei@gztech.cn" />
          <Field label="Trade categories" value="Consumer Electronics, Accessories" />
          <Field label="Settlement preference" value="RMB · ICBC ••••3421" />
          <Field label="Years on Canta" value="3 years" />
          <Field label="Completed transactions" value="142" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Edit profile</Button>
          <Button size="sm" variant="outline">Settlement account</Button>
        </div>
      </Card>
      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-3">Verification & trust</div>
        <div className="space-y-2 text-sm">
          <Row icon={<ShieldCheck className="h-4 w-4 text-success" />} label="KYB verified" />
          <Row icon={<ShieldCheck className="h-4 w-4 text-success" />} label="Bank account verified" />
          <Row icon={<ShieldCheck className="h-4 w-4 text-success" />} label="Sanctions screen clear" />
          <Row icon={<Award className="h-4 w-4 text-accent" />} label="Top-rated supplier 2026" />
        </div>
        <div className="mt-4 p-3 rounded-lg bg-success/10 text-success text-xs">
          You're a verified Canta supplier. African buyers see your trust badges on every invoice.
        </div>
      </Card>
    </div>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-2">{icon} <span>{label}</span></div>;
}

function NewInvoiceDialog({ onClose }: { onClose: () => void }) {
  const [created, setCreated] = useState<{ ref: string; collection: string } | null>(null);
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{created ? "Invoice created" : "New buyer invoice"}</DialogTitle>
        {!created && <p className="text-xs text-muted-foreground">Issue an invoice to an African buyer. Funds will be secured in escrow and settled to you in your preferred currency.</p>}
      </DialogHeader>

      {!created ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <FF label="Buyer name"><Input placeholder="ABC Electronics" /></FF>
            <FF label="Buyer country">
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Nigeria","Ghana","Kenya","Senegal","South Africa","Côte d'Ivoire","Tanzania"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </FF>
            <FF label="Invoice amount"><Input type="number" placeholder="184000" /></FF>
            <FF label="Invoice currency">
              <Select defaultValue="USD"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["USD","EUR","RMB","AED","GBP"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </FF>
            <FF label="Settlement currency (you receive)">
              <Select defaultValue="RMB"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(["RMB","USD","AED","GBP","EUR"] as const).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </FF>
            <FF label="Due date"><Input type="date" /></FF>
            <FF label="Payment terms" wide><Input placeholder="30% deposit, 70% on Bill of Lading" /></FF>
          </div>
          <FF label="Goods description"><Textarea placeholder="Mixed consumer electronics, 240 cartons…" /></FF>
          <FF label="Attach documents">
            <div className="border border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
              <Upload className="h-5 w-5 mx-auto mb-1" /> Drag invoice, packing list, or BL here
            </div>
          </FF>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-primary" onClick={() => setCreated({ ref: `INV-CN-${Math.floor(7050 + Math.random() * 100)}`, collection: `CANTA-NGN-${Math.floor(8000 + Math.random() * 999)}-AB` })}>
              Create invoice
            </Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <Card className="p-4 bg-success/10 border-success/30">
            <div className="flex items-center gap-2 text-success font-semibold"><CheckCircle2 className="h-4 w-4" /> Invoice {created.ref} created</div>
            <p className="text-xs text-success/80 mt-1">Send the buyer payment instruction below — funds will be held in escrow until release.</p>
          </Card>

          <div className="p-4 rounded-lg border border-border bg-secondary/30">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">NGN Local Collection Account</div>
            <div className="flex items-center justify-between mt-1">
              <div className="font-mono text-sm font-semibold">{created.collection}</div>
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(created.collection); toast.success("Copied"); }}><Copy className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">Dedicated collection reference · Canta acts as collection agent</div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => toast.success("Sent to buyer")}>Send to buyer</Button>
            <Button className="bg-primary" onClick={onClose}>Done</Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  );
}

function FF({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function SupplierReportsPanel() {
  const reports = [
    { l: "Invoice register",          d: "All invoices, statuses and buyers", icon: FileText },
    { l: "Settlement report",         d: "Payouts to home currency with FX rates", icon: Banknote },
    { l: "Escrow activity",           d: "Milestones, releases and disputes", icon: Lock },
    { l: "Buyer reliability summary", d: "Average score, late payments, disputes", icon: TrendingUp },
    { l: "Documents log",             d: "Uploaded invoices, BLs, certificates", icon: Upload },
    { l: "Compliance pack",           d: "KYB, sanctions, audit trail", icon: ShieldCheck },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {reports.map((r) => (
        <Card key={r.l} className="p-4 shadow-card flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <r.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{r.l}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{r.d}</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success(`${r.l} · CSV exported`)}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast.success(`${r.l} · PDF exported`)}>PDF</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SupplierTeamPanel() {
  const team = [
    { name: "Wei Chen",        email: "wei@guangzhou-elec.cn",   role: "Supplier Owner",      status: "Active",  last: "2 min ago" },
    { name: "Mei Lin",         email: "mei@guangzhou-elec.cn",   role: "Supplier Admin",      status: "Active",  last: "1 hour ago" },
    { name: "Faruk Demir",     email: "faruk@istanbul-textile.tr", role: "Supplier Finance",  status: "Active",  last: "Today" },
    { name: "Hao Zhang",       email: "hao@guangzhou-elec.cn",   role: "Supplier Operations", status: "Active",  last: "Today" },
    { name: "Priya Nair",      email: "priya@mumbai-export.in",  role: "Sales Representative",status: "Active",  last: "Yesterday" },
    { name: "Ahmed Al-Sayed",  email: "ahmed@dubai-trade.ae",    role: "Settlement Manager",  status: "Active",  last: "2 days ago" },
    { name: "Lucia Wang",      email: "lucia@guangzhou-elec.cn", role: "Support Agent",       status: "Pending", last: "Never (invited)" },
  ];
  const tone: Record<string, string> = {
    Active:  "bg-success/15 text-success border-success/30",
    Pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  };
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="p-4 flex items-center justify-between flex-wrap gap-2 border-b border-border">
        <div>
          <div className="text-sm font-semibold">Supplier team</div>
          <div className="text-xs text-muted-foreground">Invite colleagues and assign supplier roles. Owners can manage everyone; finance and ops have scoped access.</div>
        </div>
        <Button size="sm" onClick={() => toast.success("Invite sent")}>
          <Plus className="h-4 w-4 mr-1.5" /> Invite user
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Last active</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {team.map((u) => (
              <tr key={u.email} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3"><Badge variant="outline" className={tone[u.status]}>{u.status}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{u.last}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => toast.success(`${u.name} · permissions updated`)}>Manage</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
