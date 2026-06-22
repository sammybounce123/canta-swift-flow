import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText, Upload, Search, Download, Eye, Filter, FolderOpen,
  CheckCircle2, AlertCircle, Clock, MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents — Canta" }] }),
  component: DocumentsPage,
});

type DocStatus = "Verified" | "Pending review" | "Action required";
type Doc = {
  id: string; name: string; type: string; linkedTo: string;
  uploadedBy: string; uploadedAt: string; size: string;
  status: DocStatus;
};

const DOCS: Doc[] = [
  { id: "DOC-2041", name: "Commercial Invoice — SH-9012.pdf", type: "Commercial Invoice", linkedTo: "Shipment SH-9012", uploadedBy: "Aisha B.", uploadedAt: "2026-06-18", size: "412 KB", status: "Verified" },
  { id: "DOC-2040", name: "Bill of Lading — SH-9012.pdf",     type: "Bill of Lading",     linkedTo: "Shipment SH-9012", uploadedBy: "Ops Team", uploadedAt: "2026-06-17", size: "1.1 MB", status: "Verified" },
  { id: "DOC-2039", name: "Packing List — TR-2031.xlsx",      type: "Packing List",       linkedTo: "Trade File TR-2031", uploadedBy: "Tunde B.", uploadedAt: "2026-06-15", size: "88 KB",  status: "Pending review" },
  { id: "DOC-2038", name: "Form M — ABC-2026-04.pdf",         type: "Form M",             linkedTo: "Shipment SH-9012", uploadedBy: "Compliance", uploadedAt: "2026-06-12", size: "240 KB", status: "Action required" },
  { id: "DOC-2037", name: "SONCAP Certificate.pdf",           type: "SONCAP",             linkedTo: "Trade File TR-2042", uploadedBy: "Tunde B.", uploadedAt: "2026-06-10", size: "604 KB", status: "Verified" },
  { id: "DOC-2036", name: "Quality Inspection Report.pdf",    type: "Inspection",         linkedTo: "Trade File TR-2055", uploadedBy: "QC Vendor", uploadedAt: "2026-06-09", size: "1.4 MB", status: "Verified" },
  { id: "DOC-2035", name: "Supplier Contract — Yiwu.pdf",     type: "Contract",           linkedTo: "Supplier: Yiwu Fashion", uploadedBy: "Adaeze O.", uploadedAt: "2026-06-05", size: "812 KB", status: "Verified" },
  { id: "DOC-2034", name: "Customs Duty Receipt.pdf",         type: "Receipt",            linkedTo: "Shipment SH-8990",   uploadedBy: "Clearing Agent", uploadedAt: "2026-06-02", size: "120 KB", status: "Verified" },
];

const TYPES = ["All", "Commercial Invoice", "Bill of Lading", "Packing List", "Form M", "SONCAP", "Inspection", "Contract", "Receipt"];

function tone(s: DocStatus) {
  if (s === "Verified") return "bg-success/15 text-success border-success/30";
  if (s === "Pending review") return "bg-amber-500/15 text-amber-700 border-amber-500/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

function DocumentsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState<"All" | DocStatus>("All");

  const filtered = useMemo(() => DOCS.filter((d) =>
    (type === "All" || d.type === type) &&
    (status === "All" || d.status === status) &&
    (!q || d.name.toLowerCase().includes(q.toLowerCase()) || d.linkedTo.toLowerCase().includes(q.toLowerCase()))
  ), [q, type, status]);

  const stats = useMemo(() => ({
    total: DOCS.length,
    verified: DOCS.filter((d) => d.status === "Verified").length,
    pending: DOCS.filter((d) => d.status === "Pending review").length,
    action: DOCS.filter((d) => d.status === "Action required").length,
  }), []);

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary shrink-0" /> Documents
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Every trade document in one searchable vault — invoices, BLs, packing lists, customs forms and certificates.
          </p>
        </div>
        <Button onClick={() => toast.success("Upload dialog opened")}>
          <Upload className="h-4 w-4 mr-1.5" /> Upload document
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total documents" value={String(stats.total)} icon={<FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />} />
        <Stat label="Verified" value={String(stats.verified)} icon={<CheckCircle2 className="h-3.5 w-3.5 text-success" />} tone="text-success" />
        <Stat label="Pending review" value={String(stats.pending)} icon={<Clock className="h-3.5 w-3.5 text-amber-600" />} tone="text-amber-600" />
        <Stat label="Action required" value={String(stats.action)} icon={<AlertCircle className="h-3.5 w-3.5 text-destructive" />} tone="text-destructive" />
      </div>

      <Card className="p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name or linked shipment / trade file..." className="pl-9" />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-48"><Filter className="h-3.5 w-3.5 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {(["All", "Verified", "Pending review", "Action required"] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Desktop table */}
      <Card className="hidden md:block shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Linked to</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{d.name}</div>
                        <div className="text-[11px] text-muted-foreground">{d.size}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{d.type}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{d.linkedTo}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{d.uploadedAt}</div>
                    <div className="text-[11px]">by {d.uploadedBy}</div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${tone(d.status)}`}>{d.status}</Badge></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => toast.success(`Previewing ${d.name}`)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => toast.success(`Downloading ${d.name}`)}><Download className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No documents match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {filtered.map((d) => (
          <Card key={d.id} className="p-4 shadow-card">
            <div className="flex items-start gap-2 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm break-words">{d.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{d.linkedTo} · {d.size}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{d.type}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${tone(d.status)}`}>{d.status}</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success(`Previewing ${d.name}`)}><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success(`Downloading ${d.name}`)}><Download className="h-3.5 w-3.5 mr-1" /> Download</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No documents match your filters.</div>}
      </div>
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone?: string }) {
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className={`text-2xl font-semibold tabular-nums mt-2 ${tone ?? ""}`}>{value}</div>
    </Card>
  );
}
