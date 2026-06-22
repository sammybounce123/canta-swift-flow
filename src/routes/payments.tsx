import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Receipt, Plus, Search, Filter, Download, ArrowRight, CheckCircle2,
  Clock, AlertCircle, Building2, Truck, FileText, Wallet, Link as LinkIcon,
} from "lucide-react";
import { fmtMoney } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/payments")({
  head: () => ({ meta: [{ title: "Payments — Canta" }] }),
  component: PaymentsPage,
});

type PayStatus = "Paid" | "Scheduled" | "Pending approval" | "Failed";
type Payment = {
  id: string; beneficiary: string; kind: "Supplier" | "Forwarder" | "Customs" | "Other";
  reference: string; amount: number; ccy: string; date: string; status: PayStatus;
  tradeFile?: string; shipment?: string;
};

const PAYMENTS: Payment[] = [
  { id: "PAY-9041", beneficiary: "Yiwu Fashion Co.",      kind: "Supplier",  reference: "INV-CN-7042", amount: 67_400,  ccy: "USD", date: "2026-06-18", status: "Paid",             tradeFile: "TR-2042", shipment: "SH-9012" },
  { id: "PAY-9040", beneficiary: "Guangzhou Electronics", kind: "Supplier",  reference: "INV-CN-7041", amount: 184_000, ccy: "USD", date: "2026-06-17", status: "Scheduled",        tradeFile: "TR-2031", shipment: "SH-9012" },
  { id: "PAY-9039", beneficiary: "ABC Freight Lagos",     kind: "Forwarder", reference: "FRT-4408",    amount: 12_800,  ccy: "USD", date: "2026-06-16", status: "Pending approval", shipment: "SH-9012" },
  { id: "PAY-9038", beneficiary: "Nigeria Customs",       kind: "Customs",   reference: "DUTY-2026-04",amount: 9_200,   ccy: "USD", date: "2026-06-14", status: "Paid",             shipment: "SH-8990" },
  { id: "PAY-9037", beneficiary: "Dubai Spare Parts",     kind: "Supplier",  reference: "INV-AE-7043", amount: 41_900,  ccy: "USD", date: "2026-06-12", status: "Failed",           tradeFile: "TR-2055" },
  { id: "PAY-9036", beneficiary: "Istanbul Textiles",     kind: "Supplier",  reference: "INV-TR-7045", amount: 96_400,  ccy: "EUR", date: "2026-06-10", status: "Paid",             tradeFile: "TR-2042" },
  { id: "PAY-9035", beneficiary: "Mombasa Clearing Co.",  kind: "Forwarder", reference: "CLR-2031",    amount: 3_400,   ccy: "USD", date: "2026-06-08", status: "Scheduled",        shipment: "SH-8990" },
];

