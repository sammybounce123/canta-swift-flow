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
import { WorkspaceWelcome } from "@/components/WorkspaceWelcome";
import { StartHereCard } from "@/components/StartHereCard";
import { Truck, Plus, MessageCircle, FileText, DollarSign, Users as UsersIcon, AlertTriangle, Ship, Eye, Upload, CheckCircle2, Clock, TrendingUp, BarChart3, Send, Download, UserPlus, Banknote } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";
import { getRequests as getClearingRequests, getBids as getClearingBids, getBidsForRequest as getClearingBidsForRequest, CLEARING_DISCLAIMER, getAgentVerified, setAgentVerified, submitBid as submitClearingBid, withdrawBid as withdrawClearingBid, markUnableToProceed as markBidUnable, SERVICE_SCOPES, type ServiceScope } from "@/lib/clearing-store";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, Lock as LockIcon } from "lucide-react";

export const Route = createFileRoute("/freight")({
  head: () => ({ meta: [{ title: "Clearing Agent Portal — Canta" }] }),
  component: Freight,
});

const STAGES: Shipment["status"][] = ["Booked", "At Origin", "Loaded", "On Vessel", "Arrived", "Customs", "Released", "Delivered", "Delayed"];
const STAFF = ["Femi A.", "Adaeze O.", "James O.", "Aisha B.", "Ops Team", "Clearing Desk"];

const DOC_TYPES = [
  "Supplier Invoice", "Packing List", "Bill of Lading",
  "Freight Invoice", "Customs Documents", "Delivery Note",
];

