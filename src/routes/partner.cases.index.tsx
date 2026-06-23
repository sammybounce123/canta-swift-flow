import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Download, ArrowRightLeft, Flag } from "lucide-react";
import { toast } from "sonner";
import {
  CASE_STATUSES, formatGBP, getSolicitor, statusTone, visibleCases, getMarketer,
  MARKETERS, SOLICITORS, canReassign, canSeeAllMarketers,
  type CaseStatus,
} from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { ReadinessBar } from "@/components/ReadinessBar";

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
  const [flagFor, setFlagFor] = useState<{ id: string; clientName: string } | null>(null);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

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
      <ReadinessBar status="Demo Preview" cue="Solicitor payouts are tracked from payment case to receipt." />
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
                      {flagged.has(c.id) && <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-700 border-amber-500/30 mr-1"><Flag className="h-3 w-3 mr-1" />Flagged for Review</Badge>}
                      <Button size="sm" variant="ghost" title="Flag case for review" onClick={() => setFlagFor({ id: c.id, clientName: c.clientName })}>
                        <Flag className="h-3.5 w-3.5" />
                      </Button>
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

      {flagFor && (
        <FlagDialog
          caseId={flagFor.id}
          clientName={flagFor.clientName}
          onClose={() => setFlagFor(null)}
          onSubmit={() => {
            setFlagged((prev) => { const next = new Set(prev); next.add(flagFor.id); return next; });
            setFlagFor(null);
            toast.success("Case flagged for review.");
          }}
        />
      )}
    </div>
  );
}

function FlagDialog({ caseId, clientName, onClose, onSubmit }: { caseId: string; clientName: string; onClose: () => void; onSubmit: () => void }) {
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("Funding mismatch");
  const [notes, setNotes] = useState("");
  const [doc, setDoc] = useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Flag case for review — {clientName} <span className="text-xs text-muted-foreground font-normal">({caseId})</span></DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Reason</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Short reason for flagging..." /></div>
          <div><Label>Risk category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Funding mismatch", "Name mismatch", "Suspicious source of funds", "Document issue", "Solicitor beneficiary issue", "Expired quote payment", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
          <div><Label>Supporting document (optional)</Label>
            <Input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) setDoc(f.name); }} />
            {doc && <div className="text-[11px] text-muted-foreground mt-1">{doc}</div>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (!reason.trim()) { toast.error("Reason is required"); return; } onSubmit(); }}>Submit flag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
