import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tradeFiles, shipmentMilestones, fmtMoney } from "@/lib/mock";
import { FileText, Plus, Calculator, FileCheck2, AlertTriangle, CheckCircle2, Clock, Activity } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/trade-desk")({
  head: () => ({ meta: [{ title: "Trade Desk — Canta" }] }),
  component: TradeDesk,
});

function TradeDesk() {
  const [selected, setSelected] = useState(tradeFiles[0].id);
  const file = tradeFiles.find((f) => f.id === selected)!;

  const docs = [
    { name: "Supplier invoice", uploaded: true },
    { name: "Packing list", uploaded: true },
    { name: "Bill of lading", uploaded: file.status !== "Drafting" },
    { name: "Freight invoice", uploaded: file.status === "Arrived" || file.status === "Delivered" },
    { name: "Customs / clearing docs", uploaded: file.status === "Delivered" },
    { name: "Insurance certificate", uploaded: true },
    { name: "Delivery note", uploaded: file.status === "Delivered" },
  ];

  const reachedIdx = file.status === "Drafting" ? 1 : file.status === "In Transit" ? 5 : file.status === "Arrived" ? 7 : file.status === "Cleared" ? 9 : 10;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Trade Desk</h1>
          <p className="text-sm text-muted-foreground mt-1">Central operating system for importers and freight forwarders.</p>
        </div>
        <Button onClick={() => toast.success("New trade file drafted")} className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> New Trade File</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Files list */}
        <Card className="lg:col-span-1 p-3 shadow-card max-h-[640px] overflow-y-auto">
          <div className="text-xs uppercase tracking-widest text-muted-foreground px-2 py-2">Trade files</div>
          <div className="space-y-1">
            {tradeFiles.map((f) => (
              <button key={f.id} onClick={() => setSelected(f.id)} className={`w-full text-left p-3 rounded-lg border ${selected === f.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-secondary"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{f.name}</div>
                    <div className="text-[11px] text-muted-foreground">{f.id} · {f.origin} → {f.destination}</div>
                  </div>
                  <RiskBadge risk={f.risk} />
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px]">
                  <Badge variant="outline">{f.status}</Badge>
                  <span className="text-muted-foreground">{fmtMoney(f.invoiceValue, f.ccy)}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Detail */}
        <div className="lg:col-span-3 space-y-5">
          {/* Overview */}
          <Card className="p-6 shadow-card">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-muted-foreground">{file.id}</div>
                <h2 className="text-xl font-semibold mt-1">{file.name}</h2>
                <div className="text-sm text-muted-foreground mt-1">{file.goods}</div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-secondary text-secondary-foreground">{file.status}</Badge>
                <Badge className="bg-accent/15 text-accent-foreground border-accent/30">Escrow: {file.escrow}</Badge>
                <RiskBadge risk={file.risk} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                ["Importer", file.importer],
                ["Supplier", file.supplier],
                ["Forwarder", file.forwarder],
                ["ETA", file.eta],
                ["Invoice value", fmtMoney(file.invoiceValue, file.ccy)],
                ["Payment", file.paymentStatus],
                ["Origin", file.origin],
                ["Destination", file.destination],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
                  <div className="text-sm font-medium mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Timeline + Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-6 shadow-card">
              <div className="text-sm font-semibold flex items-center gap-2"><Activity className="h-4 w-4" /> Shipment timeline</div>
              <div className="mt-4 space-y-3 relative">
                {shipmentMilestones.map((m, i) => {
                  const reached = i < reachedIdx;
                  const current = i === reachedIdx - 1;
                  return (
                    <div key={m} className="flex items-start gap-3">
                      <div className={`mt-0.5 h-5 w-5 rounded-full grid place-items-center text-[10px] font-bold flex-shrink-0 ${current ? "bg-accent text-accent-foreground" : reached ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"}`}>
                        {reached ? "✓" : i + 1}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm ${reached ? "font-medium" : "text-muted-foreground"}`}>{m}</div>
                        {current && <div className="text-[11px] text-accent">Current stage</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <div className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Documents</div>
              <div className="mt-4 space-y-2">
                {docs.map((d) => (
                  <div key={d.name} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border">
                    <div className="flex items-center gap-2 text-sm">
                      {d.uploaded ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      {d.name}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => toast.success(`Uploaded ${d.name}`)}>{d.uploaded ? "View" : "Upload"}</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Payments + Landed cost */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-6 shadow-card">
              <div className="text-sm font-semibold flex items-center gap-2"><FileCheck2 className="h-4 w-4" /> Payments</div>
              <div className="mt-4 space-y-3 text-sm">
                <PayRow label="Supplier payment" amount={file.invoiceValue} ccy={file.ccy} status={file.paymentStatus} />
                <PayRow label="Freight" amount={Math.round(file.invoiceValue * 0.08)} ccy={file.ccy} status="Pending" />
                <PayRow label="Duty & clearing" amount={Math.round(file.invoiceValue * 0.18)} ccy="NGN" status="Pending" />
                <PayRow label="Insurance" amount={Math.round(file.invoiceValue * 0.012)} ccy={file.ccy} status="Paid" />
              </div>
            </Card>

            <LandedCost value={file.invoiceValue} />
          </div>

          {/* Activity log */}
          <Card className="p-6 shadow-card">
            <div className="text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4" /> Activity log</div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { t: "2h ago", e: "WhatsApp alert sent to importer about ETA update" },
                { t: "Yesterday", e: "Bill of lading uploaded by Dragon Freight" },
                { t: "2 days ago", e: "Supplier payment marked as partial (60%)" },
                { t: "3 days ago", e: "Trade file created from WhatsApp by Trade Officer" },
              ].map((l) => (
                <div key={l.e} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                  <div className="flex-1"><div>{l.e}</div><div className="text-xs text-muted-foreground">{l.t}</div></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const cls = risk === "High" ? "bg-destructive/15 text-destructive border-destructive/30" : risk === "Medium" ? "bg-amber-500/15 text-amber-700 border-amber-500/30" : "bg-success/15 text-success border-success/30";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cls}`}>{risk} risk</span>;
}

function PayRow({ label, amount, ccy, status }: { label: string; amount: number; ccy: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border">
      <div>{label}</div>
      <div className="flex items-center gap-3">
        <span className="font-semibold tabular-nums">{fmtMoney(amount, ccy)}</span>
        <Badge variant="outline" className="text-[10px]">{status}</Badge>
      </div>
    </div>
  );
}

function LandedCost({ value }: { value: number }) {
  const [fx] = useState(1612);
  const freight = Math.round(value * 0.08);
  const insurance = Math.round(value * 0.012);
  const duty = Math.round(value * 0.18);
  const clearing = Math.round(value * 0.04);
  const delivery = 800;
  const totalUsd = value + freight + insurance + duty + clearing + delivery;
  const totalNgn = totalUsd * fx;
  const expectedSale = Math.round(totalNgn * 1.28);
  return (
    <Card className="p-6 shadow-card border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
      <div className="text-sm font-semibold flex items-center gap-2"><Calculator className="h-4 w-4 text-accent" /> Landed cost</div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Goods" v={fmtMoney(value, "USD")} />
        <Stat label="FX rate" v={`₦${fx}/USD`} />
        <Stat label="Freight" v={fmtMoney(freight, "USD")} />
        <Stat label="Insurance" v={fmtMoney(insurance, "USD")} />
        <Stat label="Duty est." v={fmtMoney(duty, "USD")} />
        <Stat label="Clearing" v={fmtMoney(clearing, "USD")} />
        <Stat label="Local delivery" v={fmtMoney(delivery, "USD")} />
        <Stat label="Total landed (NGN)" v={`₦${totalNgn.toLocaleString()}`} highlight />
      </div>
      <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20 text-xs">
        Expected selling price <span className="font-semibold">₦{expectedSale.toLocaleString()}</span> · Margin <span className="font-semibold text-success">28%</span>
      </div>
    </Card>
  );
}

function Stat({ label, v, highlight }: { label: string; v: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold tabular-nums mt-0.5 ${highlight ? "text-accent" : ""}`}>{v}</div>
    </div>
  );
}
