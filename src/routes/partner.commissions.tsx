import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Percent, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { listCommissions, updateCommissionStatus, getSettings, COMMISSION_STATUSES, subscribeExtras, type CommissionStatus } from "@/lib/partner-extras";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { formatGBP } from "@/lib/partner";

export const Route = createFileRoute("/partner/commissions")({
  head: () => ({ meta: [{ title: "Commissions — Baron & Cabot" }] }),
  component: CommissionsPage,
});

function CommissionsPage() {
  const { role, userId } = usePartnerRole();
  const [, force] = useState(0);
  useEffect(() => subscribeExtras(() => force((n) => n + 1)), []);
  const settings = getSettings();
  if (!settings.commissionsEnabled) return <Navigate to="/partner" />;

  const isMarketer = role === "marketer";
  const canSeeAll = role === "partner_admin" || role === "finance_viewer" || role === "partner_manager";
  const forMarketer = isMarketer && settings.marketerSeesOwnCommission ? userId : undefined;
  const list = canSeeAll ? listCommissions() : listCommissions(forMarketer);

  const tone = (s: CommissionStatus) => ({
    "Paid": "bg-success/15 text-success border-success/30",
    "Approved": "bg-primary/15 text-primary border-primary/30",
    "Pending Approval": "bg-warning/15 text-warning border-warning/30",
    "Estimated": "bg-accent/15 text-accent border-accent/30",
    "Withheld": "bg-destructive/15 text-destructive border-destructive/30",
    "Cancelled": "bg-muted text-muted-foreground border-border",
  }[s]);

  const exportCSV = () => {
    const header = "ID,Case,Client,Marketer,Payout (GBP),Rate %,Estimated,Approved,Paid,Status,Payment Date\n";
    const rows = list.map((c) => [c.id, c.caseRef, c.clientName, c.marketerName, c.payoutAmount, (c.rate * 100).toFixed(2), c.estimated, c.approved ?? "", c.paid ?? "", c.status, c.paymentDate ?? ""].join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "commissions.csv"; a.click();
    toast.success("CSV exported");
  };

  const total = list.reduce((s, c) => s + (c.paid ?? c.approved ?? c.estimated), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Percent className="h-5 w-5 text-primary" /> Commissions</h1>
          <p className="text-sm text-muted-foreground mt-1">{isMarketer ? "Your attributed commission across closed cases." : "Partner & marketer commissions across all Baron & Cabot cases."}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1.5" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={() => { window.print(); }}><FileText className="h-4 w-4 mr-1.5" /> PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total commission" value={formatGBP(total)} />
        <Stat label="Paid" value={formatGBP(list.filter((c) => c.status === "Paid").reduce((s, c) => s + (c.paid ?? 0), 0))} />
        <Stat label="Approved" value={formatGBP(list.filter((c) => c.status === "Approved").reduce((s, c) => s + (c.approved ?? 0), 0))} />
        <Stat label="Pending approval" value={formatGBP(list.filter((c) => c.status === "Pending Approval").reduce((s, c) => s + c.estimated, 0))} />
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Case</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Marketer</th>
                <th className="py-3 px-3 text-right">Payout</th>
                <th className="py-3 px-3 text-right">Rate</th>
                <th className="py-3 px-3 text-right">Estimated</th>
                <th className="py-3 px-3 text-right">Paid</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t hover:bg-secondary/30">
                  <td className="py-3 px-3 font-mono text-xs">{c.caseRef}</td>
                  <td className="py-3 px-3">{c.clientName}</td>
                  <td className="py-3 px-3 text-xs">{c.marketerName}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{formatGBP(c.payoutAmount)}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{(c.rate * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 text-right tabular-nums">{formatGBP(c.estimated)}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{c.paid ? formatGBP(c.paid) : "—"}</td>
                  <td className="py-3 px-3"><Badge variant="outline" className={`text-[10px] ${tone(c.status)}`}>{c.status}</Badge></td>
                  <td className="py-3 px-3 text-right">
                    {canSeeAll && (
                      <Select value={c.status} onValueChange={(v) => { updateCommissionStatus(c.id, v as CommissionStatus); toast.success("Status updated"); }}>
                        <SelectTrigger className="h-7 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{COMMISSION_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={9} className="py-10 text-center text-sm text-muted-foreground"><CheckCircle2 className="h-5 w-5 inline mr-1.5" /> No commissions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 shadow-card">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums mt-1">{value}</div>
    </Card>
  );
}