function tone(s: PayStatus) {
  if (s === "Paid") return "bg-success/15 text-success border-success/30";
  if (s === "Scheduled") return "bg-primary/10 text-primary border-primary/20";
  if (s === "Pending approval") return "bg-amber-500/15 text-amber-700 border-amber-500/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

const KIND_ICON: Record<Payment["kind"], typeof Building2> = {
  Supplier: Building2,
  Forwarder: Truck,
  Customs: FileText,
  Other: Wallet,
};

function PaymentsPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | PayStatus>("all");
  const [kind, setKind] = useState<"All" | Payment["kind"]>("All");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => PAYMENTS.filter((p) =>
    (tab === "all" || p.status === tab) &&
    (kind === "All" || p.kind === kind) &&
    (!q || p.beneficiary.toLowerCase().includes(q.toLowerCase()) || p.reference.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()))
  ), [q, tab, kind]);

  const stats = useMemo(() => {
    const paid = PAYMENTS.filter((p) => p.status === "Paid").reduce((a, b) => a + b.amount, 0);
    const scheduled = PAYMENTS.filter((p) => p.status === "Scheduled").reduce((a, b) => a + b.amount, 0);
    const pending = PAYMENTS.filter((p) => p.status === "Pending approval").reduce((a, b) => a + b.amount, 0);
    const failed = PAYMENTS.filter((p) => p.status === "Failed").length;
    return { paid, scheduled, pending, failed };
  }, []);

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary shrink-0" /> Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Pay suppliers, forwarders and customs. Track every payment against its trade file or shipment.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => toast.success("Exported payments report")}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1.5" /> New payment</Button>
            </DialogTrigger>
            <NewPaymentDialog onClose={() => setOpen(false)} />
          </Dialog>
        </div>
      </header>

      <Card className="p-5 shadow-card border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center shrink-0">
              <LinkIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Need to get paid? Create a payment link.</div>
              <div className="text-xs text-muted-foreground mt-1 max-w-xl">
                Share a secure Canta link with any customer — collect locally, settle globally. New links appear under your Payment Links tab.
              </div>
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/payment-links">Create payment link <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </Card>


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Paid (last 30 days)" value={fmtMoney(stats.paid, "USD")} icon={<CheckCircle2 className="h-3.5 w-3.5 text-success" />} tone="text-success" />
        <Stat label="Scheduled" value={fmtMoney(stats.scheduled, "USD")} icon={<Clock className="h-3.5 w-3.5 text-primary" />} />
        <Stat label="Pending approval" value={fmtMoney(stats.pending, "USD")} icon={<AlertCircle className="h-3.5 w-3.5 text-amber-600" />} tone="text-amber-600" />
        <Stat label="Failed" value={String(stats.failed)} icon={<AlertCircle className="h-3.5 w-3.5 text-destructive" />} tone={stats.failed ? "text-destructive" : ""} />
      </div>

      <Card className="p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by beneficiary, reference or payment ID..." className="pl-9" />
          </div>
          <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
            <SelectTrigger className="w-full sm:w-48"><Filter className="h-3.5 w-3.5 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["All", "Supplier", "Forwarder", "Customs", "Other"] as const).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Paid">Paid</TabsTrigger>
          <TabsTrigger value="Scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="Pending approval">Pending approval</TabsTrigger>
          <TabsTrigger value="Failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {/* Desktop table */}
          <Card className="hidden md:block shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Beneficiary</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Linked to</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const Icon = KIND_ICON[p.kind];
                    return (
                      <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium truncate">{p.beneficiary}</div>
                              <div className="text-[11px] text-muted-foreground">{p.kind}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {p.tradeFile && <div>Trade: {p.tradeFile}</div>}
                          {p.shipment && <div>Shipment: {p.shipment}</div>}
                          {!p.tradeFile && !p.shipment && <span>—</span>}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(p.amount, p.ccy)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${tone(p.status)}`}>{p.status}</Badge></td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No payments match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((p) => {
              const Icon = KIND_ICON[p.kind];
              return (
                <Card key={p.id} className="p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="flex items-start gap-2 min-w-0">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{p.beneficiary}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{p.id} · {p.reference}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold tabular-nums text-sm">{fmtMoney(p.amount, p.ccy)}</div>
                      <div className="text-[11px] text-muted-foreground">{p.date}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{p.kind}</Badge>
                    {p.tradeFile && <Badge variant="outline" className="text-[10px]">Trade {p.tradeFile}</Badge>}
                    {p.shipment && <Badge variant="outline" className="text-[10px]">{p.shipment}</Badge>}
                    <Badge variant="outline" className={`text-[10px] ${tone(p.status)} ml-auto`}>{p.status}</Badge>
                  </div>
                </Card>
              );
            })}
            {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No payments match your filters.</div>}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="p-5 shadow-card border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Need FX-protected payouts?</div>
            <div className="text-xs text-muted-foreground mt-1 max-w-xl">Lock your rate before paying suppliers in RMB, USD, EUR or AED. Reduce surprises on landed cost.</div>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/fx">Open FX Conversion <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone?: string }) {
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className={`text-xl font-semibold tabular-nums mt-2 ${tone ?? ""}`}>{value}</div>
    </Card>
  );
}

function NewPaymentDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>New payment</DialogTitle></DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><Label>Beneficiary</Label><Input placeholder="Yiwu Fashion Co." /></div>
        <div>
          <Label>Type</Label>
          <Select defaultValue="Supplier">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["Supplier", "Forwarder", "Customs", "Other"] as const).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Currency</Label>
          <Select defaultValue="USD">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["USD","EUR","GBP","RMB","AED"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Amount</Label><Input type="number" placeholder="12500" /></div>
        <div><Label>Reference</Label><Input placeholder="INV-CN-7042" /></div>
        <div className="sm:col-span-2"><Label>Notes</Label><Textarea placeholder="Trade file or shipment notes" /></div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { onClose(); toast.success("Payment submitted for approval"); }}>Submit</Button>
      </DialogFooter>
    </DialogContent>
  );
}
