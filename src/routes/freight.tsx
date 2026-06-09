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
import { shipments, importers, freightInvoices, monthlyShipmentVolume, shippingLines, fmtMoney, type Shipment, type FreightInvoice } from "@/lib/mock";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WorkspaceCardsPanel } from "@/components/CardsPanel";
import { Truck, Plus, MessageCircle, FileText, DollarSign, Users as UsersIcon, AlertTriangle, Ship, Eye, Upload, CheckCircle2, Clock, TrendingUp, BarChart3, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/freight")({
  head: () => ({ meta: [{ title: "Freight Forwarder Workspace — Canta" }] }),
  component: Freight,
});

const STAGES: Shipment["status"][] = ["Booked", "At Origin", "Loaded", "On Vessel", "Arrived", "Customs", "Released", "Delivered"];

const DOC_TYPES = [
  "Supplier Invoice", "Packing List", "Bill of Lading",
  "Freight Invoice", "Customs Documents", "Delivery Note",
];

function Freight() {
  const [tab, setTab] = useState("overview");
  const [createOpen, setCreateOpen] = useState(false);
  const [waCustomer, setWaCustomer] = useState<typeof importers[number] | null>(null);
  const [waShipment, setWaShipment] = useState<Shipment | null>(null);

  const stats = useMemo(() => {
    const active = shipments.filter((s) => !["Delivered", "Released"].includes(s.status)).length;
    const delayed = shipments.filter((s) => s.status === "Delayed").length;
    const arrivingWeek = shipments.filter((s) => {
      const eta = new Date(s.eta).getTime();
      const now = Date.now();
      return eta >= now && eta - now <= 7 * 86400000;
    }).length;
    const outstanding = freightInvoices.filter((i) => i.status !== "Paid").reduce((a, b) => a + b.amount, 0);
    const monthlyVol = monthlyShipmentVolume[monthlyShipmentVolume.length - 1].count;
    const monthlyRev = monthlyShipmentVolume[monthlyShipmentVolume.length - 1].revenue;
    return { active, delayed, arrivingWeek, outstanding, monthlyVol, monthlyRev };
  }, []);

  const kpis = [
    { l: "Active shipments", v: String(stats.active), icon: Truck, tone: "" },
    { l: "Arriving this week", v: String(stats.arrivingWeek), icon: Clock, tone: "" },
    { l: "Delayed shipments", v: String(stats.delayed), icon: AlertTriangle, tone: "text-destructive" },
    { l: "Customers", v: String(importers.length), icon: UsersIcon, tone: "" },
    { l: "Pending documents", v: "7", icon: FileText, tone: "text-amber-600" },
    { l: "Outstanding invoices", v: fmtMoney(stats.outstanding, "USD"), icon: DollarSign, tone: "text-destructive" },
    { l: "Monthly shipment volume", v: String(stats.monthlyVol), icon: Ship, tone: "" },
    { l: "Monthly revenue", v: fmtMoney(stats.monthlyRev, "USD"), icon: TrendingUp, tone: "text-success" },
  ];

  // What needs attention today
  const needsAttention = useMemo(() => {
    const items: { kind: string; label: string; sub: string; tone: string; onClick?: () => void }[] = [];
    shipments.filter((s) => s.status === "Delayed").forEach((s) => items.push({
      kind: "Delay", label: `${s.shipmentNumber} delayed`, sub: `${s.importer} · ETA ${s.eta}`, tone: "bg-destructive/10 text-destructive border-destructive/20",
      onClick: () => { setWaShipment(s); },
    }));
    freightInvoices.filter((i) => i.status === "Overdue").forEach((i) => items.push({
      kind: "Overdue", label: `${i.id} overdue`, sub: `${i.customer} · ${fmtMoney(i.amount, i.ccy)}`, tone: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    }));
    shipments.filter((s) => s.status === "Customs").forEach((s) => items.push({
      kind: "Clearing", label: `${s.shipmentNumber} at customs`, sub: `${s.importer} · needs clearing follow-up`, tone: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    }));
    return items.slice(0, 6);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Freight Forwarder Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">What shipments need your attention today?</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> Create Shipment</Button></DialogTrigger>
            <CreateShipmentDialog onClose={() => setCreateOpen(false)} />
          </Dialog>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="pipeline">Shipment Pipeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Updates</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-5">
          <Card className="p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">Needs your attention today</div>
                <div className="text-xs text-muted-foreground">Delays, clearing actions and overdue invoices</div>
              </div>
              <Badge variant="outline" className="text-[10px]">{needsAttention.length} items</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {needsAttention.map((a, i) => (
                <button key={i} onClick={a.onClick} className={`text-left p-3 rounded-lg border ${a.tone} hover:opacity-90 transition`}>
                  <div className="text-[10px] uppercase tracking-widest">{a.kind}</div>
                  <div className="text-sm font-semibold mt-1">{a.label}</div>
                  <div className="text-xs opacity-80 mt-0.5">{a.sub}</div>
                </button>
              ))}
              {needsAttention.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center col-span-full">All clear — no urgent items.</div>}
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-5">
            <Card className="p-5 shadow-card">
              <div className="text-sm font-semibold mb-3">Monthly shipment volume</div>
              <SparkBars data={monthlyShipmentVolume.map((m) => ({ label: m.m, value: m.count }))} />
            </Card>
            <Card className="p-5 shadow-card">
              <div className="text-sm font-semibold mb-3">Monthly revenue (USD)</div>
              <SparkBars data={monthlyShipmentVolume.map((m) => ({ label: m.m, value: m.revenue }))} tone="success" />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <CustomersTable onWhatsApp={setWaCustomer} onCreate={() => setCreateOpen(true)} />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <PipelineBoard />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentsManager />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <InvoicesTable />
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6 space-y-5">
          <BroadcastPanel />
          <WhatsAppPanel onCompose={(s) => setWaShipment(s)} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportsPanel />
        </TabsContent>
      </Tabs>

      {/* Cards panel */}
      <WorkspaceCardsPanel
        title="Freight Cards"
        subtitle="Cards for operations staff, port expenses, warehouse, customer support and branch routes."
        categories={["Operations", "Port expense", "Travel", "Warehouse", "Customer support", "Branch/Route"]}
        pendingApprovals={1}
        receiptsMissing={4}
        groupedLabel="branch / route"
        groupedSpend={[
          { label: "Apapa Port",   amount: 14_200 },
          { label: "Tin Can",      amount: 11_800 },
          { label: "Tema, Ghana",  amount: 6_400 },
          { label: "Dubai Hub",    amount: 3_900 },
        ]}
        cards={[
          { id: "F1", label: "Apapa Port Ops",     holder: "Femi A.",  last4: "5510", status: "Active", monthlySpend: 5400, limit: 12000, category: "Port expense" },
          { id: "F2", label: "Warehouse Lagos",    holder: "Warehouse",last4: "3382", status: "Active", monthlySpend: 1820, limit: 5000,  category: "Warehouse" },
          { id: "F3", label: "Customer Support",   holder: "Support",  last4: "7741", status: "Active", monthlySpend: 480,  limit: 2000,  category: "Customer support" },
          { id: "F4", label: "Shipment SH-9012",   holder: "Ops Team", last4: "1124", status: "Active", monthlySpend: 3300, limit: 8000,  category: "Operations", linked: "Shenzhen → Lagos" },
          { id: "F5", label: "Dubai Hub Travel",   holder: "Adaeze O.",last4: "9920", status: "Active", monthlySpend: 1750, limit: 4000,  category: "Travel" },
          { id: "F6", label: "Tin Can Clearing",   holder: "Clearing", last4: "6603", status: "Frozen", monthlySpend: 920,  limit: 3000,  category: "Port expense" },
        ]}
      />

      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold">Spend by staff</div>
        <div className="text-xs text-muted-foreground mb-4">Top freight cardholders this month · USD</div>
        <div className="space-y-3">
          {[
            { name: "Femi Adeyemi",  role: "Operations Manager · Apapa",  amount: 5_400, limit: 12_000 },
            { name: "Ops Team",      role: "Shipment SH-9012",             amount: 3_300, limit: 8_000 },
            { name: "Warehouse",     role: "Lagos Warehouse",              amount: 1_820, limit: 5_000 },
            { name: "Adaeze O.",     role: "Dubai Hub Travel",             amount: 1_750, limit: 4_000 },
            { name: "Clearing Agent",role: "Tin Can clearing",             amount: 920,   limit: 3_000 },
            { name: "Support",       role: "Customer Support",             amount: 480,   limit: 2_000 },
          ].map((s) => {
            const pct = Math.round((s.amount / s.limit) * 100);
            return (
              <div key={s.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div>
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground"> · {s.role}</span>
                  </div>
                  <span className="tabular-nums text-muted-foreground">
                    ${s.amount.toLocaleString()} / ${s.limit.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full ${pct > 85 ? "bg-destructive" : pct > 60 ? "bg-warning" : "bg-success"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>


      {/* WhatsApp compose modal */}
      <Dialog open={!!waCustomer || !!waShipment} onOpenChange={(o) => { if (!o) { setWaCustomer(null); setWaShipment(null); } }}>
        <WhatsAppComposeDialog customer={waCustomer} shipment={waShipment} onClose={() => { setWaCustomer(null); setWaShipment(null); }} />
      </Dialog>
    </div>
  );
}

function SparkBars({ data, tone }: { data: { label: string; value: number }[]; tone?: "success" }) {
  const max = Math.max(...data.map((d) => d.value));
  const color = tone === "success" ? "bg-success/70" : "bg-primary/70";
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div className={`w-full rounded-t-md ${color}`} style={{ height: `${(d.value / max) * 100}%` }} />
          <div className="text-[10px] text-muted-foreground">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function CustomersTable({ onWhatsApp, onCreate }: { onWhatsApp: (c: typeof importers[number]) => void; onCreate: () => void }) {
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Outstanding</th>
              <th className="px-4 py-3">Last shipment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {importers.map((c) => (
              <tr key={c.name} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3"><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.country}</div></td>
                <td className="px-4 py-3 text-xs font-mono">{c.phone}</td>
                <td className="px-4 py-3 tabular-nums">{c.active}</td>
                <td className="px-4 py-3 tabular-nums">{c.shipments}</td>
                <td className="px-4 py-3 tabular-nums">{c.outstanding ? <span className="text-destructive font-medium">{fmtMoney(c.outstanding, "USD")}</span> : "—"}</td>
                <td className="px-4 py-3 tabular-nums text-xs">{c.lastShipment}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{c.status}</Badge></td>
                <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                  <Button size="sm" variant="ghost" onClick={() => toast.info(`Opening ${c.name}`)}><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
                  <Button size="sm" variant="ghost" onClick={() => onWhatsApp(c)}><MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp</Button>
                  <Button size="sm" variant="ghost" onClick={onCreate}><Plus className="h-3.5 w-3.5 mr-1" /> Shipment</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PipelineBoard() {
  return (
    <Card className="p-4 shadow-card">
      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-[1100px]">
          {STAGES.map((stage) => {
            const items = shipments.filter((s) => s.status === stage);
            return (
              <div key={stage} className="w-[170px] flex-shrink-0 bg-secondary/40 rounded-xl p-2">
                <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  <span>{stage}</span><span className="font-bold text-foreground">{items.length}</span>
                </div>
                <div className="space-y-2 mt-1 min-h-[100px]">
                  {items.map((s) => (
                    <div key={s.id} className="p-2.5 bg-card rounded-lg border border-border text-[11px] cursor-grab hover:shadow-md transition">
                      <div className="font-semibold truncate">{s.shipmentNumber}</div>
                      <div className="text-muted-foreground truncate">{s.importer}</div>
                      <div className="flex items-center justify-between mt-1.5 text-[10px]">
                        <span className="text-muted-foreground">ETA {s.eta}</span>
                        <span className="font-medium tabular-nums">{fmtMoney(s.value, s.ccy)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function DocumentsManager() {
  // simulate doc status per shipment
  const sample = shipments.slice(0, 5);
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-4 py-3">Shipment</th>
              {DOC_TYPES.map((d) => <th key={d} className="px-3 py-3 text-center">{d}</th>)}
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {sample.map((s, idx) => (
              <tr key={s.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{s.shipmentNumber}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">{s.importer}</div>
                </td>
                {DOC_TYPES.map((d, i) => {
                  const uploaded = (idx + i) % 3 !== 0;
                  return (
                    <td key={d} className="px-3 py-3 text-center">
                      {uploaded ? <CheckCircle2 className="h-4 w-4 text-success inline" /> : <span className="text-[10px] text-amber-600 font-medium">Missing</span>}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Upload dialog (demo)")}><Upload className="h-3.5 w-3.5 mr-1" /> Upload</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function InvoicesTable() {
  const [open, setOpen] = useState(false);
  const tones: Record<FreightInvoice["status"], string> = {
    Paid: "bg-success/15 text-success border-success/30",
    Unpaid: "bg-secondary text-secondary-foreground border-border",
    "Partially Paid": "bg-amber-500/15 text-amber-700 border-amber-500/30",
    Overdue: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-border">
        <div className="text-sm font-semibold">Freight invoices</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-primary"><Plus className="h-3.5 w-3.5 mr-1" /> New invoice</Button></DialogTrigger>
          <NewInvoiceDialog onClose={() => setOpen(false)} />
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Shipment</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {freightInvoices.map((i) => (
              <tr key={i.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                <td className="px-4 py-3">{i.customer}</td>
                <td className="px-4 py-3 font-mono text-xs">{i.shipment}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(i.amount, i.ccy)}</td>
                <td className="px-4 py-3 text-xs tabular-nums">{i.due}</td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${tones[i.status]}`}>{i.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => toast.success(`Reminder sent to ${i.customer}`)}><Send className="h-3.5 w-3.5 mr-1" /> Remind</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function WhatsAppPanel({ onCompose }: { onCompose: (s: Shipment) => void }) {
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="text-sm font-semibold">Send a shipment update</div>
        <p className="text-xs text-muted-foreground mt-1">Pre-fills the customer's WhatsApp with status, ETA, next action, missing documents and amount due.</p>
      </div>
      <div className="divide-y divide-border">
        {shipments.map((s) => (
          <div key={s.id} className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold flex items-center gap-2 truncate">{s.shipmentNumber} <Badge variant="outline" className="text-[10px]">{s.status}</Badge></div>
              <div className="text-xs text-muted-foreground truncate">{s.importer} · ETA {s.eta} · {s.origin} → {s.destination}</div>
            </div>
            <Button size="sm" className="bg-[#25D366] hover:bg-[#1ebe5d] text-white shrink-0" onClick={() => onCompose(s)}>
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Send Update
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ReportsPanel() {
  // Aggregates
  const byRoute = Object.entries(shipments.reduce<Record<string, number>>((acc, s) => {
    const k = `${s.origin} → ${s.destination}`; acc[k] = (acc[k] ?? 0) + 1; return acc;
  }, {})).sort((a, b) => b[1] - a[1]);

  const revByCustomer = Object.entries(freightInvoices.reduce<Record<string, number>>((acc, i) => {
    acc[i.customer] = (acc[i.customer] ?? 0) + i.amount; return acc;
  }, {})).sort((a, b) => b[1] - a[1]);

  const delayed = shipments.filter((s) => s.status === "Delayed");
  const mostActive = [...importers].sort((a, b) => b.active - a.active).slice(0, 5);
  const outstanding = freightInvoices.filter((i) => i.status !== "Paid");

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <ReportCard title="Shipments by route" icon={<BarChart3 className="h-4 w-4" />}>
        {byRoute.map(([k, v]) => (
          <Row key={k} label={k} value={String(v)} bar={v / byRoute[0][1]} />
        ))}
      </ReportCard>

      <ReportCard title="Revenue by customer (USD)" icon={<DollarSign className="h-4 w-4" />}>
        {revByCustomer.map(([k, v]) => (
          <Row key={k} label={k} value={fmtMoney(v, "USD")} bar={v / revByCustomer[0][1]} tone="success" />
        ))}
      </ReportCard>

      <ReportCard title="Delayed shipments" icon={<AlertTriangle className="h-4 w-4" />}>
        {delayed.length === 0 && <div className="text-sm text-muted-foreground">No current delays.</div>}
        {delayed.map((s) => (
          <Row key={s.id} label={`${s.shipmentNumber} · ${s.importer}`} value={`ETA ${s.eta}`} bar={1} tone="danger" />
        ))}
      </ReportCard>

      <ReportCard title="Most active customers" icon={<UsersIcon className="h-4 w-4" />}>
        {mostActive.map((c) => (
          <Row key={c.name} label={c.name} value={`${c.active} active · ${c.shipments} total`} bar={c.active / mostActive[0].active} />
        ))}
      </ReportCard>

      <ReportCard title="Monthly shipment volume" icon={<Ship className="h-4 w-4" />}>
        <SparkBars data={monthlyShipmentVolume.map((m) => ({ label: m.m, value: m.count }))} />
      </ReportCard>

      <ReportCard title="Outstanding invoices" icon={<DollarSign className="h-4 w-4" />}>
        {outstanding.map((i) => (
          <Row key={i.id} label={`${i.id} · ${i.customer}`} value={fmtMoney(i.amount, i.ccy)} bar={1} tone={i.status === "Overdue" ? "danger" : "warn"} />
        ))}
      </ReportCard>
    </div>
  );
}

function ReportCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-5 shadow-card">
      <div className="text-sm font-semibold mb-3 flex items-center gap-2">{icon} {title}</div>
      <div className="space-y-2">{children}</div>
    </Card>
  );
}

function Row({ label, value, bar, tone }: { label: string; value: string; bar: number; tone?: "success" | "danger" | "warn" }) {
  const color = tone === "success" ? "bg-success/60" : tone === "danger" ? "bg-destructive/60" : tone === "warn" ? "bg-amber-500/60" : "bg-primary/60";
  return (
    <div>
      <div className="flex items-center justify-between text-xs"><span className="truncate pr-2">{label}</span><span className="font-medium tabular-nums">{value}</span></div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1"><div className={color + " h-full"} style={{ width: `${Math.max(8, bar * 100)}%` }} /></div>
    </div>
  );
}

function CreateShipmentDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create shipment for customer</DialogTitle>
        <p className="text-xs text-muted-foreground">Fill in shipment, route and document details. You can update milestones later from the pipeline.</p>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <FF label="Customer / importer">
          <Select><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
            <SelectContent>{importers.map((i) => <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>)}</SelectContent>
          </Select>
        </FF>
        <FF label="Supplier"><Input placeholder="Guangzhou Tech Factory" /></FF>
        <FF label="Origin"><Input placeholder="Guangzhou, CN" /></FF>
        <FF label="Destination"><Input placeholder="Apapa, LOS" /></FF>
        <FF label="Shipment type">
          <Select defaultValue="Container"><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Container","RORO","Air Freight","Courier","Loose Cargo"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </FF>
        <FF label="Shipping line">
          <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{shippingLines.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </FF>
        <FF label="Container #"><Input placeholder="MSCU7762213" /></FF>
        <FF label="BL #"><Input placeholder="BL-998211" /></FF>
        <FF label="Shipment #"><Input placeholder="Auto-generated" /></FF>
        <FF label="ETA"><Input type="date" /></FF>
        <FF label="Goods category"><Input placeholder="Consumer Electronics" /></FF>
      </div>
      <FF label="Documents (upload later from Documents tab)">
        <div className="flex flex-wrap gap-2">
          {DOC_TYPES.map((d) => <Badge key={d} variant="outline" className="text-[10px]"><FileText className="h-3 w-3 mr-1" />{d}</Badge>)}
        </div>
      </FF>
      <FF label="Notes"><Textarea placeholder="Any operational notes, handling instructions or risk flags…" /></FF>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-primary" onClick={() => { toast.success("Shipment created"); onClose(); }}>Create shipment</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function NewInvoiceDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>New freight invoice</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <FF label="Customer">
          <Select><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
            <SelectContent>{importers.map((i) => <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>)}</SelectContent>
          </Select>
        </FF>
        <FF label="Shipment">
          <Select><SelectTrigger><SelectValue placeholder="Select shipment" /></SelectTrigger>
            <SelectContent>{shipments.map((s) => <SelectItem key={s.id} value={s.id}>{s.shipmentNumber}</SelectItem>)}</SelectContent>
          </Select>
        </FF>
        <FF label="Amount (USD)"><Input type="number" placeholder="4800" /></FF>
        <FF label="Due date"><Input type="date" /></FF>
      </div>
      <FF label="Notes"><Textarea placeholder="Line items, terms, payment instructions…" /></FF>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-primary" onClick={() => { toast.success("Invoice generated"); onClose(); }}>Generate invoice</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function WhatsAppComposeDialog({ customer, shipment, onClose }: { customer: typeof importers[number] | null; shipment: Shipment | null; onClose: () => void }) {
  const s = shipment ?? shipments.find((x) => x.importer === customer?.name) ?? shipments[0];
  const c = customer ?? importers.find((i) => i.name === s.importer) ?? importers[0];
  const invoice = freightInvoices.find((i) => i.shipment === s.id && i.status !== "Paid");
  const missingDocs = ["Bill of Lading", "Customs Documents"]; // demo

  const message =
`Hi ${c.name.split(" ")[0]}, quick update on your shipment ${s.shipmentNumber} (${s.name}):

• Status: ${s.status}
• ETA: ${s.eta} — ${s.destination}
• Next action: ${s.status === "Customs" ? "Pay duty & submit clearing docs" : s.status === "Delayed" ? "Rebooking — new ETA being confirmed" : "Monitoring vessel movement"}
${missingDocs.length ? `• Missing documents: ${missingDocs.join(", ")}` : ""}
${invoice ? `• Amount due: ${fmtMoney(invoice.amount, invoice.ccy)} (invoice ${invoice.id})` : ""}

Reply here if you have questions.
— Canta Freight Desk`;

  const [text, setText] = useState(message);

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-[#25D366]" /> Send WhatsApp update</DialogTitle>
        <p className="text-xs text-muted-foreground">To {c.name} · <span className="font-mono">{c.phone}</span></p>
      </DialogHeader>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[260px] font-mono text-xs" />
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button asChild className="bg-[#25D366] hover:bg-[#1FB855] text-white hover:shadow-lg hover:shadow-[#25D366]/30 transition">
          <a
            href={buildWhatsAppUrl("shipmentUpdate", {
              shipment: `${s.shipmentNumber} (${s.name})`,
              status: s.status,
              eta: `${s.eta} — ${s.destination}`,
              missingDocs: missingDocs.join(", ") || "None",
              payment: invoice ? `${fmtMoney(invoice.amount, invoice.ccy)} due (invoice ${invoice.id})` : "Up to date",
              nextAction: s.status === "Customs" ? "Pay duty & submit clearing docs" : s.status === "Delayed" ? "Rebooking — new ETA being confirmed" : "Monitoring vessel movement",
            })}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { toast.success(`WhatsApp opening for ${c.name}`); setTimeout(onClose, 200); }}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" /> Send via WhatsApp
          </a>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function BroadcastPanel() {
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("arriving-week");
  const quick = [
    { l: "Send update to all customers arriving this week", a: "arriving-week", m: "Hi {{customer}}, your shipment {{shipment_id}} is arriving in {{port}} this week. We'll send the BL and clearing checklist shortly. — Canta" },
    { l: "Send missing document reminder", a: "missing-docs", m: "Hi {{customer}}, please send the missing documents for {{shipment_id}}: {{missing_docs}}. Reply on WhatsApp and our agent will upload them for you." },
    { l: "Send payment reminder", a: "payment-pending", m: "Hi {{customer}}, friendly reminder: freight invoice {{invoice_id}} for {{amount}} is due {{due_date}}. Pay via the Canta link in this chat." },
    { l: "Send delay notice", a: "delayed", m: "Hi {{customer}}, vessel for {{shipment_id}} has been delayed. New ETA: {{new_eta}}. We're tracking it closely — no action needed from your side." },
    { l: "Send arrival notice", a: "arrived", m: "Hi {{customer}}, your shipment {{shipment_id}} has arrived at {{port}}. Customs clearing begins now. We'll request duty payment shortly." },
  ];
  return (
    <Card className="p-5 shadow-card border-[#25D366]/30 bg-gradient-to-br from-[#25D366]/10 to-transparent">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-[#25D366]" />
        <div className="text-sm font-semibold">Customer WhatsApp Broadcast</div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">Send one message to a smart segment of your customers in seconds.</p>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-2">
        {quick.map((q) => (
          <Button
            key={q.a}
            variant="outline"
            className={`h-auto py-3 justify-start text-left ${audience === q.a ? "border-[#25D366] bg-[#25D366]/10" : ""}`}
            onClick={() => { setAudience(q.a); setMessage(q.m); }}
          >
            <Send className="h-3.5 w-3.5 mr-2 shrink-0 text-[#25D366]" />
            <span className="text-xs">{q.l}</span>
          </Button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Audience</Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="arriving-week">Customers arriving this week</SelectItem>
              <SelectItem value="missing-docs">Customers with missing documents</SelectItem>
              <SelectItem value="payment-pending">Customers with outstanding invoices</SelectItem>
              <SelectItem value="delayed">Customers with delayed shipments</SelectItem>
              <SelectItem value="arrived">Customers with arrived shipments</SelectItem>
              <SelectItem value="all">All active customers</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-3 text-[11px] text-muted-foreground">
            Estimated recipients: <span className="font-semibold text-foreground">{audience === "all" ? importers.length : Math.max(1, Math.floor(importers.length / 2))}</span>
          </div>
        </div>
        <div className="lg:col-span-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Message</Label>
          <Textarea
            className="mt-1 h-28"
            placeholder="Type a broadcast message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
            <div className="text-[11px] text-muted-foreground">Variables: {"{{customer}}, {{shipment_id}}, {{port}}, {{eta}}"} auto-filled per recipient.</div>
            <Button
              size="sm"
              className="bg-[#25D366] hover:bg-[#1FB855] text-white hover:shadow-lg hover:shadow-[#25D366]/30 transition"
              onClick={() => {
                if (!message) { toast.error("Pick a quick action or type a message"); return; }
                const tpl = audience === "missing-docs" ? "missingDocument" : "shipmentUpdate";
                const url = audience === "missing-docs"
                  ? buildWhatsAppUrl("missingDocument", { document: "Bill of Lading / Packing List", shipment: "(see chat)", eta: "(see chat)" })
                  : buildWhatsAppUrl("shipmentUpdate", { shipment: "(broadcast)", status: audience, eta: "(see chat)", missingDocs: "—", payment: "—", nextAction: message.slice(0, 80) });
                window.open(url, "_blank", "noopener,noreferrer");
                toast.success("WhatsApp opening for broadcast");
                setMessage("");
                void tpl;
              }}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" /> Send broadcast
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
