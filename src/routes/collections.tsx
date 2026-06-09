import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { collections, fmtMoney } from "@/lib/mock";
import { WorkspaceCardsPanel } from "@/components/CardsPanel";
import {
  Globe, Plus, Link as LinkIcon, GraduationCap, Home, Stethoscope, Plane, ShoppingBag, Receipt,
  Banknote, TrendingUp, AlertTriangle, Users, FileText, ArrowRight, Copy, Download,
  Search, ShieldCheck, Briefcase, CheckCircle2, XCircle, Clock, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/collections")({
  head: () => ({ meta: [{ title: "Global Collections — Canta" }] }),
  component: Collections,
});

// ---------- Mock data scoped to module ----------
type SettlementCcy = "USD" | "GBP" | "EUR" | "RMB" | "AED" | "CAD";

const templates = [
  { i: GraduationCap, l: "Tuition Collection", d: "Universities & schools", purpose: "Tuition payment" },
  { i: Home, l: "Property Payment", d: "Rent, deposits, mortgage", purpose: "Property payment" },
  { i: Stethoscope, l: "Medical Payment", d: "Hospitals & clinics", purpose: "Medical payment" },
  { i: Receipt, l: "Supplier Invoice", d: "B2B settlements", purpose: "Supplier invoice" },
  { i: Plane, l: "Travel Payment", d: "Airlines & agencies", purpose: "Travel payment" },
  { i: ShoppingBag, l: "E-commerce Order", d: "Online merchants", purpose: "E-commerce order" },
  { i: Briefcase, l: "Professional Service", d: "Consultancy & legal", purpose: "Professional service" },
];

const paymentLinks = [
  { id: "PL-7821", customer: "Adaeze Okafor", purpose: "Tuition · Spring '26", amount: 8500, settleCcy: "USD", status: "Active", clicks: 14, paid: false, created: "2026-06-02", due: "2026-06-20" },
  { id: "PL-7820", customer: "Bayo Logistics Ltd", purpose: "Container deposit", amount: 12_000, settleCcy: "USD", status: "Paid", clicks: 3, paid: true, created: "2026-06-01", due: "2026-06-10" },
  { id: "PL-7818", customer: "Lagos Med Clinic", purpose: "Equipment invoice", amount: 4200, settleCcy: "EUR", status: "Active", clicks: 7, paid: false, created: "2026-05-30", due: "2026-06-15" },
  { id: "PL-7811", customer: "Chinedu Eze", purpose: "Flight booking", amount: 1850, settleCcy: "GBP", status: "Expired", clicks: 2, paid: false, created: "2026-05-22", due: "2026-05-29" },
  { id: "PL-7805", customer: "Sino Trade Co.", purpose: "Bulk order #882", amount: 56_000, settleCcy: "RMB", status: "Active", clicks: 21, paid: false, created: "2026-05-20", due: "2026-06-30" },
];

const invoices = [
  { id: "INV-2041", payer: "Adaeze Okafor",  type: "Tuition payment",      amount: 8500, ccy: "USD", status: "Sent",      due: "2026-06-20" },
  { id: "INV-2039", payer: "Tunde Bakare",   type: "Property payment",     amount: 24_000, ccy: "USD", status: "Paid",      due: "2026-06-01" },
  { id: "INV-2034", payer: "Lagos Med Clinic", type: "Medical payment",    amount: 4200, ccy: "EUR", status: "Overdue",   due: "2026-05-30" },
  { id: "INV-2030", payer: "Sino Trade Co.", type: "Supplier invoice",     amount: 56_000, ccy: "RMB", status: "Sent",      due: "2026-06-30" },
  { id: "INV-2028", payer: "Chinedu Eze",    type: "Travel payment",       amount: 1850, ccy: "GBP", status: "Cancelled", due: "2026-05-29" },
  { id: "INV-2024", payer: "Buyme Online",   type: "E-commerce order",     amount: 320,  ccy: "USD", status: "Paid",      due: "2026-05-25" },
];

