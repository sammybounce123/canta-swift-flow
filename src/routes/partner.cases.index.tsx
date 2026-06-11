import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Download } from "lucide-react";
import { CASES, CASE_STATUSES, formatGBP, getSolicitor, statusTone, type CaseStatus } from "@/lib/partner";

export const Route = createFileRoute("/partner/cases/")({
  head: () => ({ meta: [{ title: "Client Payment Cases — Baron & Cabot" }] }),
  component: CasesList,
});

function CasesList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CaseStatus | "all">("all");

  const rows = useMemo(() => {
    return CASES.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (q) {
        const t = q.toLowerCase();
        return c.clientName.toLowerCase().includes(t)
          || c.property.toLowerCase().includes(t)
          || c.ref.toLowerCase().includes(t)
          || c.clientEmail.toLowerCase().includes(t);
      }
      return true;
    });
  }, [q, status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Client Payment Cases</h1>
          <p className="text-sm text-muted-foreground mt-1">All Baron &amp; Cabot referred clients and their payment progress.</p>
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
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {CASE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground ml-auto">{rows.length} of {CASES.length} cases</div>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Property</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Solicitor</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3">Expected payout</th>
                <th className="py-3 px-3">Officer</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const sol = getSolicitor(c.solicitorId);
                return (
                  <tr key={c.id} className="border-t hover:bg-secondary/30">
                    <td className="py-3 px-3">
                      <div className="font-medium">{c.clientName}</div>
                      <div className="text-[11px] text-muted-foreground">{c.ref}</div>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">
                      <div>{c.clientEmail}</div>
                      <div>{c.clientPhone}</div>
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
                    <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">{c.createdAt}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">{c.expectedPayout}</td>
                    <td className="py-3 px-3 text-xs">{c.officer}</td>
                    <td className="py-3 px-3 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/partner/cases/$caseId" params={{ caseId: c.id }}>View</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={10} className="text-center text-sm text-muted-foreground py-10">No cases match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
