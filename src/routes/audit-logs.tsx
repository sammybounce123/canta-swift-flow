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
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Download, Search, FileText, ShieldCheck, Copy } from "lucide-react";
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
  target?: string;
  oldVal?: string;
  newVal?: string;
  ip?: string;
  device?: string;
  status: "Success" | "Failed" | "Pending";
  details?: string;
};

// Hand-curated traceable entries — each row tells a real story tied to a workspace/module
const SEED: Entry[] = [
  { id: "AUD-10042", ts: "2026-06-23 09:14", user: "Adaeze O.", role: "Owner", org: "Lagos Global Imports Ltd", workspace: "importer", module: "Trade Files", action: "Trade file created", target: "TF-2041 · Shenzhen BrightLED", status: "Success", ip: "102.89.10.4", device: "Chrome · macOS", details: "New trade file created with 3 line items totaling USD 48,200." },
  { id: "AUD-10041", ts: "2026-06-23 09:18", user: "Adaeze O.", role: "Owner", org: "Lagos Global Imports Ltd", workspace: "importer", module: "FX", action: "FX quote generated", target: "USD→NGN @ 1,612.40", status: "Success", ip: "102.89.10.4", details: "Quote locked for 90 seconds. Settlement: NGN ₦77,718,080." },
  { id: "AUD-10040", ts: "2026-06-23 09:22", user: "Adaeze O.", role: "Owner", org: "Lagos Global Imports Ltd", workspace: "importer", module: "Payments", action: "Payment link generated", target: "PL-9921", status: "Success", details: "Sent to supplier Shenzhen BrightLED via WhatsApp." },
  { id: "AUD-10039", ts: "2026-06-23 09:41", user: "Felix M.", role: "Supplier Ops", org: "Shenzhen BrightLED", workspace: "supplier", module: "Payments", action: "Payment link opened", target: "PL-9921", status: "Success", ip: "120.245.10.71", device: "Safari · iPhone", details: "Supplier viewed payment instructions." },
  { id: "AUD-10038", ts: "2026-06-23 10:02", user: "Felix M.", role: "Supplier Ops", org: "Shenzhen BrightLED", workspace: "supplier", module: "Wallets", action: "Funding received", target: "Virtual account 7041-22-981", oldVal: "USD 0", newVal: "USD 48,200", status: "Success", details: "Funds credited to Canta virtual collection account." },
  { id: "AUD-10037", ts: "2026-06-23 10:05", user: "system", role: "System", org: "Canta", workspace: "enterprise", module: "FX", action: "FX converted", oldVal: "USD 48,200", newVal: "NGN 77,718,080", status: "Success", details: "Auto-conversion executed at locked rate." },
  { id: "AUD-10036", ts: "2026-06-23 10:11", user: "Tola A.", role: "Compliance", org: "Canta", workspace: "enterprise", module: "Verification", action: "Verification decision", target: "Lagos Global Imports Ltd", oldVal: "Pending", newVal: "Approved", status: "Success", details: "KYB approved after CAC + utility bill review." },
  { id: "AUD-10035", ts: "2026-06-23 10:34", user: "Adaeze O.", role: "Owner", org: "Lagos Global Imports Ltd", workspace: "importer", module: "Payouts", action: "Payout sent", target: "Shenzhen BrightLED · CNY", oldVal: "Pending", newVal: "Sent", status: "Success", details: "Cross-border payout via Canta liquidity rail." },
  { id: "AUD-10034", ts: "2026-06-23 10:48", user: "Felix M.", role: "Supplier Ops", org: "Shenzhen BrightLED", workspace: "supplier", module: "Payouts", action: "Payout receipt uploaded", target: "RCPT-77821.pdf", status: "Success", details: "Receipt acknowledged. Auto-attached to TF-2041." },
  { id: "AUD-10033", ts: "2026-06-23 11:02", user: "Charlotte Baron", role: "Partner Admin", org: "Baron & Cabot", workspace: "partner_property", module: "Partner", action: "Beneficiary created", target: "Quinn Solicitors LLP", status: "Success", details: "New solicitor beneficiary added under partner workspace." },
  { id: "AUD-10032", ts: "2026-06-23 11:14", user: "Charlotte Baron", role: "Partner Admin", org: "Baron & Cabot", workspace: "partner_property", module: "Partner", action: "Solicitor edited", target: "Quinn Solicitors LLP", oldVal: "GBP A/C ****2210", newVal: "GBP A/C ****4418", status: "Success" },
  { id: "AUD-10031", ts: "2026-06-23 11:25", user: "James Hartmann", role: "Operator", org: "Canta", workspace: "freight", module: "Trade Files", action: "Document upload", target: "BOL-2041.pdf", status: "Success", details: "Bill of lading attached to TF-2041." },
  { id: "AUD-10030", ts: "2026-06-23 11:30", user: "James Hartmann", role: "Operator", org: "Canta", workspace: "freight", module: "Trade Files", action: "Status change", target: "TF-2041", oldVal: "In Transit", newVal: "At Port", status: "Success" },
  { id: "AUD-10029", ts: "2026-06-23 11:48", user: "Adaeze O.", role: "Owner", org: "Lagos Global Imports Ltd", workspace: "importer", module: "Cards", action: "Card frozen", target: "Card ****4421", oldVal: "Active", newVal: "Frozen", status: "Success", details: "User-initiated freeze." },
  { id: "AUD-10028", ts: "2026-06-23 12:01", user: "Adaeze O.", role: "Owner", org: "Lagos Global Imports Ltd", workspace: "importer", module: "Cards", action: "Card unfrozen", target: "Card ****4421", oldVal: "Frozen", newVal: "Active", status: "Success" },
  { id: "AUD-10027", ts: "2026-06-23 12:18", user: "Operator #4", role: "Operator", org: "Canta", workspace: "global_collections", module: "Wallets", action: "Funding instruction shown", target: "Collection Link CL-3318", status: "Success", details: "Buyer viewed wire instructions for USD collection." },
  { id: "AUD-10026", ts: "2026-06-23 12:42", user: "Tola A.", role: "Compliance", org: "Canta", workspace: "enterprise", module: "Verification", action: "BVN submitted", target: "User #882", status: "Success", details: "BVN status changed (value masked)." },
  { id: "AUD-10025", ts: "2026-06-23 13:01", user: "Adaeze O.", role: "Owner", org: "Lagos Global Imports Ltd", workspace: "importer", module: "Audit", action: "Consent completed", target: "Mandate M-4421", status: "Success", details: "Direct debit mandate consented via OTP." },
  { id: "AUD-10024", ts: "2026-06-23 13:22", user: "Tola A.", role: "Compliance", org: "Canta", workspace: "enterprise", module: "Verification", action: "Approval decision", target: "TF-2039", oldVal: "Awaiting", newVal: "Approved", status: "Success" },
  { id: "AUD-10023", ts: "2026-06-23 13:40", user: "Adaeze O.", role: "Owner", org: "Lagos Global Imports Ltd", workspace: "importer", module: "FX", action: "FX quote expired", target: "USD→NGN", status: "Failed", details: "Quote not actioned within 90s. User regenerated." },
  { id: "AUD-10022", ts: "2026-06-23 14:05", user: "Charlotte Baron", role: "Partner Admin", org: "Baron & Cabot", workspace: "partner_property", module: "Audit", action: "Role change", target: "user@baroncabot.com", oldVal: "Marketer", newVal: "Partner Admin", status: "Success" },
  { id: "AUD-10021", ts: "2026-06-23 14:18", user: "Adaeze O.", role: "Owner", org: "Lagos Global Imports Ltd", workspace: "importer", module: "Audit", action: "Workspace switch", oldVal: "importer", newVal: "enterprise", status: "Success" },
  { id: "AUD-10020", ts: "2026-06-23 14:33", user: "Adaeze O.", role: "Owner", org: "Lagos Global Imports Ltd", workspace: "importer", module: "Audit", action: "Login", status: "Success", ip: "102.89.10.4", device: "Chrome · macOS", details: "MFA verified via authenticator app." },
  { id: "AUD-10019", ts: "2026-06-23 14:52", user: "unknown", role: "—", org: "—", workspace: "enterprise", module: "Audit", action: "Login", status: "Failed", ip: "41.203.77.12", details: "3 failed attempts. Account temporarily locked." },
  { id: "AUD-10018", ts: "2026-06-23 15:10", user: "Tola A.", role: "Compliance", org: "Canta", workspace: "enterprise", module: "Trade Files", action: "Case reassignment", target: "Case C-118", oldVal: "Operator #4", newVal: "James Hartmann", status: "Success" },
  { id: "AUD-10017", ts: "2026-06-23 15:24", user: "James Hartmann", role: "Operator", org: "Canta", workspace: "freight", module: "Trade Files", action: "Document deletion", target: "draft-invoice-old.pdf", status: "Pending", details: "Awaiting compliance approval to delete." },
];