const payers = [
  { name: "Adaeze Okafor",     country: "🇳🇬 Nigeria", history: 4, reference: "STU-2241", status: "Active",   level: "Verified" },
  { name: "Tunde Bakare",      country: "🇳🇬 Nigeria", history: 12, reference: "PROP-118", status: "Active",   level: "Enhanced" },
  { name: "Lagos Med Clinic",  country: "🇳🇬 Nigeria", history: 6, reference: "MED-074",  status: "Active",   level: "Verified" },
  { name: "Sino Trade Co.",    country: "🇨🇳 China",   history: 9, reference: "SUP-3320", status: "Active",   level: "Enhanced" },
  { name: "Chinedu Eze",       country: "🇳🇬 Nigeria", history: 2, reference: "TRV-0091", status: "Inactive", level: "Basic" },
  { name: "Buyme Online",      country: "🇳🇬 Nigeria", history: 18, reference: "EC-7741", status: "Active",   level: "Verified" },
];

const settlements = [
  { id: "ST-9012", collected: 18_400_000, ccy: "NGN", fees: 92_000, fx: 1612, settleCcy: "USD", settleAmt: 11_336, expected: "2026-06-12", status: "Scheduled" },
  { id: "ST-9008", collected: 12_900_000, ccy: "NGN", fees: 64_500, fx: 1610, settleCcy: "USD", settleAmt: 7960,   expected: "2026-06-10", status: "Settled"   },
  { id: "ST-9005", collected: 6_800_000,  ccy: "NGN", fees: 34_000, fx: 1820, settleCcy: "EUR", settleAmt: 3717,   expected: "2026-06-09", status: "Settled"   },
  { id: "ST-9001", collected: 22_500_000, ccy: "NGN", fees: 112_500, fx: 220, settleCcy: "RMB", settleAmt: 101_750, expected: "2026-06-08", status: "Processing" },
];

const reconciliation = [
  { id: "REC-501", payer: "Adaeze Okafor",    invoice: "INV-2041", expected: 8500,  received: 8500,  date: "2026-06-04", status: "Matched"      },
  { id: "REC-500", payer: "Tunde Bakare",     invoice: "INV-2039", expected: 24_000, received: 24_000, date: "2026-06-01", status: "Matched"      },
  { id: "REC-499", payer: "Sino Trade Co.",   invoice: "INV-2030", expected: 56_000, received: 55_400, date: "2026-06-03", status: "Underpaid"    },
  { id: "REC-498", payer: "Unknown Sender",   invoice: "—",        expected: 0,      received: 1200,  date: "2026-06-03", status: "Unmatched"    },
  { id: "REC-497", payer: "Lagos Med Clinic", invoice: "INV-2034", expected: 4200,  received: 4200,  date: "2026-05-31", status: "Matched"      },
];

const topPayers = [
  { name: "Sino Trade Co.", total: 56_000, ccy: "RMB" },
  { name: "Tunde Bakare",   total: 24_000, ccy: "USD" },
  { name: "Adaeze Okafor",  total: 8500,   ccy: "USD" },
];

function statusTone(s: string) {
  const map: Record<string, string> = {
    Active:    "bg-success/15 text-success border-success/30",
    Paid:      "bg-success/15 text-success border-success/30",
    Settled:   "bg-success/15 text-success border-success/30",
    Matched:   "bg-success/15 text-success border-success/30",
    Sent:      "bg-primary/15 text-primary border-primary/30",
    Scheduled: "bg-primary/15 text-primary border-primary/30",
    Processing:"bg-primary/15 text-primary border-primary/30",
    Overdue:   "bg-destructive/15 text-destructive border-destructive/30",
    Failed:    "bg-destructive/15 text-destructive border-destructive/30",
    Cancelled: "bg-muted text-muted-foreground border-border",
    Expired:   "bg-muted text-muted-foreground border-border",
    Inactive:  "bg-muted text-muted-foreground border-border",
    Unmatched: "bg-destructive/15 text-destructive border-destructive/30",
    Underpaid: "bg-warning/15 text-warning border-warning/30",
  };
  return map[s] ?? "";
}

