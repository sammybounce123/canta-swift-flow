import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, Receipt, FileCheck2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { CASES, SOLICITORS, formatGBP, getSolicitor, statusTone } from "@/lib/partner";

export const Route = createFileRoute("/partner/payouts")({
  head: () => ({ meta: [{ title: "Solicitor Payouts — Baron & Cabot" }] }),
  component: Payouts,
});

function Payouts() {
  const [solicitor, setSolicitor] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => CASES.filter((c) => ["Paid to Solicitor", "Receipt Uploaded", "Payout Processing", "Failed / Returned"].includes(c.status))
    .filter((c) => (solicitor === "all" || c.solicitorId === solicitor))
    .filter((c) => {
      if (status === "all") return true;
      if (status === "successful") return ["Paid to Solicitor", "Receipt Uploaded"].includes(c.status);
      if (status === "pending") return c.status === "Payout Processing";
      if (status === "failed") return c.status === "Failed / Returned";
      return true;
    })
    .filter((c) => q === "" || c.clientName.toLowerCase().includes(q.toLowerCase()) || c.property.toLowerCase().includes(q.toLowerCase()))
  , [solicitor, status, q]);

  const total = rows.reduce((s, c) => s + c.amountGBP, 0);
  const success = rows.filter((c) => ["Paid to Solicitor", "Receipt Uploaded"].includes(c.status)).length;
  const pending = rows.filter((c) => c.status === "Payout Processing").length;
  const failed = rows.filter((c) => c.status === "Failed / Returned").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Solicitor payouts</h1>
          <p className="text-sm text-muted-foreground mt-1">Every payout sent to UK solicitors on behalf of Baron &amp; Cabot clients.</p>
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
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client or property…" className="flex-1 min-w-[220px]" />
          <Select value={solicitor} onValueChange={setSolicitor}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="All solicitors" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All solicitors</SelectItem>
              {SOLICITORS.map((s) => <SelectItem key={s.id} value={s.id}>{s.firm}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed / Returned</SelectItem>
            </SelectContent>
          </Select>
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
                <th className="py-3 px-3">Solicitor firm</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const sol = getSolicitor(c.solicitorId)!;
                const receipted = c.status === "Receipt Uploaded" || c.status === "Paid to Solicitor";
                return (
                  <tr key={c.id} className="border-t hover:bg-secondary/30">
                    <td className="py-3 px-3 text-xs tabular-nums">{c.expectedPayout}</td>
                    <td className="py-3 px-3">{c.clientName}</td>
                    <td className="py-3 px-3"><div>{c.property}</div><div className="text-[11px] text-muted-foreground">{c.propertyLocation}</div></td>
                    <td className="py-3 px-3 text-xs">{sol.firm}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium">{formatGBP(c.amountGBP)}</td>
                    <td className="py-3 px-3"><Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>{c.status}</Badge></td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">BC/{c.id}/COMPL</td>
                    <td className="py-3 px-3">
                      {receipted ? (
                        <Button size="sm" variant="ghost" className="text-success"><FileCheck2 className="h-3.5 w-3.5 mr-1" /> Download</Button>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="text-center text-sm text-muted-foreground py-10">No payouts match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
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
