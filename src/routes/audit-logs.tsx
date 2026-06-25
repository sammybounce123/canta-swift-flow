import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, History } from "lucide-react";
import { toast } from "sonner";
import { useRequireWorkspace, useActiveWorkspace } from "@/lib/workspace-guard";

export const Route = createFileRoute("/audit-logs")({
  head: () => ({ meta: [{ title: "Activity Log — Canta" }] }),
  component: ActivityLogPage,
});

type Entry = { id: string; ts: string; module: string; action: string; target?: string; status: "Success" | "Pending" };

// Customer-scoped activity per workspace. Only the signed-in customer's own
// actions appear here — no Canta staff actions, no other organizations.
const BY_WS: Record<string, Entry[]> = {
  importer_portal: [
    { id: "A-1010", ts: "2026-06-23 09:14", module: "Trade Files",    action: "Trade file created",        target: "TF-2026-0214",            status: "Success" },
    { id: "A-1011", ts: "2026-06-23 09:22", module: "Documents",      action: "Document uploaded",         target: "BL-FE-7711.pdf",          status: "Success" },
    { id: "A-1012", ts: "2026-06-23 10:35", module: "Payments",       action: "Payment link generated",    target: "PL-9921",                 status: "Success" },
    { id: "A-1013", ts: "2026-06-23 11:48", module: "Payments",       action: "Payment reviewed",          target: "PAY-4421",                status: "Success" },
    { id: "A-1014", ts: "2026-06-23 12:01", module: "Payments",       action: "Payment approved",          target: "PAY-4421",                status: "Success" },
    { id: "A-1015", ts: "2026-06-22 16:02", module: "Suppliers",      action: "Supplier added",            target: "Shenzhen LedTech",        status: "Success" },
    { id: "A-1016", ts: "2026-06-22 15:10", module: "Support",        action: "Support ticket opened",     target: "SUP-9001",                status: "Success" },
  ],
  freight_workspace: [
    { id: "A-2001", ts: "2026-06-23 08:40", module: "Shipments",      action: "Shipment updated",          target: "SHP-10421",               status: "Success" },
    { id: "A-2002", ts: "2026-06-23 09:55", module: "Invoices",       action: "Invoice created",           target: "INV-FF-2204",             status: "Success" },
    { id: "A-2003", ts: "2026-06-23 10:20", module: "Documents",      action: "Document uploaded",         target: "POD-10388.pdf",           status: "Success" },
    { id: "A-2004", ts: "2026-06-22 17:01", module: "Customers",      action: "Customer added",            target: "Balogun Trade",           status: "Success" },
  ],
  global_collections: [
    { id: "A-3001", ts: "2026-06-23 09:01", module: "Payment Links",  action: "Payment link generated",    target: "CL-3318",                 status: "Success" },
    { id: "A-3002", ts: "2026-06-23 09:45", module: "Reconciliation", action: "Payment reconciled",        target: "INV-2034",                status: "Success" },
    { id: "A-3003", ts: "2026-06-22 18:12", module: "Team",           action: "Team member invited",       target: "ops@lagosmedclinic.com",  status: "Success" },
  ],
  supplier_dashboard: [
    { id: "A-4001", ts: "2026-06-23 10:15", module: "Invoices",       action: "Invoice issued to buyer",   target: "INV-2030",                status: "Success" },
    { id: "A-4002", ts: "2026-06-23 11:02", module: "Escrow",         action: "Escrow release requested",  target: "ESC-7711",                status: "Pending" },
  ],
  enterprise_treasury: [
    { id: "A-5001", ts: "2026-06-23 09:14", module: "FX",             action: "FX quote generated",        target: "USD→NGN @ 1,612.40",      status: "Success" },
    { id: "A-5002", ts: "2026-06-23 10:35", module: "Payments",       action: "Payment approved",          target: "TX-9921",                 status: "Success" },
    { id: "A-5003", ts: "2026-06-23 11:00", module: "Beneficiaries",  action: "Beneficiary added",         target: "Shenzhen LedTech",        status: "Success" },
  ],
  global_spend_cards: [],
  partner_property: [
    { id: "A-7001", ts: "2026-06-23 11:02", module: "Solicitors",     action: "Beneficiary added",         target: "Quinn Solicitors LLP",    status: "Success" },
    { id: "A-7002", ts: "2026-06-23 11:14", module: "Solicitors",     action: "Solicitor edited",          target: "Quinn Solicitors LLP",    status: "Success" },
  ],
};

function ActivityLogPage() {
  useRequireWorkspace();
  const ws = useActiveWorkspace();
  const entries = BY_WS[ws.workspace] ?? BY_WS.enterprise_treasury;

  const [q, setQ] = useState("");
  const [mod, setMod] = useState<string>("all");
  const modules = useMemo(() => Array.from(new Set(entries.map((e) => e.module))), [entries]);
  const filtered = entries.filter((e) =>
    (mod === "all" || e.module === mod) &&
    (q === "" || e.action.toLowerCase().includes(q.toLowerCase()) || (e.target ?? "").toLowerCase().includes(q.toLowerCase()))
  );

  function exportCsv() {
    if (typeof window === "undefined") return;
    const rows = [["Time", "Module", "Action", "Target", "Status"]];
    filtered.forEach((e) => rows.push([e.ts, e.module, e.action, e.target ?? "", e.status]));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `activity-log-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Activity log exported");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Activity Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Your own account activity across this workspace.</p>
          <div className="text-[11px] text-muted-foreground mt-1">Signed in as <span className="font-semibold text-foreground">{ws.name}</span> · {ws.title} · <Badge variant="outline" className="ml-1 text-[10px]">{ws.badge}</Badge></div>
        </div>
        <Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>
      </div>

      <Card className="p-3 shadow-card flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search action or reference…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="min-w-[180px]">
          <Select value={mod} onValueChange={setMod}>
            <SelectTrigger><SelectValue placeholder="Module" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-xs text-muted-foreground">{e.ts}</TableCell>
                <TableCell className="text-xs">{e.module}</TableCell>
                <TableCell className="text-sm">{e.action}</TableCell>
                <TableCell className="text-xs font-mono">{e.target ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] ${e.status === "Success" ? "bg-success/15 text-success border-success/30" : "bg-warning/15 text-warning border-warning/30"}`}>{e.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No activity matches your filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