function KPI({ label, value, sub, tone, icon: Icon }: { label: string; value: string; sub?: string; tone?: string; icon: any }) {
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={`h-7 w-7 rounded-lg grid place-items-center ${tone ?? "bg-primary/10 text-primary"}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="text-xl font-semibold mt-2 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </Card>
  );
}

// ---------- Dialogs ----------
function NewPaymentLinkDialog() {
  const [open, setOpen] = useState(false);
  const [tpl, setTpl] = useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><LinkIcon className="h-4 w-4 mr-1.5" /> New Payment Link</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create payment link</DialogTitle>
          <DialogDescription>Customer pays in NGN locally. You receive in your chosen currency.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Use case template</Label>
            <Select onValueChange={setTpl}>
              <SelectTrigger><SelectValue placeholder="Select a template (optional)" /></SelectTrigger>
              <SelectContent>
                {templates.map(t => <SelectItem key={t.l} value={t.l}>{t.l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Customer name</Label><Input placeholder="Jane Adewale" /></div>
          <div><Label>Email or phone</Label><Input placeholder="jane@email.com" /></div>
          <div><Label>Amount</Label><Input type="number" placeholder="8500" /></div>
          <div>
            <Label>Collection currency</Label>
            <Select defaultValue="NGN"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="NGN">NGN (Naira)</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label>Settlement currency</Label>
            <Select defaultValue="USD"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["USD","GBP","EUR","RMB","AED","CAD"] as SettlementCcy[]).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Reference</Label><Input placeholder="STU-2241" /></div>
          <div className="col-span-2"><Label>Payment purpose</Label><Input placeholder={tpl ?? "e.g. Spring 2026 tuition"} /></div>
          <div><Label>Due date</Label><Input type="date" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { setOpen(false); toast.success("Payment link created and copied to clipboard"); }}>
            Create & copy link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewInvoiceDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> New Invoice</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
          <DialogDescription>Sent via email and WhatsApp with a local NGN payment instruction.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Invoice type</Label>
            <Select defaultValue="Tuition payment">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Tuition payment","Property payment","Medical payment","Supplier invoice","Travel payment","E-commerce order","Professional service"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Payer name</Label><Input placeholder="Jane Adewale" /></div>
          <div><Label>Payer email</Label><Input placeholder="jane@email.com" /></div>
          <div><Label>Amount</Label><Input type="number" placeholder="8500" /></div>
          <div>
            <Label>Settlement currency</Label>
            <Select defaultValue="USD"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["USD","GBP","EUR","RMB","AED","CAD"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Reference</Label><Input placeholder="INV-2042" /></div>
          <div><Label>Due date</Label><Input type="date" /></div>
          <div className="col-span-2"><Label>Notes</Label><Textarea placeholder="Description of goods or services" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { setOpen(false); toast.success("Invoice created & sent to payer"); }}>Send invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Page ----------
function Collections() {
  const [q, setQ] = useState("");

  const totals = useMemo(() => {
    const total = 842_150;
    const pending = 48_920;
    const settled = 612_300;
    const active = paymentLinks.filter(p => p.status === "Active").length;
    const failed = 3;
    const recon = reconciliation.filter(r => r.status !== "Matched").length;
    return { total, pending, settled, active, failed, recon };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Global Merchant Workspace
          </div>
          <h1 className="text-2xl font-semibold mt-1">Global Collections</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Local African collections and global settlement for businesses selling to Africa —
            universities, hospitals, airlines, property, e-commerce, and global suppliers.
          </p>
        </div>
        <div className="flex gap-2">
          <NewPaymentLinkDialog />
          <NewInvoiceDialog />
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPI label="Total Collections" value={`$${totals.total.toLocaleString()}`} sub="Last 30 days" icon={Banknote} />
        <KPI label="Pending Settlement" value={`$${totals.pending.toLocaleString()}`} sub="In transit" icon={Clock} tone="bg-warning/10 text-warning" />
        <KPI label="Settled Amount" value={`$${totals.settled.toLocaleString()}`} sub="This month" icon={CheckCircle2} tone="bg-success/10 text-success" />
        <KPI label="Active Payment Links" value={String(totals.active)} sub="Open & accepting" icon={LinkIcon} />
        <KPI label="Failed Payments" value={String(totals.failed)} sub="Needs retry" icon={XCircle} tone="bg-destructive/10 text-destructive" />
        <KPI label="Top Payer" value={topPayers[0].name.split(" ")[0]} sub={fmtMoney(topPayers[0].total, topPayers[0].ccy)} icon={TrendingUp} />
        <KPI label="Reconciliation Issues" value={String(totals.recon)} sub="Unmatched / underpaid" icon={AlertTriangle} tone="bg-warning/10 text-warning" />
      </div>

      {/* Templates */}
      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-3 flex items-center gap-2"><Globe className="h-4 w-4" /> Start with a use-case template</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {templates.map((t) => (
            <TemplateFlowButton key={t.l} template={t} />
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="links" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="links">Payment Links</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payers">Payers</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
          <TabsTrigger value="recon">Reconciliation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* PAYMENT LINKS */}
        <TabsContent value="links">
          <Card className="shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm font-semibold">Payment links</div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input placeholder="Search links..." className="pl-8 h-9 w-56" value={q} onChange={e => setQ(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                  <th className="px-4 py-3">Link ID</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Settle in</th><th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Due</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th>
                </tr></thead>
                <tbody>
                  {paymentLinks.filter(p => !q || p.customer.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase())).map(p => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                      <td className="px-4 py-3">{p.customer}</td>
                      <td className="px-4 py-3">{p.purpose}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{p.settleCcy}</Badge></td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(p.amount, p.settleCcy)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.due}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${statusTone(p.status)}`}>{p.status}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => toast.success("Link copied")}><Copy className="h-3.5 w-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* INVOICES */}
        <TabsContent value="invoices">
          <Card className="shadow-card overflow-hidden">
            <div className="p-4 border-b border-border text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" /> Invoices
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                  <th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Payer</th><th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Status</th><th className="px-4 py-3"></th>
                </tr></thead>
                <tbody>
                  {invoices.map(i => (
                    <tr key={i.id} className="border-t border-border">
                      <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                      <td className="px-4 py-3">{i.payer}</td>
                      <td className="px-4 py-3">{i.type}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(i.amount, i.ccy)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.due}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${statusTone(i.status)}`}>{i.status}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => toast.success(`${i.id} resent`)}><ArrowRight className="h-3.5 w-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* PAYERS */}
        <TabsContent value="payers">
          <Card className="shadow-card overflow-hidden">
            <div className="p-4 border-b border-border text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" /> Payers
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                  <th className="px-4 py-3">Payer</th><th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Reference</th><th className="px-4 py-3 text-right">Payments</th>
                  <th className="px-4 py-3">Verification</th><th className="px-4 py-3">Status</th>
                </tr></thead>
                <tbody>
                  {payers.map(p => (
                    <tr key={p.name} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3">{p.country}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{p.history}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <ShieldCheck className="h-3 w-3" />{p.level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${statusTone(p.status)}`}>{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* SETTLEMENTS */}
        <TabsContent value="settlements">
          <Card className="shadow-card overflow-hidden">
            <div className="p-4 border-b border-border text-sm font-semibold">Settlements</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                  <th className="px-4 py-3">ID</th><th className="px-4 py-3 text-right">Collected (NGN)</th>
                  <th className="px-4 py-3 text-right">Fees</th><th className="px-4 py-3">FX Rate</th>
                  <th className="px-4 py-3">Settle Ccy</th><th className="px-4 py-3 text-right">Settle Amount</th>
                  <th className="px-4 py-3">Expected</th><th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr></thead>
                <tbody>
                  {settlements.map(s => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmtMoney(s.collected, "NGN")}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{fmtMoney(s.fees, "NGN")}</td>
                      <td className="px-4 py-3 tabular-nums">{s.fx}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{s.settleCcy}</Badge></td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(s.settleAmt, s.settleCcy === "RMB" ? "CNY" : s.settleCcy)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.expected}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${statusTone(s.status)}`}>{s.status}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => toast.success("Receipt downloaded")}><Download className="h-3.5 w-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* RECONCILIATION */}
        <TabsContent value="recon">
          <Card className="shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Reconciliation</div>
              <Button size="sm" variant="outline" onClick={() => toast.success("Auto-match run complete")}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Run auto-match
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                  <th className="px-4 py-3">Payer</th><th className="px-4 py-3">Invoice / Ref</th>
                  <th className="px-4 py-3 text-right">Expected</th><th className="px-4 py-3 text-right">Received</th>
                  <th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th>
                </tr></thead>
                <tbody>
                  {reconciliation.map(r => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-3">{r.payer}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.invoice}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.expected ? fmtMoney(r.expected, "USD") : "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(r.received, "USD")}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${statusTone(r.status)}`}>{r.status}</Badge></td>
                      <td className="px-4 py-3">
                        {r.status === "Matched" ? (
                          <span className="text-xs text-muted-foreground">No action</span>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => toast.success("Investigation opened")}>
                            {r.status === "Unmatched" ? "Match manually" : "Resolve"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { l: "Collection Report",     d: "All inbound NGN collections, by date and payer." },
              { l: "Settlement Report",     d: "Global payouts with FX rates and receipts." },
              { l: "Payer Report",          d: "Activity & verification status by payer." },
              { l: "Invoice Report",        d: "Sent, paid, overdue, cancelled invoices." },
              { l: "Reconciliation Report", d: "Matched, unmatched, and underpaid items." },
              { l: "Failed Payments Report",d: "Retry-eligible and declined transactions." },
            ].map(r => (
              <Card key={r.l} className="p-4 shadow-card flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{r.l}</div>
                  <div className="text-xs text-muted-foreground mt-1">{r.d}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.success(`${r.l} downloading`)}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent collections (kept) */}
      <Card className="shadow-card overflow-hidden">
        <div className="p-4 border-b border-border text-sm font-semibold">Recent collections</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-4 py-3">ID</th><th className="px-4 py-3">Payer</th><th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Status</th>
            </tr></thead>
            <tbody>
              {collections.map(c => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-4 py-3">{c.payer}</td>
                  <td className="px-4 py-3">{c.purpose}</td>
                  <td className="px-4 py-3">{c.date}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(c.amount, c.ccy)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <WorkspaceCardsPanel
        title="Merchant Staff Cards"
        subtitle="Cards for regional offices, admissions reps, marketing, events and staff travel."
        categories={["Staff expense", "Regional office", "Marketing", "Admissions rep", "Travel", "Events"]}
        pendingApprovals={2}
        receiptsMissing={6}
        groupedLabel="region"
        groupedSpend={[
          { label: "Lagos",    amount: 9_800 },
          { label: "Accra",    amount: 6_200 },
          { label: "Nairobi",  amount: 4_100 },
          { label: "London",   amount: 12_400 },
        ]}
        cards={[
          { id: "C1", label: "London Admissions",   holder: "Aisha B.",  last4: "8821", status: "Active", monthlySpend: 4400, limit: 8000,  category: "Admissions rep" },
          { id: "C2", label: "Accra Office",        holder: "Regional",  last4: "5512", status: "Active", monthlySpend: 2100, limit: 5000,  category: "Regional office" },
          { id: "C3", label: "Marketing Events",    holder: "Marketing", last4: "3309", status: "Active", monthlySpend: 3800, limit: 10000, category: "Events" },
          { id: "C4", label: "Staff Travel",        holder: "HR Team",   last4: "1144", status: "Active", monthlySpend: 1900, limit: 5000,  category: "Travel" },
          { id: "C5", label: "Nairobi Field Ops",   holder: "Regional",  last4: "7702", status: "Frozen", monthlySpend: 620,  limit: 2000,  category: "Regional office" },
          { id: "C6", label: "Meta Ads — Recruit",  holder: "Marketing", last4: "9905", status: "Active", monthlySpend: 2700, limit: 6000,  category: "Marketing" },
        ]}
      />
    </div>
  );
}

function TemplateFlowButton({ template }: { template: typeof templates[number] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [payer, setPayer] = useState("");
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [ccy, setCcy] = useState<SettlementCcy>("USD");
  // University-specific
  const [studentId, setStudentId] = useState("");
  const [programme, setProgramme] = useState("");
  const [term, setTerm] = useState("");
  const isTuition = template.l === "Tuition Collection";
  const Icon = template.i;
  const totalSteps = 6;

  function reset() {
    setStep(1); setPayer(""); setEmail(""); setReference(""); setAmount(""); setCcy("USD");
    setStudentId(""); setProgramme(""); setTerm("");
  }
  function finish() {
    toast.success(`${template.l} link created for ${payer || "payer"}`);
    setOpen(false); reset();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <button className="text-left p-4 rounded-xl border border-border hover:border-accent hover:shadow-card transition">
          <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center"><Icon className="h-4 w-4 text-primary" /></div>
          <div className="text-sm font-semibold mt-2">{template.l}</div>
          <div className="text-[11px] text-muted-foreground">{template.d}</div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /> {template.l} — guided flow</DialogTitle>
          <DialogDescription>Step {step} of {totalSteps}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {step === 1 && (
            <>
              <Label>{isTuition ? "Student name" : "Payer name"}</Label>
              <Input value={payer} onChange={(e) => setPayer(e.target.value)} placeholder={isTuition ? "e.g. Adaeze Okafor" : "e.g. Adaeze Okafor"} />
              <Label>{isTuition ? "Parent / payer email or phone" : "Payer email or phone"}</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="payer@example.com" />
              {isTuition && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Student ID / Admission no.</Label>
                      <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. ADM-2026-0421" />
                    </div>
                    <div>
                      <Label>Term / Session</Label>
                      <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="e.g. Spring 2026" />
                    </div>
                  </div>
                  <Label>Programme</Label>
                  <Input value={programme} onChange={(e) => setProgramme(e.target.value)} placeholder="e.g. MSc Computer Science" />
                </>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <Label>{isTuition ? "Tuition invoice / payment reference" : "Invoice / reference"}</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder={`${template.purpose} ref`} />
              <Label>Amount</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </>
          )}
          {step === 3 && (
            <div className="p-4 rounded-lg bg-secondary/40 border border-border text-sm space-y-2">
              <div className="font-semibold">NGN collection instruction</div>
              <div className="text-muted-foreground">Share this with the payer in Nigeria.</div>
              <div className="mt-2 p-3 rounded-lg bg-card border border-border font-mono text-xs">
                Bank: Canta Collections (Wema)<br />
                Account: 0123456789<br />
                Reference: <span className="text-primary">{reference || "AUTO-REF"}</span>
              </div>
            </div>
          )}
          {step === 4 && (
            <>
              <Label>Settlement currency</Label>
              <Select value={ccy} onValueChange={(v) => setCcy(v as SettlementCcy)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["USD", "GBP", "EUR", "RMB", "AED", "CAD"] as SettlementCcy[]).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Funds collected in NGN, settled to your {ccy} wallet at the live FX rate.</div>
            </>
          )}
          {step === 5 && (
            <div className="p-4 rounded-lg bg-secondary/40 border border-border text-sm">
              <div className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Reconciliation report</div>
              <div className="text-xs text-muted-foreground mt-1">A matching report is generated automatically when NGN funds arrive — matched against {reference || "AUTO-REF"}.</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Payer:</span> {payer || "—"}</div>
                <div><span className="text-muted-foreground">Reference:</span> {reference || "AUTO-REF"}</div>
                <div><span className="text-muted-foreground">Amount:</span> {amount || "0.00"} {ccy}</div>
                <div><span className="text-muted-foreground">Settle to:</span> {ccy} wallet</div>
              </div>
            </div>
          )}
          {step === 6 && (
            <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-sm">
              <div className="font-semibold text-success flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Settlement status</div>
              <div className="mt-2 text-xs">Once payer funds arrive, settlement to your {ccy} wallet is scheduled <strong>T+1</strong>. You and the payer both receive a confirmation receipt.</div>
            </div>
          )}
        </div>
        <DialogFooter>
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < totalSteps && <Button onClick={() => setStep(step + 1)}>Next</Button>}
          {step === totalSteps && <Button onClick={finish}>Create collection</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
