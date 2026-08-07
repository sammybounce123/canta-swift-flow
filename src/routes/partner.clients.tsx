import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Plus, Download } from "lucide-react";
import {
  visibleCases,
  statusTone,
  formatGBP,
  getMarketer,
  getSolicitor,
  CASE_STATUSES,
  type CaseStatus,
} from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";

export const Route = createFileRoute("/partner/clients")({
  head: () => ({ meta: [{ title: "Partner Clients — Kingsbridge Property Partners" }] }),
  component: PartnerClientsPage,
});

type Row = {
  client: string;
  marketer: string;
  property: string;
  caseStatus: CaseStatus;
  linkStatus: "Sent" | "Opened" | "Paid" | "None";
  fundingStatus: "Pending" | "Received" | "Held" | "Released";
  payoutStatus: "Awaiting" | "Scheduled" | "Paid";
  solicitor: string;
  lastActivity: string;
  caseId: string;
};

function PartnerClientsPage() {
  const { role, userId } = usePartnerRole();
  const cases = visibleCases(userId, role);

  const rows: Row[] = useMemo(
    () =>
      cases.map((c) => {
        const s = c.status;
        const isPaid = s === "Completed" || s === "Paid to Solicitor" || s === "Receipt Uploaded";
        const isReleased = s === "Completed" || s === "Receipt Uploaded";
        const linkSent =
          s === "Payment Link Sent" || s === "FX Quote Sent" || s === "Payment Link Generated";
        const fundingReceived =
          s === "Funding Received" ||
          s === "Funding Review" ||
          s === "FX Accepted" ||
          s === "FX Converted" ||
          s === "Payout Processing" ||
          isPaid;
        return {
          client: c.clientName,
          marketer: getMarketer(c.assignedMarketerId)?.name ?? "—",
          property: c.property,
          caseStatus: c.status,
          linkStatus: isPaid ? "Paid" : linkSent ? "Sent" : "None",
          fundingStatus: isReleased
            ? "Released"
            : isPaid
              ? "Held"
              : fundingReceived
                ? "Received"
                : "Pending",
          payoutStatus: isReleased
            ? "Paid"
            : s === "Payout Processing" || s === "Paid to Solicitor"
              ? "Scheduled"
              : "Awaiting",
          solicitor: getSolicitor(c.solicitorId)?.firm ?? "—",
          lastActivity: c.expectedPayout || c.createdAt,
          caseId: c.id,
        };
      }),
    [cases],
  );

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CaseStatus | "all">("all");
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === "all" || r.caseStatus === status) &&
          (!q ||
            [r.client, r.marketer, r.property, r.solicitor].some((v) =>
              v.toLowerCase().includes(q.toLowerCase()),
            )),
      ),
    [rows, q, status],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary shrink-0" /> Partner Clients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All Kingsbridge Property Partners referred clients — visible to your team only.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
          <Button asChild>
            <Link to="/partner/new-referral">
              <Plus className="h-4 w-4 mr-1.5" /> New referral
            </Link>
          </Button>
        </div>
      </div>

      <Card className="p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search client, marketer, property, solicitor..."
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as CaseStatus | "all")}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All case statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All case statuses</SelectItem>
              {CASE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Marketer</th>
                <th className="py-3 px-3">Property / Project</th>
                <th className="py-3 px-3">Case status</th>
                <th className="py-3 px-3">Payment link</th>
                <th className="py-3 px-3">Funding</th>
                <th className="py-3 px-3">Payout</th>
                <th className="py-3 px-3">Solicitor</th>
                <th className="py-3 px-3">Last activity</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.caseId} className="border-t hover:bg-secondary/30">
                  <td className="py-3 px-3 font-medium">{r.client}</td>
                  <td className="py-3 px-3 text-xs">{r.marketer}</td>
                  <td className="py-3 px-3 text-xs">{r.property}</td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className={`text-[10px] ${statusTone(r.caseStatus)}`}>
                      {r.caseStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-xs">{r.linkStatus}</td>
                  <td className="py-3 px-3 text-xs">{r.fundingStatus}</td>
                  <td className="py-3 px-3 text-xs">{r.payoutStatus}</td>
                  <td className="py-3 px-3 text-xs">{r.solicitor}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">
                    {r.lastActivity}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/partner/cases/$caseId" params={{ caseId: r.caseId }}>
                        Open
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-sm text-muted-foreground py-10">
                    No clients match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