function Freight() {
  const [tab, setTab] = useState("quote-requests");
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
      <ReadinessBar status="Demo Preview" cue="Verified clearing agents see importer quote requests and run accepted jobs." />
      <WorkspaceWelcome workspace="freight_workspace" />
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Clearing Agent Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Review importer quote requests, submit bids, and run accepted clearing jobs.</p>
        </div>
      </div>

      <StartHereCard
        title="Bid on Clearing Quote Requests"
        description="Browse importer quote requests, submit competitive bids, and run accepted jobs from one place."
        primary={{ label: "View Quote Requests", onClick: () => setTab("quote-requests") }}
        secondary={[
          { label: "My Bids", onClick: () => setTab("my-bids") },
          { label: "Accepted Jobs", onClick: () => setTab("pipeline") },
          { label: "Messages", onClick: () => setTab("whatsapp") },
        ]}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Clearing Agent Portal sections" className="flex h-auto w-full flex-wrap items-center justify-start gap-2 rounded-lg border border-border bg-muted/60 p-2">
          {[
            ["quote-requests", "Available Quote Requests"],
            ["my-bids", "My Bids"],
            ["pipeline", "Accepted Jobs"],
            ["documents", "Documents Requested"],
            ["whatsapp", "Messages"],
          ].map(([v, l]) => (
            <TabsTrigger
              key={v}
              value={v}
              className="h-auto rounded-md border border-border bg-background/80 px-3 py-2 text-sm hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="quote-requests" className="mt-6"><AgentQuoteRequestsTab /></TabsContent>
        <TabsContent value="my-bids" className="mt-6"><AgentMyBidsTab /></TabsContent>

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

        <TabsContent value="arriving" className="mt-6">
          <ArrivingShipments />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentsManager />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <InvoicesTable />
        </TabsContent>

        <TabsContent value="insurance" className="mt-6">
          <InsurancePanel />
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6 space-y-5">
          <BroadcastPanel />
          <WhatsAppPanel onCompose={(s) => setWaShipment(s)} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportsPanel />
        </TabsContent>
      </Tabs>




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
  const [list, setList] = useState(() => importers.map((c) => ({ ...c })));
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", country: "Nigeria", phone: "", email: "" });
  const [shareCustomer, setShareCustomer] = useState<(typeof importers)[number] | null>(null);

  const submitAdd = () => {
    if (!form.name || !form.phone) return toast.error("Name and WhatsApp number are required");
    setList((arr) => [{
      name: form.name, country: form.country, phone: form.phone,
      shipments: 0, active: 0, outstanding: 0, status: "Pending KYB", lastShipment: "—",
    }, ...arr]);
    toast.success(`${form.name} added to customers`);
    setAddOpen(false);
    setForm({ name: "", country: "Nigeria", phone: "", email: "" });
  };

  return (
    <Card className="shadow-card overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-border">
        <div className="text-sm font-semibold">Importer customers</div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-primary"><UserPlus className="h-3.5 w-3.5 mr-1" /> Add Customer</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add importer customer</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <FF label="Business name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ABC Electronics" /></FF>
              <FF label="Country"><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></FF>
              <FF label="WhatsApp number"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234 801 234 5566" /></FF>
              <FF label="Email (optional)"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ops@abc.com" /></FF>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button className="bg-primary" onClick={submitAdd}>Add customer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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
            {list.map((c) => (
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
                  <Button size="sm" variant="ghost" onClick={() => setShareCustomer(c)}>Tracking link</Button>
                  <Button size="sm" variant="ghost" onClick={onCreate}><Plus className="h-3.5 w-3.5 mr-1" /> Shipment</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!shareCustomer} onOpenChange={(o) => !o && setShareCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Customer tracking link</DialogTitle></DialogHeader>
          {shareCustomer && (() => {
            const slug = shareCustomer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const url = typeof window !== "undefined" ? `${window.location.origin}/track/customer/${slug}` : `/track/customer/${slug}`;
            return (
              <>
                <p className="text-xs text-muted-foreground">Shareable link showing all active shipments for {shareCustomer.name}. No login needed.</p>
                <div className="flex gap-2">
                  <Input value={url} readOnly className="font-mono text-xs" />
                  <Button onClick={() => { navigator.clipboard?.writeText(url); toast.success("Link copied"); }}>Copy</Button>
                </div>
                <DialogFooter>
                  <Button variant="outline" asChild>
                    <a href={`https://wa.me/${shareCustomer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${shareCustomer.name}, track your shipments live: ${url}`)}`} target="_blank" rel="noopener noreferrer">
                      Send via WhatsApp
                    </a>
                  </Button>
                  <Button onClick={() => setShareCustomer(null)}>Done</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

type Assignment = { staff: string; role: string; due: string; note: string; status: "Open" | "In Progress" | "Done" };

function PipelineBoard() {
  const [items, setItems] = useState(() => shipments.map((s) => ({ ...s })));
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});
  const [assignOpen, setAssignOpen] = useState<string | null>(null);
  const move = (id: string, status: Shipment["status"]) => {
    setItems((arr) => arr.map((s) => (s.id === id ? { ...s, status } : s)));
    toast.success(`Moved to ${status}`);
  };
  return (
    <Card className="p-4 shadow-card">
      <div className="text-xs text-muted-foreground mb-3">Change status from each card's dropdown, or click <strong>Assign</strong> for full details (staff, role, due date, note, status).</div>
      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-[1100px]">
          {STAGES.map((stage) => {
            const list = items.filter((s) => s.status === stage);
            return (
              <div key={stage} className="w-[210px] flex-shrink-0 bg-secondary/40 rounded-xl p-2">
                <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  <span>{stage}</span><span className="font-bold text-foreground">{list.length}</span>
                </div>
                <div className="space-y-2 mt-1 min-h-[100px]">
                  {list.map((s) => {
                    const a = assignments[s.id];
                    return (
                      <div key={s.id} className="p-2.5 bg-card rounded-lg border border-border text-[11px] hover:shadow-md transition space-y-1.5">
                        <div className="font-semibold truncate">{s.shipmentNumber}</div>
                        <div className="text-muted-foreground truncate">{s.importer}</div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">ETA {s.eta}</span>
                          <span className="font-medium tabular-nums">{fmtMoney(s.value, s.ccy)}</span>
                        </div>
                        <Select value={s.status} onValueChange={(v) => move(s.id, v as Shipment["status"])}>
                          <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent>{STAGES.map((st) => <SelectItem key={st} value={st} className="text-xs">{st}</SelectItem>)}</SelectContent>
                        </Select>
                        {a ? (
                          <button onClick={() => setAssignOpen(s.id)} className="w-full text-left rounded-md border border-border bg-secondary/50 p-1.5 hover:bg-secondary">
                            <div className="text-[10px] font-semibold truncate">{a.staff} · {a.role}</div>
                            <div className="text-[9px] text-muted-foreground flex items-center justify-between">
                              <span>Due {a.due || "—"}</span>
                              <Badge variant="outline" className="text-[9px] py-0">{a.status}</Badge>
                            </div>
                          </button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 w-full text-[10px]" onClick={() => setAssignOpen(s.id)}>
                            <UserPlus className="h-3 w-3 mr-1" /> Assign staff
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {list.length === 0 && <div className="text-[10px] text-muted-foreground text-center py-4">No shipments</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AssignmentDialog
        open={!!assignOpen}
        shipmentId={assignOpen}
        current={assignOpen ? assignments[assignOpen] : undefined}
        onClose={() => setAssignOpen(null)}
        onSave={(a) => {
          if (!assignOpen) return;
          setAssignments((cur) => ({ ...cur, [assignOpen]: a }));
          setItems((arr) => arr.map((s) => (s.id === assignOpen ? { ...s, forwarder: a.staff } : s)));
          toast.success(`${assignOpen} assigned to ${a.staff} (${a.role})`);
          setAssignOpen(null);
        }}
      />
    </Card>
  );
}

function AssignmentDialog({
  open, shipmentId, current, onClose, onSave,
}: {
  open: boolean; shipmentId: string | null; current?: Assignment;
  onClose: () => void; onSave: (a: Assignment) => void;
}) {
  const [a, setA] = useState<Assignment>(current ?? { staff: STAFF[0], role: "Operations Lead", due: "", note: "", status: "Open" });
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign shipment {shipmentId ?? ""}</DialogTitle>
          <p className="text-xs text-muted-foreground">Staff, role, due date, note and status all sync to the pipeline card.</p>
        </DialogHeader>
        <div className="grid gap-3">
          <FF label="Assigned staff">
            <Select value={a.staff} onValueChange={(v) => setA({ ...a, staff: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STAFF.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
            </Select>
          </FF>
          <FF label="Role">
            <Select value={a.role} onValueChange={(v) => setA({ ...a, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Operations Lead","Clearing Agent","Documentation","Warehouse","Customer Manager","Driver"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </FF>
          <FF label="Due date"><Input type="date" value={a.due} onChange={(e) => setA({ ...a, due: e.target.value })} /></FF>
          <FF label="Status">
            <Select value={a.status} onValueChange={(v) => setA({ ...a, status: v as Assignment["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Open","In Progress","Done"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </FF>
          <FF label="Note"><Textarea value={a.note} onChange={(e) => setA({ ...a, note: e.target.value })} placeholder="Handover instructions, special handling, contact preferences…" /></FF>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-primary" onClick={() => onSave(a)}>Save assignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ArrivingShipments() {
  const now = Date.now();
  const days = (eta: string) => Math.ceil((new Date(eta).getTime() - now) / 86400000);
  const buckets = [
    { title: "Arriving this week", filter: (s: Shipment) => { const d = days(s.eta); return d >= 0 && d <= 7; }, tone: "border-primary/30" },
    { title: "Arriving in 14 days", filter: (s: Shipment) => { const d = days(s.eta); return d > 7 && d <= 14; }, tone: "border-accent/30" },
    { title: "Delayed", filter: (s: Shipment) => s.status === "Delayed" || days(s.eta) < 0, tone: "border-destructive/30" },
    { title: "ETA changes (last 24h)", filter: (s: Shipment) => ["SHP-10427", "SHP-10423"].includes(s.id), tone: "border-amber-500/30" },
  ];
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {buckets.map((b) => {
        const list = shipments.filter(b.filter);
        return (
          <Card key={b.title} className={`p-4 shadow-card border ${b.tone}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">{b.title}</div>
              <Badge variant="outline" className="text-[10px]">{list.length}</Badge>
            </div>
            <div className="space-y-2">
              {list.length === 0 && <div className="text-xs text-muted-foreground py-3">No shipments in this bucket.</div>}
              {list.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2 text-xs border-t border-border pt-2 first:border-t-0 first:pt-0">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.shipmentNumber} · {s.importer}</div>
                    <div className="text-muted-foreground truncate">{s.origin} → {s.destination} · ETA {s.eta}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Update sent for ${s.shipmentNumber}`)}>Next action</Button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
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
  const [rows, setRows] = useState<FreightInvoice[]>(() => freightInvoices.map((i) => ({ ...i })));
  const [filter, setFilter] = useState<"All" | "Outstanding" | FreightInvoice["status"]>("All");
  const tones: Record<FreightInvoice["status"], string> = {
    Draft: "bg-secondary text-secondary-foreground border-border",
    Sent: "bg-primary/15 text-primary border-primary/30",
    Paid: "bg-success/15 text-success border-success/30",
    Unpaid: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    "Partially Paid": "bg-amber-500/15 text-amber-700 border-amber-500/30",
    Overdue: "bg-destructive/15 text-destructive border-destructive/30",
    Cancelled: "bg-muted text-muted-foreground border-border",
  };
  const STATUSES: FreightInvoice["status"][] = ["Draft", "Sent", "Paid", "Unpaid", "Partially Paid", "Overdue", "Cancelled"];
  const setStatus = (id: string, status: FreightInvoice["status"]) => {
    setRows((arr) => arr.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Invoice ${id} marked as ${status}.`);
  };
  const download = (i: FreightInvoice) => {
    const body = `CANTA FREIGHT INVOICE\n\nInvoice: ${i.id}\nCustomer: ${i.customer}\nShipment: ${i.shipment}\nAmount: ${fmtMoney(i.amount, i.ccy)}\nDue: ${i.due}\nIssued: ${i.issued}\nStatus: ${i.status}\n`;
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
    const a = document.createElement("a"); a.href = url; a.download = `${i.id}.txt`; a.click(); URL.revokeObjectURL(url);
    toast.success(`Downloaded ${i.id}`);
  };
  const filtered = rows.filter((r) => {
    if (filter === "All") return true;
    if (filter === "Outstanding") return !["Paid", "Cancelled"].includes(r.status);
    return r.status === filter;
  });
  const outstandingTotal = rows.filter((r) => !["Paid", "Cancelled"].includes(r.status)).reduce((a, b) => a + b.amount, 0);

  return (
    <Card className="shadow-card overflow-hidden">
      <div className="p-4 flex items-center justify-between flex-wrap gap-3 border-b border-border">
        <div>
          <div className="text-sm font-semibold">Freight invoices</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Outstanding: <span className="font-semibold text-destructive">{fmtMoney(outstandingTotal, "USD")}</span> · {rows.length} total
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="h-8 w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All invoices</SelectItem>
              <SelectItem value="Outstanding">Outstanding only</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="bg-primary"><Plus className="h-3.5 w-3.5 mr-1" /> New invoice</Button></DialogTrigger>
            <NewInvoiceDialog onClose={() => setOpen(false)} />
          </Dialog>
        </div>
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
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                <td className="px-4 py-3">{i.customer}</td>
                <td className="px-4 py-3 font-mono text-xs">{i.shipment}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(i.amount, i.ccy)}</td>
                <td className="px-4 py-3 text-xs tabular-nums">{i.due}</td>
                <td className="px-4 py-3">
                  <Select value={i.status} onValueChange={(v) => setStatus(i.id, v as FreightInvoice["status"])}>
                    <SelectTrigger className={`h-7 w-[140px] text-[10px] border ${tones[i.status]}`}><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                  {i.status !== "Paid" && i.status !== "Cancelled" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(i.id, "Paid")}><Banknote className="h-3.5 w-3.5 mr-1" /> Mark paid</Button>
                  )}
                  {i.status === "Paid" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(i.id, "Unpaid")}>Mark unpaid</Button>
                  )}
                  {i.status === "Unpaid" && (
                    <Button size="sm" variant="ghost" onClick={() => setStatus(i.id, "Overdue")}>Mark overdue</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => download(i)}><Download className="h-3.5 w-3.5 mr-1" /> Download</Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={buildWhatsAppUrl("paymentReminder", { invoice: i.id, amount: fmtMoney(i.amount, i.ccy), due: i.due })} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-3.5 w-3.5 mr-1" /> Remind
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No invoices match this filter.</td></tr>
            )}
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

  const exportReport = (fmt: "csv" | "pdf") => {
    const lines = ["Section,Label,Value"];
    byRoute.forEach(([k, v]) => lines.push(`Route,${k},${v}`));
    revByCustomer.forEach(([k, v]) => lines.push(`Revenue,${k},${v}`));
    delayed.forEach((s) => lines.push(`Delayed,${s.shipmentNumber},${s.eta}`));
    outstanding.forEach((i) => lines.push(`Outstanding,${i.id} ${i.customer},${i.amount}`));
    const ext = fmt === "csv" ? "csv" : "pdf";
    const mime = fmt === "csv" ? "text/csv" : "application/pdf";
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: mime }));
    const a = document.createElement("a"); a.href = url; a.download = `freight-reports.${ext}`; a.click(); URL.revokeObjectURL(url);
    toast.success(`Reports exported as ${ext.toUpperCase()}`);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Snapshot of route volume, customer revenue, delays and outstanding invoices.</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportReport("csv")}><Download className="h-3.5 w-3.5 mr-1" /> Export CSV</Button>
          <Button size="sm" variant="outline" onClick={() => exportReport("pdf")}><Download className="h-3.5 w-3.5 mr-1" /> Export PDF</Button>
        </div>
      </div>
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
        <FF label="VIN (vehicles)"><Input placeholder="1HGCM82633A123456" /></FF>
        <FF label="AWB # (air freight, optional)"><Input placeholder="AWB-176-44210015" /></FF>
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
  const quick: { l: string; a: string; m: string; tpl: import("@/lib/whatsapp").WhatsAppTemplateKey }[] = [
    { l: "Container loaded", a: "loaded", tpl: "containerLoaded", m: "Hi {{customer}}, your container for {{shipment_id}} has been loaded. Vessel sails {{sailing}}." },
    { l: "Vessel sailed", a: "sailed", tpl: "vesselSailed", m: "Hi {{customer}}, vessel {{vessel}} has sailed from {{origin}}. ETA {{eta}}." },
    { l: "Arrived at port", a: "arrived", tpl: "arrivedAtPort", m: "Hi {{customer}}, your shipment {{shipment_id}} has arrived at {{port}}. Clearing starts now." },
    { l: "Clearing started", a: "clearing", tpl: "clearingStarted", m: "Hi {{customer}}, clearing has started for {{shipment_id}}. Please confirm duty payment." },
    { l: "Cleared customs", a: "cleared", tpl: "clearedCustoms", m: "Hi {{customer}}, {{shipment_id}} has cleared customs. We're arranging delivery." },
    { l: "Out for delivery", a: "out-for-delivery", tpl: "outForDelivery", m: "Hi {{customer}}, {{shipment_id}} is out for delivery. ETA at your warehouse {{eta}}." },
    { l: "Delivered", a: "delivered", tpl: "delivered", m: "Hi {{customer}}, {{shipment_id}} delivered ✓. Thank you for shipping with Canta." },
    { l: "Delay notice", a: "delayed", tpl: "delayNotice", m: "Hi {{customer}}, vessel for {{shipment_id}} has been delayed. New ETA {{new_eta}}." },
    { l: "Missing document reminder", a: "missing-docs", tpl: "missingDocumentReminder", m: "Hi {{customer}}, please send the missing documents for {{shipment_id}}: {{missing_docs}}." },
    { l: "Payment reminder", a: "payment-pending", tpl: "paymentReminder", m: "Hi {{customer}}, invoice {{invoice_id}} for {{amount}} is due {{due_date}}." },
    { l: "Arriving this week", a: "arriving-week", tpl: "shipmentUpdate", m: "Hi {{customer}}, your shipment {{shipment_id}} is arriving in {{port}} this week." },
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
              {quick.map((q) => <SelectItem key={q.a} value={q.a}>{q.l}</SelectItem>)}
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
                const picked = quick.find((q) => q.a === audience);
                const tpl = picked?.tpl ?? "shipmentUpdate";
                const url = buildWhatsAppUrl(tpl, {
                  shipment: "(broadcast)", status: audience, eta: "(see chat)",
                  document: "Bill of Lading / Packing List", port: "(see chat)",
                  missingDocs: "—", payment: "—", nextAction: message.slice(0, 80),
                });
                window.open(url, "_blank", "noopener,noreferrer");
                toast.success(`Broadcast sent (${picked?.l ?? "update"})`);
                setMessage("");
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

function InsurancePanel() {
  type Policy = {
    id: string; shipment: string; customer: string; cargoValue: number; ccy: string;
    coverage: number; premium: number; status: "Quoted" | "Offered" | "Bound" | "Declined";
  };
  const RATE = 0.0085; // 0.85% of cargo value
  const [policies, setPolicies] = useState<Policy[]>(() =>
    shipments.slice(0, 4).map((s, i) => ({
      id: `INS-${5100 + i}`,
      shipment: s.shipmentNumber,
      customer: s.importer,
      cargoValue: s.value,
      ccy: s.ccy,
      coverage: Math.round(s.value * 1.1),
      premium: Math.round(s.value * RATE),
      status: (["Quoted","Offered","Bound","Quoted"] as const)[i],
    })),
  );
  const tones: Record<Policy["status"], string> = {
    Quoted: "bg-secondary text-secondary-foreground border-border",
    Offered: "bg-primary/15 text-primary border-primary/30",
    Bound: "bg-success/15 text-success border-success/30",
    Declined: "bg-destructive/15 text-destructive border-destructive/30",
  };
  const setStatus = (id: string, status: Policy["status"]) => {
    setPolicies((arr) => arr.map((p) => (p.id === id ? { ...p, status } : p)));
    toast.success(`Insurance ${id} → ${status}`);
  };
  const totalBound = policies.filter((p) => p.status === "Bound").reduce((a, b) => a + b.coverage, 0);
  const totalPremium = policies.filter((p) => p.status !== "Declined").reduce((a, b) => a + b.premium, 0);
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold">Goods-in-transit insurance</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Bound cover: <span className="font-semibold text-success">{fmtMoney(totalBound, "USD")}</span> ·
            Premiums in pipeline: <span className="font-semibold">{fmtMoney(totalPremium, "USD")}</span> · Rate {(RATE * 100).toFixed(2)}%
          </div>
        </div>
        <Button size="sm" className="bg-primary" onClick={() => {
          const s = shipments[Math.floor(Math.random() * shipments.length)];
          const id = `INS-${5200 + policies.length}`;
          setPolicies((arr) => [{
            id, shipment: s.shipmentNumber, customer: s.importer, cargoValue: s.value, ccy: s.ccy,
            coverage: Math.round(s.value * 1.1), premium: Math.round(s.value * RATE), status: "Quoted",
          }, ...arr]);
          toast.success(`Quote ${id} offered to ${s.importer}`);
        }}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Offer insurance
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-4 py-3">Policy #</th>
              <th className="px-4 py-3">Shipment</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3 text-right">Cargo value</th>
              <th className="px-4 py-3 text-right">Coverage</th>
              <th className="px-4 py-3 text-right">Premium</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.shipment}</td>
                <td className="px-4 py-3">{p.customer}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtMoney(p.cargoValue, p.ccy)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtMoney(p.coverage, p.ccy)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(p.premium, p.ccy)}</td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${tones[p.status]}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                  {p.status !== "Bound" && <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "Bound")}>Bind</Button>}
                  {p.status !== "Offered" && p.status !== "Bound" && <Button size="sm" variant="ghost" onClick={() => setStatus(p.id, "Offered")}>Offer</Button>}
                  {p.status !== "Declined" && <Button size="sm" variant="ghost" onClick={() => setStatus(p.id, "Declined")}>Decline</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AgentVerificationBar({ verified, onToggle }: { verified: boolean; onToggle: (v: boolean) => void }) {
  return (
    <Card className={`p-3 shadow-card flex items-center justify-between gap-3 ${verified ? "border-success/30 bg-success/5" : "border-amber-500/30 bg-amber-500/5"}`}>
      <div className="flex items-center gap-2 text-xs">
        {verified ? <ShieldCheck className="h-4 w-4 text-success" /> : <LockIcon className="h-4 w-4 text-amber-600" />}
        <div>
          <div className="font-semibold text-sm">{verified ? "Verified clearing agent" : "Verification required"}</div>
          <div className="text-muted-foreground">{verified ? "You can view and bid on importer quote requests." : "Complete verification to bid on clearing quote requests."}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>Demo verification</span>
        <Switch checked={verified} onCheckedChange={onToggle} />
      </div>
    </Card>
  );
}

function AgentQuoteRequestsTab() {
  const [verified, setVerified] = useState(() => getAgentVerified());
  const [tick, setTick] = useState(0);
  const requests = useMemo(() => getClearingRequests().filter((r) => r.status !== "Cancelled"), [tick]);
  const [bidFor, setBidFor] = useState<string | null>(null);

  const toggleVerify = (v: boolean) => { setAgentVerified(v); setVerified(v); };

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-card border-amber-500/30 bg-amber-500/5 text-xs text-muted-foreground">
        {CLEARING_DISCLAIMER}
      </Card>
      <AgentVerificationBar verified={verified} onToggle={toggleVerify} />
      {!verified ? (
        <Card className="p-8 text-center shadow-card border-dashed">
          <LockIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <div className="text-base font-semibold">Complete verification to bid on clearing quote requests</div>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Only verified clearing agents can view and bid on importer quote requests. Submit your verification documents to start receiving requests.
          </p>
        </Card>
      ) : (
        <Card className="p-4 shadow-card">
          <div className="text-sm font-semibold">Available clearing quote requests</div>
          <p className="text-xs text-muted-foreground mt-1">Each request shows only the details the importer chose to share. Review and submit a bid with fee, timeline, service scope and required documents.</p>
          <div className="mt-4 space-y-2">
            {requests.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">No open quote requests right now.</div>
            ) : requests.map((r) => {
              const bids = getClearingBidsForRequest(r.id);
              return (
                <div key={r.id} className="rounded-md border border-border p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {r.id}
                      <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {r.portOfArrival} · {r.serviceRequired}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{r.goodsDescription}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{bids.length} bid{bids.length === 1 ? "" : "s"} submitted</Badge>
                    <Button size="sm" disabled={r.status === "In Workflow" || r.status === "Completed"} onClick={() => setBidFor(r.id)}>Submit Bid</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      <SubmitBidDialog requestId={bidFor} onClose={() => setBidFor(null)} onSubmitted={() => { setBidFor(null); setTick((t) => t + 1); }} />
    </div>
  );
}

function SubmitBidDialog({ requestId, onClose, onSubmitted }: { requestId: string | null; onClose: () => void; onSubmitted: () => void }) {
  const [f, setF] = useState({
    agentName: "Apapa Prime Clearing Ltd",
    clearingFee: "2400",
    dutyEstimate: "",
    serviceScope: "Clearing + delivery" as ServiceScope,
    timelineDays: "6",
    requiredDocs: "Form M, PAAR, SONCAP",
    terms: "50% upfront, 50% on release.",
    notes: "",
    expiresInHrs: "72",
  });

  const submit = () => {
    if (!requestId) return;
    if (!f.agentName || !f.clearingFee || !f.timelineDays) return toast.error("Agent name, fee and timeline are required");
    submitClearingBid({
      requestId,
      agentName: f.agentName,
      verified: true,
      rating: 4.7,
      completedJobs: 220,
      responseTimeHrs: 3,
      clearingFee: Number(f.clearingFee) || 0,
      dutyEstimate: f.dutyEstimate ? Number(f.dutyEstimate) : undefined,
      serviceScope: f.serviceScope,
      timelineDays: Number(f.timelineDays) || 0,
      requiredDocs: f.requiredDocs.split(",").map((s) => s.trim()).filter(Boolean),
      terms: f.terms,
      notes: f.notes || undefined,
      expiresAt: new Date(Date.now() + (Number(f.expiresInHrs) || 72) * 3600_000).toISOString(),
    });
    toast.success("Bid submitted to importer for review");
    onSubmitted();
  };

  return (
    <Dialog open={!!requestId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit clearing bid</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs">Agent name</Label><Input value={f.agentName} onChange={(e) => setF({ ...f, agentName: e.target.value })} /></div>
          <div><Label className="text-xs">Clearing fee (USD)</Label><Input value={f.clearingFee} onChange={(e) => setF({ ...f, clearingFee: e.target.value })} /></div>
          <div><Label className="text-xs">Duty estimate (USD, optional)</Label><Input value={f.dutyEstimate} onChange={(e) => setF({ ...f, dutyEstimate: e.target.value })} /></div>
          <div><Label className="text-xs">Timeline (days)</Label><Input value={f.timelineDays} onChange={(e) => setF({ ...f, timelineDays: e.target.value })} /></div>
          <div><Label className="text-xs">Bid expires in (hrs)</Label><Input value={f.expiresInHrs} onChange={(e) => setF({ ...f, expiresInHrs: e.target.value })} /></div>
          <div className="col-span-2"><Label className="text-xs">Service scope</Label>
            <Select value={f.serviceScope} onValueChange={(v) => setF({ ...f, serviceScope: v as ServiceScope })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICE_SCOPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label className="text-xs">Required documents (comma-separated)</Label><Input value={f.requiredDocs} onChange={(e) => setF({ ...f, requiredDocs: e.target.value })} /></div>
          <div className="col-span-2"><Label className="text-xs">Payment terms</Label><Textarea value={f.terms} onChange={(e) => setF({ ...f, terms: e.target.value })} rows={2} /></div>
          <div className="col-span-2"><Label className="text-xs">Notes (optional)</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={2} /></div>
        </div>
        <p className="text-[11px] text-muted-foreground">By submitting, you confirm the fee, timeline and service scope. Canta does not guarantee clearing outcomes.</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Submit Bid</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AgentMyBidsTab() {
  const [tick, setTick] = useState(0);
  const bids = useMemo(() => getClearingBids(), [tick]);
  const requests = useMemo(() => getClearingRequests(), [tick]);
  const [unableFor, setUnableFor] = useState<string | null>(null);
  const [unableNote, setUnableNote] = useState("");

  return (
    <Card className="p-4 shadow-card">
      <div className="text-sm font-semibold">My bids</div>
      <p className="text-xs text-muted-foreground mt-1">Track bid status across all clearing quote requests you have responded to.</p>
      <div className="mt-4 space-y-2">
        {bids.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">No bids submitted yet.</div>
        ) : bids.map((b) => {
          const accepted = b.status === "Accepted";
          const withdrawn = b.status === "Withdrawn";
          const inactive = b.status === "Not Selected" || b.status === "Declined" || b.status === "Expired";
          return (
            <div key={b.id} className="rounded-md border border-border p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{b.agentName} · {b.id}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Request {b.requestId} · {b.serviceScope} · Fee {fmtMoney(b.clearingFee, "USD")} · {b.timelineDays} days
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{b.status}</Badge>
                {!accepted && !withdrawn && !inactive ? (
                  <Button size="sm" variant="outline" onClick={() => {
                    if (!confirm("Withdraw this bid? The importer will be notified.")) return;
                    withdrawClearingBid(b.id);
                    toast.success("Bid withdrawn");
                    setTick((t) => t + 1);
                  }}>Withdraw Bid</Button>
                ) : null}
                {accepted ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => toast.info("Documents requested from importer")}>Request Documents</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.info("Status update sent")}>Update Status</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => setUnableFor(b.id)}>Unable to Proceed</Button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!unableFor} onOpenChange={(o) => !o && setUnableFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as unable to proceed</DialogTitle>
          </DialogHeader>
          <Textarea value={unableNote} onChange={(e) => setUnableNote(e.target.value)} placeholder="Reason (e.g. missing docs, port conditions, duty dispute)…" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnableFor(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!unableFor) return;
              if (!unableNote.trim()) return toast.error("Please provide a reason");
              const bid = bids.find((b) => b.id === unableFor);
              const req = requests.find((r) => r.id === bid?.requestId);
              if (bid && req) markBidUnable(req.id, bid.id, unableNote.trim());
              toast.success("Marked as unable to proceed. Importer notified.");
              setUnableFor(null);
              setUnableNote("");
              setTick((t) => t + 1);
            }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