function statusBadge(s: Entry["status"]) {
  return s === "Success"
    ? "bg-success/15 text-success border-success/30"
    : s === "Failed"
    ? "bg-destructive/10 text-destructive border-destructive/30"
    : "bg-warning/15 text-warning border-warning/30";
}

function AuditLogsPage() {
  const [q, setQ] = useState("");
  const [user, setUser] = useState("All");
  const [workspace, setWorkspace] = useState("All");
  const [module, setModule] = useState("All");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState<Entry | null>(null);

  const users = ["All", ...Array.from(new Set(SEED.map((s) => s.user)))];
  const workspaces = ["All", ...Array.from(new Set(SEED.map((s) => s.workspace)))];
  const modules = ["All", ...Array.from(new Set(SEED.map((s) => s.module)))];

  const rows = useMemo(() => SEED.filter((r) => {
    if (user !== "All" && r.user !== user) return false;
    if (workspace !== "All" && r.workspace !== workspace) return false;
    if (module !== "All" && r.module !== module) return false;
    if (status !== "All" && r.status !== status) return false;
    if (q && !`${r.action} ${r.user} ${r.org} ${r.module} ${r.target ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, user, workspace, module, status]);

  function exportCsv() {
    const head = ["ID", "Timestamp", "User", "Role", "Org", "Workspace", "Module", "Action", "Target", "Old", "New", "IP", "Status", "Details"];
    const csv = [head, ...rows.map((r) => [r.id, r.ts, r.user, r.role, r.org, r.workspace, r.module, r.action, r.target ?? "", r.oldVal ?? "", r.newVal ?? "", r.ip ?? "", r.status, r.details ?? ""])]
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
        <p className="text-sm text-muted-foreground mt-1">Every meaningful action is recorded. Click a row to see the full trace.</p>
      </header>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search action, user, target" className="pl-9" />
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
                <TableHead>Target / Change</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setOpen(r)}>
                  <TableCell className="font-mono text-xs">{r.ts}</TableCell>
                  <TableCell>
                    <div className="text-sm">{r.user}</div>
                    <div className="text-[11px] text-muted-foreground">{r.role} · {r.org}</div>
                  </TableCell>
                  <TableCell className="text-xs">{r.workspace}</TableCell>
                  <TableCell className="text-xs">{r.module}</TableCell>
                  <TableCell className="text-sm">{r.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[260px] truncate">
                    {r.oldVal && r.newVal ? `${r.oldVal} → ${r.newVal}` : r.target ?? r.details ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadge(r.status)}>{r.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span>{open.action}</span>
                  <Badge variant="outline" className={statusBadge(open.status)}>{open.status}</Badge>
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">{open.id} · {open.ts}</SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-4 text-sm">
                <Field label="Actor" value={`${open.user} · ${open.role}`} />
                <Field label="Organisation" value={open.org} />
                <Field label="Workspace" value={open.workspace} />
                <Field label="Module" value={open.module} />
                {open.target && <Field label="Target" value={open.target} />}
                {open.oldVal && open.newVal && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Change</div>
                    <div className="rounded-md border bg-muted/40 p-3 font-mono text-xs">
                      <div className="text-destructive">- {open.oldVal}</div>
                      <div className="text-success">+ {open.newVal}</div>
                    </div>
                  </div>
                )}
                {open.ip && <Field label="IP address" value={open.ip} />}
                {open.device && <Field label="Device" value={open.device} />}
                {open.details && <Field label="Details" value={open.details} />}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(open, null, 2)); toast.success("Entry copied to clipboard"); }}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.success(`Reported ${open.id} to compliance`)}>
                  Flag for review
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm mt-0.5">{value}</div>
    </div>
  );
}
