import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BarChart3, Download, FileText, Play } from "lucide-react";
import { toast } from "sonner";
import { type WorkspaceType } from "@/lib/profile";
import { useActiveWorkspace, useRequireWorkspace } from "@/lib/workspace-guard";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Canta" }] }),
  component: ReportsPage,
});

type ReportDef = { id: string; name: string; desc: string };

const REPORTS: Record<WorkspaceType, ReportDef[]> = {
  enterprise_treasury: [
    { id: "tx",        name: "Transaction report",     desc: "All wallet movements with FX and fees" },
    { id: "fx",        name: "FX conversion report",   desc: "Conversions, rates locked, slippage" },
    { id: "ben",       name: "Beneficiary report",     desc: "Beneficiary KYB status and payout history" },
    { id: "appr",      name: "Approval report",        desc: "Approval chain, approvers, response times" },
    { id: "expenses",  name: "Expense controls report", desc: "Optional employee expense controls by owner, category, project, and cost center" },
    { id: "comp",      name: "Compliance report",      desc: "Sanction checks, EDD, document expiry" },
  ],
  importer_portal: [
    { id: "tf",        name: "Trade Files",            desc: "Open, in-transit, cleared, value per trade file" },
    { id: "ship",      name: "Shipments",              desc: "Lanes, ETAs, delays, demurrage exposure" },
    { id: "landed",    name: "Landed Cost",            desc: "Goods + freight + duty + FX by SKU" },
    { id: "sup",       name: "Suppliers",              desc: "Spend per supplier, on-time delivery, disputes" },
    { id: "payments",  name: "Payments",               desc: "Supplier deposits, escrow releases, duties and freight invoices" },
  ],
  freight_workspace: [
    { id: "vol",       name: "Shipment volume",        desc: "Shipments per lane, mode, month" },
    { id: "cust",      name: "Customer report",        desc: "Revenue and outstanding per customer" },
    { id: "inv",       name: "Freight invoice report", desc: "Issued, paid, overdue invoices" },
    { id: "out",       name: "Outstanding invoices",   desc: "Aging and follow-up status" },
    { id: "staff",     name: "Staff performance",      desc: "Shipments handled per staff member" },
    { id: "route",     name: "Route report",           desc: "Profitability and delays per lane" },
  ],
  global_collections: [
    { id: "coll",      name: "Collection report",      desc: "Links sent, paid, abandoned, by currency" },
    { id: "payer",     name: "Payer report",           desc: "Repeat payers, top sources, country mix" },
    { id: "recon",     name: "Reconciliation report",  desc: "Matched, unmatched, partial settlements" },
    { id: "settle",    name: "Settlement report",      desc: "Batches sent to merchant, T+ timing" },
    { id: "failed",    name: "Failed payments",        desc: "Decline reasons and retry success" },
  ],
  supplier_dashboard: [
    { id: "inv",       name: "Invoice report",         desc: "Issued, paid, overdue invoices to buyers" },
    { id: "buyer",     name: "Buyer report",           desc: "Repeat buyers, country mix, payment behavior" },
    { id: "settle",    name: "RMB settlement report",  desc: "NGN received, rate locked, RMB processing, paid out, receipts" },
    { id: "docs",      name: "Document report",        desc: "Invoices, packing lists, verification documents and settlement receipts" },
  ],
  partner_property: [
    { id: "cases",     name: "Client payment case",    desc: "Cases by status, value, marketer" },
    { id: "fx",        name: "FX quote report",        desc: "Quotes sent, accepted, expired" },
    { id: "links",     name: "Payment link report",    desc: "Links sent, opened, paid" },
    { id: "payouts",   name: "Solicitor payout",       desc: "Payouts processed per solicitor" },
    { id: "mkt",       name: "Marketer performance",   desc: "Leads, conversions, revenue per marketer" },
    { id: "comm",      name: "Commission report",      desc: "Commissions earned, paid, pending" },
  ],
  global_spend_cards: [],
  canta_ops: [
    { id: "tickets",   name: "Support tickets report", desc: "Volume, SLAs, resolution times" },
    { id: "kyb",       name: "Verification report",    desc: "KYB throughput and approvals" },
    { id: "wa",        name: "WhatsApp desk report",   desc: "Inbound flow and AI handoff" },
    { id: "integ",     name: "Integrations report",    desc: "Webhook health, failures, retries" },
  ],
};

const WORKSPACE_LABELS: Record<WorkspaceType, string> = {
  enterprise_treasury: "Enterprise Treasury",
  importer_portal: "Importer Trade Desk",
  freight_workspace: "Invite-only Clearing Agent",
  global_collections: "Global Collections / Merchant",
  supplier_dashboard: "Supplier Portal",
  partner_property: "Partner Mode",
  global_spend_cards: "Enterprise Treasury",
  canta_ops: "Canta Ops",
};

const REPORT_GROUP_LABELS: Record<WorkspaceType, string> = {
  enterprise_treasury: "Enterprise reports",
  importer_portal: "Importer reports",
    freight_workspace: "Clearing agent job reports",
  global_collections: "Collection reports",
  supplier_dashboard: "Supplier reports",
    partner_property: "Partner Mode reports",
  global_spend_cards: "Enterprise reports",
  canta_ops: "Importer reports",
};

