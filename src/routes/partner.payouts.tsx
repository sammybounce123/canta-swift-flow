import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, Receipt, FileCheck2, CheckCircle2, Clock, AlertTriangle, Eye, Circle } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge as UiBadge } from "@/components/ui/badge";
import {
  SOLICITORS, formatGBP, getSolicitor, statusTone, visibleCases, getMarketer,
  MARKETERS, canSeeAllMarketers,
} from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/partner/payouts")({
  head: () => ({ meta: [{ title: "Solicitor Payouts — Kingsbridge Property Partners" }] }),
  component: Payouts,
});

function Payouts() {
  const { role, userId } = usePartnerRole();
  const data = visibleCases(userId, role);
  const [active, setActive] = useState<ReturnType<typeof visibleCases>[number] | null>(null);

  const [solicitor, setSolicitor] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [marketer, setMarketer] = useState<string>("all");
  const [q, setQ] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");
  const showMarketerFilter = canSeeAllMarketers(role);

  const rows = useMemo(() => data
    .filter((c) => ["Paid to Solicitor", "Receipt Uploaded", "Payout Processing", "Failed / Returned"].includes(c.status))
    .filter((c) => (solicitor === "all" || c.solicitorId === solicitor))
    .filter((c) => (marketer === "all" || c.assignedMarketerId === marketer))
    .filter((c) => {
      if (status === "all") return true;
      if (status === "successful") return ["Paid to Solicitor", "Receipt Uploaded"].includes(c.status);
      if (status === "pending") return c.status === "Payout Processing";
      if (status === "failed") return c.status === "Failed / Returned";
      return true;
    })
    .filter((c) => (minAmt === "" || c.amountGBP >= Number(minAmt)))
    .filter((c) => (maxAmt === "" || c.amountGBP <= Number(maxAmt)))
    .filter((c) => q === "" || c.clientName.toLowerCase().includes(q.toLowerCase()) || c.property.toLowerCase().includes(q.toLowerCase()))
  , [data, solicitor, status, marketer, q, minAmt, maxAmt]);

  const total = rows.reduce((s, c) => s + c.amountGBP, 0);
  const success = rows.filter((c) => ["Paid to Solicitor", "Receipt Uploaded"].includes(c.status)).length;
  const pending = rows.filter((c) => c.status === "Payout Processing").length;
  const failed = rows.filter((c) => c.status === "Failed / Returned").length;

  return (
    <div className="space-y-5">
      <ReadinessBar status="Requires Setup" cue="Solicitor payouts are tracked from payment case to receipt." />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Solicitor payouts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "marketer" ? "Payouts on your referred clients." : "Every payout sent to UK solicitors on behalf of Kingsbridge Property Partners clients."}
          </p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-1.5" /> Export</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat l="Total payout value" v={formatGBP(total)} icon={Receipt} tone="text-primary" />
        <Stat l="Successful" v={success.toString()} icon={CheckCircle2} tone="text-success" />
        <Stat l="Pending" v={pending.toString()} icon={Clock} tone="text-warning" />
        <Stat l="Failed / Returned" v={failed.toString()} icon={AlertTriangle} tone="text-destructive" />
      </div>

      <Card className="p-4 shadow-card">
        <div className="flex flex-wrap gap-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client or property…" className="flex-1 min-w-[200px]" />
          <Select value={solicitor} onValueChange={setSolicitor}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All solicitors" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All solicitors</SelectItem>
              {SOLICITORS.map((s) => <SelectItem key={s.id} value={s.id}>{s.firm}</SelectItem>)}
            </SelectContent>
          </Select>
          {showMarketerFilter && (
            <Select value={marketer} onValueChange={setMarketer}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Marketer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All marketers</SelectItem>
                {MARKETERS.filter((m) => m.role === "marketer").map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed / Returned</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" value={minAmt} onChange={(e) => setMinAmt(e.target.value)} placeholder="Min £" className="w-[110px]" />
          <Input type="number" value={maxAmt} onChange={(e) => setMaxAmt(e.target.value)} placeholder="Max £" className="w-[110px]" />
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Payout date</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Property</th>
                {showMarketerFilter && <th className="py-3 px-3">Marketer</th>}
                <th className="py-3 px-3">Solicitor</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Currency</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3"></th>
                <th className="py-3 px-3">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const sol = getSolicitor(c.solicitorId)!;
                const m = getMarketer(c.assignedMarketerId);
                const receipted = c.status === "Receipt Uploaded" || c.status === "Paid to Solicitor";
                return (
                  <tr key={c.id} className="border-t hover:bg-secondary/30">
                    <td className="py-3 px-3 text-xs tabular-nums">{c.expectedPayout}</td>
                    <td className="py-3 px-3">{c.clientName}</td>
                    <td className="py-3 px-3"><div>{c.property}</div><div className="text-[11px] text-muted-foreground">{c.propertyLocation}</div></td>
                    {showMarketerFilter && <td className="py-3 px-3 text-xs">{m?.name}</td>}
                    <td className="py-3 px-3 text-xs">{sol.firm}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium">{formatGBP(c.amountGBP)}</td>
                    <td className="py-3 px-3 text-xs">{c.currency}</td>
                    <td className="py-3 px-3"><Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>{c.status}</Badge></td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{c.paymentReference ?? `BC/${c.id}/COMPL`}</td>
                    <td className="py-3 px-3">
                      {receipted ? (
                        <Button size="sm" variant="ghost" className="text-success"><FileCheck2 className="h-3.5 w-3.5 mr-1" /> Download</Button>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setActive(c)}><Eye className="h-3.5 w-3.5 mr-1" /> Details</Button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={showMarketerFilter ? 12 : 11} className="text-center text-sm text-muted-foreground py-10">No payouts match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {active && <PayoutDetailDialog payout={active} onClose={() => setActive(null)} />}
    </div>
  );
}

type TimelineStage = "Initiated" | "Compliance Check" | "Funds Sent" | "Confirmed by Solicitor";
const STAGES: TimelineStage[] = ["Initiated", "Compliance Check", "Funds Sent", "Confirmed by Solicitor"];

function stageIndexForStatus(status: string): number {
  if (status === "Receipt Uploaded") return 4;
  if (status === "Paid to Solicitor") return 3;
  if (status === "Payout Processing") return 2;
  if (status === "Failed / Returned") return 1;
  return 0;
}

function PayoutDetailDialog({ payout, onClose }: { payout: ReturnType<typeof visibleCases>[number]; onClose: () => void }) {
  const sol = getSolicitor(payout.solicitorId);
  const completedCount = stageIndexForStatus(payout.status);
  const base = new Date(payout.expectedPayout || Date.now());
  const dateFor = (offsetDays: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() - (STAGES.length - offsetDays));
    return d.toISOString().slice(0, 10);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Payout · {payout.clientName}</DialogTitle></DialogHeader>
        <div className="text-xs text-muted-foreground">
          {payout.property} · {sol?.firm} · {formatGBP(payout.amountGBP)}
        </div>
        <div className="flex items-center gap-2">
          <UiBadge variant="outline" className={`text-[10px] ${statusTone(payout.status)}`}>{payout.status}</UiBadge>
          <span className="text-[11px] text-muted-foreground">Ref: {payout.paymentReference ?? `BC/${payout.id}/COMPL`}</span>
        </div>

        <div className="space-y-0 mt-2">
          {STAGES.map((stage, i) => {
            const idx = i + 1;
            const state: "completed" | "current" | "pending" =
              idx < completedCount ? "completed" : idx === completedCount ? "current" : "pending";
            const Icon = state === "completed" ? CheckCircle2 : state === "current" ? Clock : Circle;
            const tone =
              state === "completed" ? "text-success" : state === "current" ? "text-warning" : "text-muted-foreground";
            return (
              <div key={stage} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <Icon className={`h-4 w-4 ${tone}`} />
                  {i < STAGES.length - 1 && <div className={`w-px flex-1 min-h-[24px] ${idx < completedCount ? "bg-success/40" : "bg-border"}`} />}
                </div>
                <div className="pb-4">
                  <div className={`text-sm font-medium ${state === "pending" ? "text-muted-foreground" : ""}`}>{stage}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {state === "pending" ? "Pending" : dateFor(idx)}
                    {state === "current" ? " · In progress" : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ l, v, icon: Icon, tone }: { l: string; v: string; icon: React.ComponentType<{ className?: string }>; tone: string }) {
  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="text-xs text-muted-foreground">{l}</div>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <div className="text-2xl font-semibold mt-2 tabular-nums">{v}</div>
    </Card>
  );
}
