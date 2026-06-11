import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Download, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import {
  CASE_STATUSES, formatGBP, getSolicitor, statusTone, visibleCases, getMarketer,
  MARKETERS, SOLICITORS, canReassign, canSeeAllMarketers,
  type CaseStatus,
} from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";

export const Route = createFileRoute("/partner/cases/")({
  head: () => ({ meta: [{ title: "Client Payment Cases — Baron & Cabot" }] }),
  component: CasesList,
});

function CasesList() {
  const { role, userId } = usePartnerRole();
  const data = visibleCases(userId, role);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CaseStatus | "all">("all");
  const [marketer, setMarketer] = useState<string>("all");
  const [solicitor, setSolicitor] = useState<string>("all");

  const showMarketerFilter = canSeeAllMarketers(role);

  const rows = useMemo(() => {
    return data.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (marketer !== "all" && c.assignedMarketerId !== marketer) return false;
      if (solicitor !== "all" && c.solicitorId !== solicitor) return false;
      if (q) {
        const t = q.toLowerCase();
        return c.clientName.toLowerCase().includes(t)
          || c.property.toLowerCase().includes(t)
          || c.ref.toLowerCase().includes(t)
          || c.clientEmail.toLowerCase().includes(t);
      }
      return true;
    });
  }, [data, q, status, marketer, solicitor]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Client payment cases</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "marketer" ? "Your referred clients and their payment progress." : "All Baron & Cabot referred clients across the team."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>
          <Button asChild className="bg-primary">
            <Link to="/partner/new-referral"><Plus className="h-4 w-4 mr-1.5" /> New referral</Link>
          </Button>
        </div>
      </div>

      <Card className="p-4 shadow-card">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client, property, ref…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as CaseStatus | "all")}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {CASE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={solicitor} onValueChange={setSolicitor}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Solicitor" /></SelectTrigger>
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
          <div className="text-xs text-muted-foreground ml-auto">{rows.length} of {data.length} cases</div>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Property</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Solicitor</th>
                <th className="py-3 px-3">Status</th>
                {showMarketerFilter && <th className="py-3 px-3">Marketer</th>}
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3">Expected payout</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const sol = getSolicitor(c.solicitorId);
                const m = getMarketer(c.assignedMarketerId);
                return (
                  <tr key={c.id} className="border-t hover:bg-secondary/30">
                    <td className="py-3 px-3">
                      <div className="font-medium">{c.clientName}</div>
                      <div className="text-[11px] text-muted-foreground">{c.ref}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{c.property}</div>
                      <div className="text-[11px] text-muted-foreground">{c.propertyLocation}</div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium">{formatGBP(c.amountGBP)}</td>
                    <td className="py-3 px-3 text-xs">{sol?.firm}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>{c.status}</Badge>
                    </td>
                    {showMarketerFilter && <td className="py-3 px-3 text-xs">{m?.name ?? "—"}</td>}
                    <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">{c.createdAt}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">{c.expectedPayout}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {canReassign(role) && (
                        <Button size="sm" variant="ghost" onClick={() => toast.success("Case reassigned", { description: `${c.clientName} · activity log updated.` })}>
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/partner/cases/$caseId" params={{ caseId: c.id }}>View</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={showMarketerFilter ? 9 : 8} className="text-center text-sm text-muted-foreground py-10">No cases match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