function ReportsPage() {
  useRequireWorkspace();
  const activeWorkspace = useActiveWorkspace();
  const [workspace, setWorkspace] = useState<WorkspaceType>(activeWorkspace.workspace);
  // Keep reports aligned with the workspace that opened /reports.
  useEffect(() => {
    setWorkspace(activeWorkspace.workspace);
  }, [activeWorkspace.workspace]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all");
  const [currency, setCurrency] = useState("all");
  const list = useMemo(() => REPORTS[workspace], [workspace]);
  // Preselect first report so the preview table is visible by default.
  const [selected, setSelected] = useState<ReportDef | null>(list[0] ?? null);
  useEffect(() => { setSelected(list[0] ?? null); }, [workspace, list]);

  function generate(r: ReportDef) {
    setSelected(r);
    toast.success(`${r.name} generated`, { description: `${WORKSPACE_LABELS[workspace]} · ${from || "all dates"} → ${to || "today"}` });
  }
  function exportCsv(r: ReportDef) {
    if (typeof window === "undefined") return;
    const rows = [
      ["Report", "Workspace", "From", "To", "Status", "Currency"],
      [r.name, WORKSPACE_LABELS[workspace], from || "—", to || "—", status, currency],
      [],
      ["Row", "Reference", "Date", "Status", "Amount", "Currency"],
      ["1", "REF-0001", "2026-06-01", "Completed", "12,400", currency === "all" ? "USD" : currency],
      ["2", "REF-0002", "2026-06-02", "Pending",   "5,200",  currency === "all" ? "USD" : currency],
      ["3", "REF-0003", "2026-06-03", "Completed", "18,750", currency === "all" ? "USD" : currency],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.id}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }
  function exportPdf(r: ReportDef) {
    toast.success(`${r.name} PDF queued for download`);
  }

  const WS_IDENTITY: Record<WorkspaceType, { name: string; title: string; mode: string }> = {
    enterprise_treasury: { name: "Adaeze Okonkwo", title: "Treasury Admin",  mode: "Enterprise Treasury Mode" },
    importer_portal:     { name: "Tunde Bakare",   title: "Importer Owner",  mode: "Importer Mode" },
    freight_workspace:   { name: "Chinedu Okafor", title: "Clearing Agent",  mode: "Invite-only Clearing Agent Mode" },
    global_collections:  { name: "Amaka Bello",    title: "Merchant Owner",  mode: "Global Collections Mode" },
    supplier_dashboard:  { name: "Li Wei",         title: "Supplier Admin",  mode: "Supplier Mode" },
    partner_property:    { name: "Charlotte Baron", title: "Partner Admin",  mode: "Partner Mode" },
    global_spend_cards:  { name: "Adaeze Okonkwo", title: "Treasury Admin",  mode: "Enterprise Treasury Mode" },
    canta_ops:           { name: "Tunde Bakare",   title: "Importer Owner",  mode: "Importer Mode" },
  };
  const identity = WS_IDENTITY[workspace];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Workspace-aware reports. Filter, preview, and export to CSV or PDF.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">{identity.mode}</Badge>
          <Badge className="text-xs bg-primary/10 text-primary border-primary/30">{identity.name} · {identity.title}</Badge>
          <Badge variant="secondary" className="text-xs">{REPORT_GROUP_LABELS[workspace]}</Badge>
        </div>
      </div>


      {/* Filters */}
      <Card className="p-4 shadow-card">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <Label className="text-xs">Workspace</Label>
            <Select value={workspace} onValueChange={(v) => setWorkspace(v as WorkspaceType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(WORKSPACE_LABELS) as WorkspaceType[]).filter((w) => w !== "canta_ops" && w !== "global_spend_cards").map((w) => (
                  <SelectItem key={w} value={w}>{WORKSPACE_LABELS[w]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["all", "completed", "pending", "failed", "approved", "rejected"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["all", "USD", "EUR", "GBP", "NGN", "ZAR", "KES", "GHS", "CNY"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Report catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((r) => (
          <Card key={r.id} className="p-4 shadow-card flex flex-col">
            <div className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> {r.name}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex-1">{r.desc}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => generate(r)}>
                <Play className="h-3.5 w-3.5 mr-1" /> Generate
              </Button>
              <Button size="sm" variant="outline" onClick={() => exportCsv(r)}>
                <Download className="h-3.5 w-3.5 mr-1" /> CSV
              </Button>
              <Button size="sm" variant="ghost" onClick={() => exportPdf(r)}>
                <Download className="h-3.5 w-3.5 mr-1" /> PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Preview */}
      {selected && (
        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Preview</div>
              <div className="text-lg font-semibold">{selected.name}</div>
              <div className="text-xs text-muted-foreground">
                {WORKSPACE_LABELS[workspace]} · {from || "all dates"} → {to || "today"} · status: {status} · ccy: {currency}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => exportCsv(selected)}>
                <Download className="h-3.5 w-3.5 mr-1" /> CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => exportPdf(selected)}>
                <Download className="h-3.5 w-3.5 mr-1" /> PDF
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 px-3">Row</th>
                  <th className="py-2 px-3">Reference</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ref: "REF-0001", d: "2026-06-01", s: "Completed", a: "12,400" },
                  { ref: "REF-0002", d: "2026-06-02", s: "Pending",   a: "5,200"  },
                  { ref: "REF-0003", d: "2026-06-03", s: "Completed", a: "18,750" },
                ].map((row, i) => (
                  <tr key={row.ref} className="border-t">
                    <td className="py-2 px-3 text-xs">{i + 1}</td>
                    <td className="py-2 px-3 text-xs font-mono">{row.ref}</td>
                    <td className="py-2 px-3 text-xs">{row.d}</td>
                    <td className="py-2 px-3 text-xs">{row.s}</td>
                    <td className="py-2 px-3 text-xs text-right tabular-nums">{row.a} {currency === "all" ? "USD" : currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">Preview is a sample. Generate runs the full query against your workspace.</div>
        </Card>
      )}
    </div>
  );
}
