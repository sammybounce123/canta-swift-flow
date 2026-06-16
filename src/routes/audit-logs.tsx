import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download, Search, FileText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs — Canta" }] }),
  component: AuditLogsPage,
});

type Entry = {
  id: string;
  ts: string;
  user: string;
  role: string;
  org: string;
  workspace: string;
  module: string;
  action: string;
  oldVal?: string;
  newVal?: string;
  ip?: string;
  status: "Success" | "Failed" | "Pending";
  details?: string;
};

const ACTIONS = [
  "login", "workspace switch", "document upload", "document deletion",
  "FX quote generated", "payment link generated", "payment link opened",
  "BVN submitted", "consent completed", "funding instruction shown",
  "funding received", "FX converted", "payout sent", "payout receipt uploaded",
  "beneficiary created", "solicitor edited", "card frozen", "card unfrozen",
  "approval decision", "role change", "case reassignment", "verification decision",
  "status change",
];

const SEED: Entry[] = Array.from({ length: 36 }).map((_, i) => {
  const day = String(((i % 28) + 1)).padStart(2, "0");
  const hr = String(((i * 7) % 24)).padStart(2, "0");
  const action = ACTIONS[i % ACTIONS.length];
  const users = ["Adaeze O.", "Charlotte Baron", "James Hartmann", "Tola A.", "Felix M.", "Operator #4"];
  const roles = ["Owner", "Partner Admin", "Compliance", "Marketer", "Staff", "Operator"];
  const orgs = ["Canta", "Baron & Cabot", "Lagos Global Imports Ltd", "Shenzhen BrightLED"];
  const workspaces = ["enterprise", "importer", "supplier", "partner_property", "freight", "global_collections"];
  const modules = ["FX", "Wallets", "Cards", "Trade Files", "Verification", "Partner", "Audit"];
  return {
    id: `AUD-${10000 + i}`,
    ts: `2026-06-${day} ${hr}:0${i % 10}`,
    user: users[i % users.length],
    role: roles[i % roles.length],
    org: orgs[i % orgs.length],
    workspace: workspaces[i % workspaces.length],
    module: modules[i % modules.length],
    action,
    oldVal: action.includes("change") ? "Pending" : undefined,
    newVal: action.includes("change") ? "Approved" : undefined,
    ip: `102.${(i * 3) % 255}.10.${i % 240}`,
    status: i % 13 === 0 ? "Failed" : i % 17 === 0 ? "Pending" : "Success",
    details: action.includes("BVN")
      ? "BVN status changed (masked)"
      : action.includes("payout")
      ? "Solicitor payout completed"
      : undefined,
  };
});

function AuditLogsPage() {
  const [q, setQ] = useState("");
  const [user, setUser] = useState("All");
  const [workspace, setWorkspace] = useState("All");
  const [module, setModule] = useState("All");
  const [status, setStatus] = useState("All");

  const users = ["All", ...Array.from(new Set(SEED.map((s) => s.user)))];
  const workspaces = ["All", ...Array.from(new Set(SEED.map((s) => s.workspace)))];
  const modules = ["All", ...Array.from(new Set(SEED.map((s) => s.module)))];

  const rows = useMemo(() => SEED.filter((r) => {
    if (user !== "All" && r.user !== user) return false;
    if (workspace !== "All" && r.workspace !== workspace) return false;
    if (module !== "All" && r.module !== module) return false;
    if (status !== "All" && r.status !== status) return false;
    if (q && !`${r.action} ${r.user} ${r.org} ${r.module}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, user, workspace, module, status]);

  function exportCsv() {
    const head = ["Timestamp", "User", "Role", "Org", "Workspace", "Module", "Action", "Old", "New", "IP", "Status", "Details"];
    const csv = [head, ...rows.map((r) => [r.ts, r.user, r.role, r.org, r.workspace, r.module, r.action, r.oldVal ?? "", r.newVal ?? "", r.ip ?? "", r.status, r.details ?? ""])]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canta-audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit log exported");
  }

  return (
    <div className="space-y-5">
      <header>
        <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3 w-3" /> Compliance</Badge>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Every meaningful action is recorded. Filter and export for compliance reviews.</p>
      </header>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search action, user, module" className="pl-9" />
          </div>
          <Select value={user} onValueChange={setUser}>
            <SelectTrigger><SelectValue placeholder="User" /></SelectTrigger>
            <SelectContent>{users.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={workspace} onValueChange={setWorkspace}>
            <SelectTrigger><SelectValue placeholder="Workspace" /></SelectTrigger>
            <SelectContent>{workspaces.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={module} onValueChange={setModule}>
            <SelectTrigger><SelectValue placeholder="Module" /></SelectTrigger>
            <SelectContent>{modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {["All", "Success", "Failed", "Pending"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="text-muted-foreground">{rows.length} entries</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => { window.print(); toast.success("Print dialog opened"); }}>
              <FileText className="h-3.5 w-3.5 mr-1.5" /> Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-5 w-5" />}
          title="No audit logs found"
          description="Adjust your filters or clear search to see more entries."
          action={{ label: "Clear filters", onClick: () => { setQ(""); setUser("All"); setWorkspace("All"); setModule("All"); setStatus("All"); } }}
        />
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.ts}</TableCell>
                  <TableCell>
                    <div className="text-sm">{r.user}</div>
                    <div className="text-[11px] text-muted-foreground">{r.role} · {r.org}</div>
                  </TableCell>
                  <TableCell className="text-xs">{r.workspace}</TableCell>
                  <TableCell className="text-xs">{r.module}</TableCell>
                  <TableCell className="text-sm">{r.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.oldVal && r.newVal ? `${r.oldVal} → ${r.newVal}` : r.details ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      r.status === "Success" ? "bg-success/15 text-success border-success/30" :
                      r.status === "Failed" ? "bg-destructive/10 text-destructive border-destructive/30" :
                      "bg-warning/15 text-warning border-warning/30"
                    }>{r.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
