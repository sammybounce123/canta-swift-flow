import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import {
  LEAD_STATUSES, leadTone, visibleLeads, formatGBP, getMarketer,
  MARKETERS, canReassign, canSeeAllMarketers,
  type LeadStatus,
} from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/partner/leads")({
  head: () => ({ meta: [{ title: "Referral Leads — Baron & Cabot" }] }),
  component: Leads,
});

function Leads() {
  const { role, userId } = usePartnerRole();
  const data = visibleLeads(userId, role);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [marketer, setMarketer] = useState<string>("all");

  const rows = useMemo(() => data.filter((l) => {
    if (status !== "all" && l.status !== status) return false;
    if (marketer !== "all" && l.assignedMarketerId !== marketer) return false;
    if (q) {
      const t = q.toLowerCase();
      return l.clientName.toLowerCase().includes(t) || l.property.toLowerCase().includes(t) || l.clientEmail.toLowerCase().includes(t);
    }
    return true;
  }), [data, q, status, marketer]);

  const showMarketerCol = canSeeAllMarketers(role);

  return (
    <div className="space-y-5">
      <ReadinessBar status="Demo Preview" cue="Capture client consent before sharing payment instructions." />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Referral leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "marketer" ? "Your referral pipeline — work each lead to a payment case." : "All Baron & Cabot referral leads across the team."}
          </p>
        </div>
        <Button asChild className="bg-primary">
          <Link to="/partner/new-referral"><Plus className="h-4 w-4 mr-1.5" /> New referral</Link>
        </Button>
      </div>

      <Card className="p-4 shadow-card flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client, property…" className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus | "all")}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {showMarketerCol && (
          <Select value={marketer} onValueChange={setMarketer}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All marketers" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All marketers</SelectItem>
              {MARKETERS.filter((m) => m.role === "marketer").map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="text-xs text-muted-foreground ml-auto">{rows.length} leads</div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Property</th>
                <th className="py-3 px-3 text-right">Expected</th>
                <th className="py-3 px-3">Status</th>
                {showMarketerCol && <th className="py-3 px-3">Marketer</th>}
                <th className="py-3 px-3">Last touch</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const m = getMarketer(l.assignedMarketerId);
                return (
                  <tr key={l.id} className="border-t hover:bg-secondary/30">
                    <td className="py-3 px-3">
                      <div className="font-medium">{l.clientName}</div>
                      <div className="text-[11px] text-muted-foreground">{l.clientEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{l.property}</div>
                      <div className="text-[11px] text-muted-foreground">{l.propertyLocation}</div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium">{formatGBP(l.expectedAmountGBP)}</td>
                    <td className="py-3 px-3"><Badge variant="outline" className={`text-[10px] ${leadTone(l.status)}`}>{l.status}</Badge></td>
                    {showMarketerCol && <td className="py-3 px-3 text-xs">{m?.name ?? "—"}</td>}
                    <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">{l.lastTouch}</td>
                    <td className="py-3 px-3 text-right">
                      {canReassign(role) && (
                        <Button size="sm" variant="ghost" onClick={() => toast.success(`Reassignment recorded`, { description: `${l.clientName} · activity log updated.` })}>
                          <ArrowRightLeft className="h-3.5 w-3.5 mr-1" /> Reassign
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={showMarketerCol ? 7 : 6} className="text-center text-sm text-muted-foreground py-10">No leads match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
