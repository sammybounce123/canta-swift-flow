import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tradeFiles, shipmentMilestones, fmtMoney } from "@/lib/mock";
import {
  ArrowLeft, FileText, FileCheck2, Calculator, Activity, Clock, CheckCircle2,
  AlertTriangle, Upload, Ship, MapPin, Building2, Factory, Truck, Calendar, Sparkles,
  Shield, MessageCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ImporterActions } from "@/components/ImporterActions";

export const Route = createFileRoute("/trade-desk/$fileId")({
  head: ({ params }) => ({ meta: [{ title: `${params.fileId} · Trade Desk — Canta` }] }),
  component: TradeFileDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Trade file not found. <Link to="/trade-desk" className="text-primary underline">Back to Trade Desk</Link>
    </div>
  ),
});

function TradeFileDetail() {
  const { fileId } = Route.useParams();
  const file = tradeFiles.find((f) => f.id === fileId);
  if (!file) throw notFound();

  const reachedIdx =
    file.status === "Drafting" ? 1 :
    file.status === "In Transit" ? 5 :
    file.status === "Arrived" ? 7 :
    file.status === "Cleared" ? 9 : 10;

  const nextAction = useMemo(() => {
    if (file.status === "Drafting") return "Confirm supplier and lock invoice";
    if (file.status === "In Transit") return "Track vessel and prepare clearing docs";
    if (file.status === "Arrived") return "Submit customs clearance documents";
    if (file.status === "Cleared") return "Arrange local delivery";
    return "Mark trade file as closed";
  }, [file.status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/trade-desk" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All trade files
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4 mt-2">
          <div>
            <div className="text-xs text-muted-foreground">{file.id}</div>
            <h1 className="text-2xl font-semibold mt-1">{file.name}</h1>
            <div className="text-sm text-muted-foreground mt-1">{file.goods}</div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-secondary text-secondary-foreground">{file.status}</Badge>
            <Badge variant="outline">Payment: {file.paymentStatus}</Badge>
            <Badge className="bg-accent/15 text-accent border-accent/30">Escrow: {file.escrow}</Badge>
            <RiskBadge risk={file.risk} />
          </div>
      </div>

      <Card className="p-4 shadow-card">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Quick actions on this trade file</div>
        <ImporterActions
          variant="tradefile"
          ctx={{
            tradeFileId: file.id,
            supplier: file.supplier,
            origin: file.origin,
            destination: file.destination,
            eta: file.eta,
            invoiceAmount: file.invoiceValue,
            currency: file.ccy,
          }}
        />
      </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Shipment Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="landed">Landed Cost</TabsTrigger>
          <TabsTrigger value="escrow">Escrow</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp History</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5">
          <Card className="p-6 shadow-card">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <Field icon={<Building2 className="h-3.5 w-3.5" />} label="Importer" value={file.importer} />
              <Field icon={<Factory className="h-3.5 w-3.5" />} label="Supplier" value={file.supplier} />
              <Field icon={<Truck className="h-3.5 w-3.5" />} label="Forwarder" value={file.forwarder} />
              <Field icon={<Ship className="h-3.5 w-3.5" />} label="Shipment type" value="Container · FCL" />
              <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Origin" value={file.origin} />
              <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Destination" value={file.destination} />
              <Field icon={<Calendar className="h-3.5 w-3.5" />} label="ETA" value={file.eta} />
              <Field label="Invoice value" value={fmtMoney(file.invoiceValue, file.ccy)} highlight />
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="p-5 shadow-card lg:col-span-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
              <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> Next action
              </div>
              <div className="text-lg font-semibold mt-2">{nextAction}</div>
              <div className="text-sm text-muted-foreground mt-1">
                ETA {file.eta} · Current stage: <span className="font-medium text-foreground">{shipmentMilestones[reachedIdx - 1]}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={() => toast.success("Action assigned")}>Assign to teammate</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Reminder set")}>Set reminder</Button>
              </div>
            </Card>
            <Card className="p-5 shadow-card">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Clearing readiness</div>
              <div className="mt-3 space-y-2 text-sm">
                <ReadyRow label="Invoice on file" ok />
                <ReadyRow label="Packing list" ok />
                <ReadyRow label="Bill of lading" ok={file.status !== "Drafting"} />
                <ReadyRow label="Form M / SONCAP" ok={file.status === "Cleared" || file.status === "Delivered"} />
                <ReadyRow label="Duty paid" ok={file.status === "Cleared" || file.status === "Delivered"} />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="p-6 shadow-card">
            <div className="text-sm font-semibold flex items-center gap-2"><Activity className="h-4 w-4" /> Shipment timeline</div>
            <div className="mt-5 space-y-3">
              {shipmentMilestones.map((m, i) => {
                const reached = i < reachedIdx;
                const current = i === reachedIdx - 1;
                return (
                  <div key={m} className="flex items-start gap-3">
                    <div className={`mt-0.5 h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold flex-shrink-0 ${
                      current ? "bg-accent text-accent-foreground" :
                      reached ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"
                    }`}>
                      {reached ? "✓" : i + 1}
                    </div>
                    <div className="flex-1 pb-2 border-b border-border/50">
                      <div className={`text-sm ${reached ? "font-medium" : "text-muted-foreground"}`}>{m}</div>
                      {current && <div className="text-[11px] text-accent mt-0.5">Current stage · Updated 2h ago</div>}
                      {reached && !current && <div className="text-[11px] text-muted-foreground mt-0.5">Completed</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Documents fileStatus={file.status} />
        </TabsContent>

        <TabsContent value="payments">
          <Payments file={file} />
        </TabsContent>

        <TabsContent value="landed">
          <LandedCost value={file.invoiceValue} />
        </TabsContent>

        <TabsContent value="escrow">
          <Card className="p-6 shadow-card">
            <div className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4" /> Escrow protection</div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border bg-secondary/30">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Escrow status</div>
                <div className="mt-2 text-lg font-semibold">{file.escrow}</div>
                <div className="text-[11px] text-muted-foreground mt-1">Funds held by Canta until milestones clear</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-secondary/30">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Held amount</div>
                <div className="mt-2 text-lg font-semibold tabular-nums">{fmtMoney(file.invoiceValue, file.ccy)}</div>
                <div className="text-[11px] text-muted-foreground mt-1">Released against BL + delivery proof</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-secondary/30">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Dispute</div>
                <div className="mt-2 text-lg font-semibold">None</div>
                <div className="text-[11px] text-muted-foreground mt-1">Open dispute window: 7 days post-delivery</div>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {[
                { l: "Order confirmed by supplier", done: true },
                { l: "Goods ready at origin", done: file.status !== "Drafting" },
                { l: "Bill of lading uploaded", done: file.status !== "Drafting" },
                { l: "Goods received at warehouse", done: file.status === "Arrived" || file.status === "Cleared" || file.status === "Delivered" },
                { l: "Customs cleared", done: file.status === "Cleared" || file.status === "Delivered" },
                { l: "Delivered to importer", done: file.status === "Delivered" },
              ].map((m) => (
                <div key={m.l} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border text-sm">
                  <div className="flex items-center gap-2">
                    {m.done ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    {m.l}
                  </div>
                  <Badge variant="outline" className="text-[10px]">{m.done ? "Cleared" : "Pending"}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => toast.success("Escrow release requested")}>Request release</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Dispute opened")}>Open dispute</Button>
              <Button size="sm" variant="ghost" onClick={() => toast.info("Funds secured certificate downloaded")}>Download certificate</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card className="p-6 shadow-card">
            <div className="text-sm font-semibold flex items-center gap-2"><MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp conversation history</div>
            <div className="text-xs text-muted-foreground mt-1">All messages between the importer, supplier, freight and Canta agent for {file.id}</div>
            <div className="mt-5 space-y-3">
              {[
                { who: "Importer", side: "in", t: "Mon 9:14 AM", m: "Pls confirm vessel ETA for my container." },
                { who: "Canta Agent", side: "out", t: "Mon 9:18 AM", m: `Hi, vessel for ${file.id} is on schedule. ETA ${file.eta}. I'll send BL once forwarder uploads it.` },
                { who: "Forwarder", side: "in", t: "Tue 11:02 AM", m: "BL uploaded. Customs prep started." },
                { who: "Canta Bot", side: "out", t: "Tue 11:03 AM", m: "📄 BL automatically attached to trade file." },
                { who: "Supplier", side: "in", t: "Wed 2:31 PM", m: "Balance payment received via Canta escrow. Thank you." },
                { who: "Importer", side: "in", t: "Today 8:42 AM", m: "How much duty should I expect?" },
                { who: "Canta Agent", side: "out", t: "Today 8:45 AM", m: "Estimated landed cost is in the trade file. Duty ≈ 18% of invoice value." },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.side === "out" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.side === "out" ? "bg-[#25D366]/15 border border-[#25D366]/30" : "bg-secondary/50 border border-border"}`}>
                    <div className="text-[10px] font-semibold text-muted-foreground">{msg.who} · {msg.t}</div>
                    <div className="mt-1">{msg.m}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <Input placeholder="Reply to importer on WhatsApp…" />
              <Button onClick={() => toast.success("Message sent on WhatsApp")} className="bg-[#25D366] hover:bg-[#1FB855] text-white">Send</Button>
            </div>
          </Card>
        </TabsContent>


        <TabsContent value="activity">
          <Card className="p-6 shadow-card">
            <div className="text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4" /> Activity log</div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { t: "2h ago", e: "WhatsApp alert sent to importer about ETA update", who: "Canta Bot" },
                { t: "Yesterday", e: "Bill of lading uploaded by Dragon Freight", who: "Freight Forwarder" },
                { t: "2 days ago", e: "Supplier payment marked as partial (60%)", who: "Kunle A." },
                { t: "3 days ago", e: "Trade file created from WhatsApp", who: "Trade Officer" },
              ].map((l) => (
                <div key={l.e} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                  <div className="flex-1">
                    <div>{l.e}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{l.t} · by {l.who}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ icon, label, value, highlight }: { icon?: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">{icon} {label}</div>
      <div className={`text-sm mt-1 ${highlight ? "font-semibold text-accent text-base" : "font-medium"}`}>{value}</div>
    </div>
  );
}

function ReadyRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      {ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const cls =
    risk === "High" ? "bg-destructive/15 text-destructive border-destructive/30"
    : risk === "Medium" ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
    : "bg-success/15 text-success border-success/30";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cls}`}>{risk} risk</span>;
}

function Documents({ fileStatus }: { fileStatus: string }) {
  const [docs, setDocs] = useState([
    { name: "Supplier invoice", uploaded: true, required: true },
    { name: "Packing list", uploaded: true, required: true },
    { name: "Bill of lading", uploaded: fileStatus !== "Drafting", required: true },
    { name: "Freight invoice", uploaded: fileStatus === "Arrived" || fileStatus === "Delivered", required: true },
    { name: "Payment receipt", uploaded: true, required: true },
    { name: "Customs / clearing documents", uploaded: fileStatus === "Delivered", required: true },
    { name: "Insurance certificate", uploaded: true, required: true },
    { name: "Delivery note", uploaded: fileStatus === "Delivered", required: false },
  ]);

  const uploaded = docs.filter((d) => d.uploaded).length;

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Document checklist</div>
          <div className="text-xs text-muted-foreground mt-1">{uploaded} of {docs.length} uploaded</div>
        </div>
        <Button size="sm" onClick={() => toast.success("Bulk upload coming soon")}>
          <Upload className="h-4 w-4 mr-1.5" /> Upload documents
        </Button>
      </div>
      <div className="mt-5 grid gap-2">
        {docs.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border">
            <div className="flex items-center gap-2 text-sm">
              {d.uploaded
                ? <CheckCircle2 className="h-4 w-4 text-success" />
                : <AlertTriangle className="h-4 w-4 text-amber-500" />}
              <span className="font-medium">{d.name}</span>
              {d.required && !d.uploaded && <Badge variant="outline" className="text-[10px]">Required</Badge>}
            </div>
            <div className="flex gap-2">
              {d.uploaded ? (
                <Button size="sm" variant="ghost" onClick={() => toast.info("Opening preview…")}>View</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => {
                  const next = [...docs]; next[i] = { ...d, uploaded: true }; setDocs(next);
                  toast.success(`${d.name} uploaded`);
                }}>
                  <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Payments({ file }: { file: typeof tradeFiles[number] }) {
  const supplierAmt = file.invoiceValue;
  const supplierPaid = file.paymentStatus === "Paid" ? supplierAmt : file.paymentStatus === "Partial" ? Math.round(supplierAmt * 0.6) : 0;
  const freight = Math.round(file.invoiceValue * 0.08);
  const duty = Math.round(file.invoiceValue * 0.18 * 1612);
  const insurance = Math.round(file.invoiceValue * 0.012);

  const rows = [
    { label: "Supplier payment", total: supplierAmt, paid: supplierPaid, ccy: file.ccy, ref: "WIRE-552-AB", status: file.paymentStatus, escrow: file.escrow },
    { label: "Freight invoice", total: freight, paid: file.status === "Arrived" || file.status === "Delivered" ? freight : 0, ccy: file.ccy, ref: "FRT-908-21", status: file.status === "Arrived" || file.status === "Delivered" ? "Paid" : "Pending" },
    { label: "Duty & clearing", total: duty, paid: file.status === "Cleared" || file.status === "Delivered" ? duty : 0, ccy: "NGN", ref: "CUS-441-77", status: file.status === "Cleared" || file.status === "Delivered" ? "Paid" : "Pending" },
    { label: "Insurance", total: insurance, paid: insurance, ccy: file.ccy, ref: "INS-220-09", status: "Paid" },
  ];

  return (
    <Card className="p-6 shadow-card">
      <div className="text-sm font-semibold flex items-center gap-2"><FileCheck2 className="h-4 w-4" /> Payments</div>
      <div className="mt-5 grid gap-3">
        {rows.map((r) => {
          const outstanding = r.total - r.paid;
          const pct = Math.round((r.paid / r.total) * 100);
          return (
            <div key={r.label} className="p-4 rounded-lg border border-border bg-secondary/30">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-sm font-semibold">{r.label}</div>
                  <div className="text-[11px] text-muted-foreground">Ref {r.ref}{r.escrow ? ` · Escrow ${r.escrow}` : ""}</div>
                </div>
                <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                <div><div className="text-muted-foreground">Total</div><div className="font-semibold tabular-nums">{fmtMoney(r.total, r.ccy)}</div></div>
                <div><div className="text-muted-foreground">Paid</div><div className="font-semibold tabular-nums text-success">{fmtMoney(r.paid, r.ccy)}</div></div>
                <div><div className="text-muted-foreground">Outstanding</div><div className={`font-semibold tabular-nums ${outstanding > 0 ? "text-amber-600" : ""}`}>{fmtMoney(outstanding, r.ccy)}</div></div>
              </div>
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function LandedCost({ value }: { value: number }) {
  const [goods, setGoods] = useState(value);
  const [fx, setFx] = useState(1612);
  const [freight, setFreight] = useState(Math.round(value * 0.08));
  const [insurance, setInsurance] = useState(Math.round(value * 0.012));
  const [duty, setDuty] = useState(Math.round(value * 0.18));
  const [clearing, setClearing] = useState(Math.round(value * 0.04));
  const [terminal, setTerminal] = useState(Math.round(value * 0.015));
  const [delivery, setDelivery] = useState(800);
  const [other, setOther] = useState(0);
  const [margin, setMargin] = useState(28);

  const totalUsd = goods + freight + insurance + duty + clearing + terminal + delivery + other;
  const totalNgn = Math.round(totalUsd * fx);
  const expectedSale = Math.round(totalNgn * (1 + margin / 100));
  const profit = expectedSale - totalNgn;

  const inputs: [string, number, (v: number) => void, string?][] = [
    ["Goods cost (USD)", goods, setGoods],
    ["FX rate (NGN/USD)", fx, setFx],
    ["Freight (USD)", freight, setFreight],
    ["Insurance (USD)", insurance, setInsurance],
    ["Duty estimate (USD)", duty, setDuty],
    ["Clearing (USD)", clearing, setClearing],
    ["Port / terminal (USD)", terminal, setTerminal],
    ["Local delivery (USD)", delivery, setDelivery],
    ["Repairs / other (USD)", other, setOther],
    ["Target margin %", margin, setMargin],
  ];

  return (
    <Card className="p-6 shadow-card border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
      <div className="text-sm font-semibold flex items-center gap-2"><Calculator className="h-4 w-4 text-accent" /> Landed cost calculator</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
        <div className="grid grid-cols-2 gap-3">
          {inputs.map(([label, val, set]) => (
            <div key={label}>
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
              <Input type="number" value={val} onChange={(e) => set(Number(e.target.value) || 0)} className="mt-1 tabular-nums" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Row label="Total landed cost (USD)" v={fmtMoney(totalUsd, "USD")} />
          <Row label="Total landed cost (NGN)" v={`₦${totalNgn.toLocaleString()}`} highlight />
          <Row label={`Expected sale (${margin}% margin)`} v={`₦${expectedSale.toLocaleString()}`} />
          <Row label="Expected profit" v={`₦${profit.toLocaleString()}`} success />
          <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-xs mt-2">
            At <span className="font-semibold">{margin}%</span> margin, this trade returns <span className="font-semibold">₦{profit.toLocaleString()}</span> on landed cost of <span className="font-semibold">₦{totalNgn.toLocaleString()}</span>.
          </div>
          <Button className="w-full" onClick={() => toast.success("Landed cost saved to trade file")}>Save to trade file</Button>
        </div>
      </div>
    </Card>
  );
}

function Row({ label, v, highlight, success }: { label: string; v: string; highlight?: boolean; success?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold tabular-nums ${highlight ? "text-accent text-base" : success ? "text-success" : ""}`}>{v}</div>
    </div>
  );
}
