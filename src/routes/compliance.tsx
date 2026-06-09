import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { complianceItems } from "@/lib/mock";
import {
  ShieldCheck, FileCheck2, AlertTriangle, Download, Users, FileText,
  Search, ClipboardList, History, FileBarChart2, Building2, Globe,
  CheckCircle2, XCircle, Clock, UserCheck, Eye, Filter,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/compliance")({
  head: () => ({ meta: [{ title: "Compliance Pack — Canta" }] }),
  component: Compliance,
});

// ---------- types ----------
type ComplianceStatus = "Not Started" | "In Review" | "Verified" | "Enhanced DD" | "Rejected";
type RiskRating = "Low" | "Medium" | "High";
type EntityType = "Importer" | "Freight Forwarder" | "Supplier" | "Global Merchant" | "Corporate Customer";

// ---------- mock data ----------
const kybProfiles: {
  id: string; name: string; reg: string; country: string; type: EntityType;
  directors: string[]; ubos: number; status: ComplianceStatus; risk: RiskRating; onboarded: string;
}[] = [
  { id: "KYB-1042", name: "Niger Delta Exploration Ltd", reg: "RC-128401", country: "Nigeria", type: "Corporate Customer", directors: ["A. Okonkwo", "S. Bello"], ubos: 3, status: "Verified", risk: "Low", onboarded: "2025-11-12" },
  { id: "KYB-1043", name: "ABC Electronics Imports", reg: "RC-991230", country: "Nigeria", type: "Importer", directors: ["T. Adeyemi"], ubos: 2, status: "In Review", risk: "Medium", onboarded: "2026-01-08" },
  { id: "KYB-1044", name: "Guangzhou Tech Factory", reg: "GZ-2018-7741", country: "China", type: "Supplier", directors: ["L. Wei", "Z. Chen"], ubos: 2, status: "Verified", risk: "Low", onboarded: "2025-09-22" },
  { id: "KYB-1045", name: "Trade Fair Imports Co.", reg: "RC-204918", country: "Nigeria", type: "Importer", directors: ["E. Nnamdi"], ubos: 4, status: "Enhanced DD", risk: "High", onboarded: "2026-02-19" },
  { id: "KYB-1046", name: "Dubai Auto Parts Hub", reg: "UAE-DAP-3309", country: "UAE", type: "Supplier", directors: ["K. Al-Rashid"], ubos: 1, status: "Verified", risk: "Low", onboarded: "2025-12-04" },
  { id: "KYB-1047", name: "Maersk Lagos Freight", reg: "RC-118822", country: "Nigeria", type: "Freight Forwarder", directors: ["O. Adesanya", "J. Mensah"], ubos: 2, status: "Verified", risk: "Low", onboarded: "2025-10-30" },
  { id: "KYB-1048", name: "Cambridge International School", reg: "UK-CSL-44218", country: "UK", type: "Global Merchant", directors: ["P. Hughes"], ubos: 5, status: "In Review", risk: "Medium", onboarded: "2026-03-15" },
  { id: "KYB-1049", name: "Royal Dubai Motors", reg: "—", country: "UAE", type: "Supplier", directors: [], ubos: 0, status: "Not Started", risk: "Medium", onboarded: "2026-06-01" },
  { id: "KYB-1050", name: "Yiwu Polypack Trading", reg: "YW-2020-9912", country: "China", type: "Supplier", directors: ["F. Zhang"], ubos: 1, status: "Rejected", risk: "High", onboarded: "2026-05-04" },
];

const ubos = [
  { entity: "Niger Delta Exploration Ltd", name: "Adaeze Okonkwo", pct: 42, nat: "Nigerian", id: "Verified", pep: "Clear", sanctions: "Clear" },
  { entity: "Niger Delta Exploration Ltd", name: "Samuel Bello", pct: 28, nat: "Nigerian", id: "Verified", pep: "Clear", sanctions: "Clear" },
  { entity: "ABC Electronics Imports", name: "Tunde Adeyemi", pct: 70, nat: "Nigerian", id: "Pending", pep: "Clear", sanctions: "Clear" },
  { entity: "Trade Fair Imports Co.", name: "Emeka Nnamdi", pct: 55, nat: "Nigerian", id: "Verified", pep: "PEP — Local", sanctions: "Clear" },
  { entity: "Trade Fair Imports Co.", name: "Grace Nnamdi", pct: 25, nat: "Nigerian", id: "Verified", pep: "Clear", sanctions: "Clear" },
  { entity: "Dubai Auto Parts Hub", name: "Khalid Al-Rashid", pct: 100, nat: "UAE", id: "Verified", pep: "Clear", sanctions: "Clear" },
  { entity: "Yiwu Polypack Trading", name: "Feng Zhang", pct: 100, nat: "Chinese", id: "Expired", pep: "Clear", sanctions: "Flagged" },
];

const docTypes = [
  { code: "CAC", label: "Company Registration (CAC)", required: true },
  { code: "MEMART", label: "MEMART / Articles of Association", required: true },
  { code: "DIR-ID", label: "Director IDs", required: true },
  { code: "ADDR", label: "Proof of Address", required: true },
  { code: "SOF", label: "Source of Funds", required: true },
  { code: "SOW", label: "Source of Wealth", required: false },
  { code: "SUPP", label: "Supplier Verification", required: false },
  { code: "CTR", label: "Contracts", required: false },
  { code: "INV", label: "Invoices", required: false },
];

const docMatrix = [
  { entity: "Niger Delta Exploration Ltd", state: { CAC: "Verified", MEMART: "Verified", "DIR-ID": "Verified", ADDR: "Verified", SOF: "Verified", SOW: "Verified", SUPP: "—", CTR: "Verified", INV: "Verified" } },
  { entity: "ABC Electronics Imports", state: { CAC: "Verified", MEMART: "Pending", "DIR-ID": "Verified", ADDR: "Verified", SOF: "Pending", SOW: "—", SUPP: "Verified", CTR: "—", INV: "Verified" } },
  { entity: "Trade Fair Imports Co.", state: { CAC: "Verified", MEMART: "Verified", "DIR-ID": "Verified", ADDR: "Verified", SOF: "Pending", SOW: "Missing", SUPP: "—", CTR: "Pending", INV: "Verified" } },
  { entity: "Cambridge International School", state: { CAC: "Verified", MEMART: "Verified", "DIR-ID": "Pending", ADDR: "Verified", SOF: "Verified", SOW: "Verified", SUPP: "—", CTR: "Verified", INV: "—" } },
  { entity: "Royal Dubai Motors", state: { CAC: "Missing", MEMART: "Missing", "DIR-ID": "Missing", ADDR: "Missing", SOF: "Missing", SOW: "—", SUPP: "Missing", CTR: "—", INV: "—" } },
] as const;

const screenings = [
  { entity: "Niger Delta Exploration Ltd", sanctions: "Clear", pep: "Clear", media: "Clear", biz: "Verified", account: "Verified", country: "Low" },
  { entity: "ABC Electronics Imports", sanctions: "Clear", pep: "Clear", media: "Pending", biz: "In Review", account: "Verified", country: "Low" },
  { entity: "Trade Fair Imports Co.", sanctions: "Clear", pep: "PEP", media: "Adverse — minor", biz: "Verified", account: "Verified", country: "Medium" },
  { entity: "Dubai Auto Parts Hub", sanctions: "Clear", pep: "Clear", media: "Clear", biz: "Verified", account: "Verified", country: "Low" },
  { entity: "Cambridge International School", sanctions: "Clear", pep: "Clear", media: "Clear", biz: "In Review", account: "In Review", country: "Low" },
  { entity: "Yiwu Polypack Trading", sanctions: "Flagged", pep: "Clear", media: "Adverse", biz: "Rejected", account: "Rejected", country: "Medium" },
];

const auditTrail = [
  { id: "TXN-948213", customer: "Niger Delta Exploration", amount: "$1,250,000", purpose: "Supplier payment — drilling parts", docs: 6, approvals: 2, checks: "Passed", score: 18, ts: "2026-05-11 09:42", reviewer: "Chiamaka E." },
  { id: "TF-2026-0214", customer: "ABC Electronics Imports", amount: "$42,800", purpose: "Trade file — LED panels", docs: 4, approvals: 1, checks: "Passed", score: 24, ts: "2026-06-02 13:11", reviewer: "Amaka O." },
  { id: "TXN-948199", customer: "Trade Fair Imports", amount: "£92,400", purpose: "Supplier payment — UK", docs: 5, approvals: 2, checks: "EDD required", score: 71, ts: "2026-05-10 14:22", reviewer: "Ibrahim K." },
  { id: "COL-77123", customer: "Cambridge International School", amount: "₦14,200,000", purpose: "Tuition collection settlement", docs: 3, approvals: 1, checks: "Passed", score: 22, ts: "2026-06-06 10:05", reviewer: "System" },
  { id: "TXN-948205", customer: "Maersk Lagos Freight", amount: "₦850,000,000", purpose: "Operating funding", docs: 2, approvals: 1, checks: "Passed", score: 12, ts: "2026-05-10 17:01", reviewer: "Ibrahim K." },
  { id: "TXN-948188", customer: "Yiwu Polypack Trading", amount: "$18,420", purpose: "Supplier onboarding payment", docs: 2, approvals: 0, checks: "Blocked — sanctions", score: 94, ts: "2026-05-09 11:08", reviewer: "Compliance" },
];

const approvals = [
  { ref: "TXN-948213", by: "Chiamaka Eze", role: "Compliance Lead", date: "2026-05-11 09:55", decision: "Approved", docs: "KYB Pack, Invoice, Contract", comment: "All KYB documents verified. Source of funds confirmed via bank statement." },
  { ref: "TF-2026-0214", by: "Amaka Obi", role: "Trade Officer", date: "2026-06-02 13:30", decision: "Approved", docs: "Supplier invoice, BL, Packing list", comment: "Standard trade file. Supplier previously verified." },
  { ref: "TXN-948199", by: "Ibrahim Kalu", role: "Compliance Manager", date: "2026-05-10 14:55", decision: "Conditional — EDD", docs: "KYB Pack, UBO docs", comment: "PEP detected on UBO. Requires enhanced due diligence and senior sign-off." },
  { ref: "TXN-948188", by: "Compliance Bot", role: "Automated", date: "2026-05-09 11:12", decision: "Rejected", docs: "Sanctions screen output", comment: "Entity matched OFAC SDN list. Auto-blocked pending manual review." },
  { ref: "KYB-1042", by: "Chiamaka Eze", role: "Compliance Lead", date: "2025-11-14 16:20", decision: "Approved", docs: "CAC, MEMART, Director IDs, Address proof", comment: "Full KYB completed. Low risk corporate customer." },
];

const reports = [
  { id: "RPT-CKYB", label: "Customer KYB Pack", desc: "Full KYB profile, UBOs, documents, screening results", icon: Building2 },
  { id: "RPT-TF", label: "Trade File Audit Pack", desc: "Documents, approvals and compliance checks per trade file", icon: FileText },
  { id: "RPT-TXN", label: "Transaction Report", desc: "Filterable transaction audit trail with risk scores", icon: FileBarChart2 },
  { id: "RPT-MSET", label: "Merchant Settlement Report", desc: "Global Collections settlements reconciled to invoices", icon: Globe },
  { id: "RPT-SUPP", label: "Supplier Verification Report", desc: "Verification status, screening and supporting documents", icon: UserCheck },
];

// ---------- helpers ----------
function statusTone(s: string) {
  if (s === "Verified" || s === "Clear" || s === "Approved" || s === "Passed" || s === "Low") return "bg-success/15 text-success border-success/30";
  if (s === "In Review" || s === "Pending" || s === "Conditional — EDD" || s === "Medium" || s === "PEP" || s === "PEP — Local") return "bg-warning/15 text-warning-foreground border-warning/30";
  if (s === "Enhanced DD" || s === "EDD required" || s === "Adverse" || s === "Adverse — minor" || s === "Expired") return "bg-accent/15 text-accent-foreground border-accent/30";
  if (s === "Rejected" || s === "Flagged" || s === "Missing" || s === "Blocked — sanctions" || s === "High") return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-secondary text-secondary-foreground border-border";
}

function Kpi({ icon: Icon, label, value, hint, tone = "primary" }: { icon: any; label: string; value: string | number; hint?: string; tone?: "primary" | "success" | "warning" | "danger" | "accent" }) {
  const toneMap: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/15",
    danger: "text-destructive bg-destructive/10",
    accent: "text-accent-foreground bg-accent/15",
  };
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className={`h-9 w-9 grid place-items-center rounded-lg ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </Card>
  );
}

function DocCell({ s }: { s: string }) {
  if (s === "Verified") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (s === "Pending") return <Clock className="h-4 w-4 text-warning" />;
  if (s === "Missing") return <XCircle className="h-4 w-4 text-destructive" />;
  return <span className="text-muted-foreground text-xs">—</span>;
}

// ---------- page ----------
function Compliance() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntityType | "All">("All");

  const verified = kybProfiles.filter((p) => p.status === "Verified").length;
  const pending = kybProfiles.filter((p) => p.status === "In Review" || p.status === "Not Started").length;
  const highRisk = auditTrail.filter((a) => a.score >= 70).length;
  const incomplete = kybProfiles.filter((p) => p.status === "Not Started" || p.status === "Enhanced DD").length;
  const flagged = screenings.filter((s) => s.sanctions === "Flagged" || s.media === "Adverse").length;

  const filteredProfiles = useMemo(() => {
    return kybProfiles.filter((p) =>
      (typeFilter === "All" || p.type === typeFilter) &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.reg.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <span className="h-9 w-9 grid place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-5 w-5" /></span>
            Compliance Pack
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Audit-ready KYB, screening, transaction audit trail and regulator-grade reporting.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Audit log exported")}><Download className="h-4 w-4 mr-1.5" /> Export audit log</Button>
          <Button size="sm" onClick={() => toast.success("New KYB review started")}><ClipboardList className="h-4 w-4 mr-1.5" /> Start review</Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Kpi icon={Clock} label="Pending Reviews" value={pending} hint="awaiting officer" tone="warning" />
        <Kpi icon={ShieldCheck} label="Verified Customers" value={verified} tone="success" />
        <Kpi icon={AlertTriangle} label="High-Risk Transactions" value={highRisk} hint="score ≥ 70" tone="danger" />
        <Kpi icon={FileCheck2} label="Incomplete KYB" value={incomplete} tone="warning" />
        <Kpi icon={AlertTriangle} label="Flagged Beneficiaries" value={flagged} tone="danger" />
        <Kpi icon={FileBarChart2} label="Reports Generated" value="138" hint="this quarter" tone="primary" />
      </div>

      <Tabs defaultValue="kyb" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="kyb"><Building2 className="h-3.5 w-3.5 mr-1.5" /> KYB Profiles</TabsTrigger>
          <TabsTrigger value="ubo"><Users className="h-3.5 w-3.5 mr-1.5" /> Beneficial Ownership</TabsTrigger>
          <TabsTrigger value="docs"><FileText className="h-3.5 w-3.5 mr-1.5" /> Documents</TabsTrigger>
          <TabsTrigger value="screen"><Search className="h-3.5 w-3.5 mr-1.5" /> Screening</TabsTrigger>
          <TabsTrigger value="audit"><ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Transaction Audit Trail</TabsTrigger>
          <TabsTrigger value="approvals"><History className="h-3.5 w-3.5 mr-1.5" /> Approval History</TabsTrigger>
          <TabsTrigger value="reports"><FileBarChart2 className="h-3.5 w-3.5 mr-1.5" /> Compliance Reports</TabsTrigger>
        </TabsList>

        {/* ---------- KYB Profiles ---------- */}
        <TabsContent value="kyb" className="space-y-4">
          <Card className="p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[220px]">
                <Input placeholder="Search business name or registration #…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><Filter className="h-3.5 w-3.5" /></div>
              {(["All", "Importer", "Freight Forwarder", "Supplier", "Global Merchant", "Corporate Customer"] as const).map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`text-xs px-2.5 py-1 rounded-full border ${typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>{t}</button>
              ))}
            </div>
          </Card>

          <Card className="p-0 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    {["KYB ID", "Business", "Reg #", "Country", "Type", "Directors", "UBOs", "Status", "Risk", "Onboarded", ""].map((h) => (
                      <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.reg}</td>
                      <td className="px-4 py-3">{p.country}</td>
                      <td className="px-4 py-3 text-xs">{p.type}</td>
                      <td className="px-4 py-3 text-xs">{p.directors.length || "—"}</td>
                      <td className="px-4 py-3 text-xs">{p.ubos}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusTone(p.status)}>{p.status}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusTone(p.risk)}>{p.risk}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.onboarded}</td>
                      <td className="px-4 py-3"><Button size="sm" variant="ghost" onClick={() => toast.success(`Opened ${p.id}`)}><Eye className="h-3.5 w-3.5" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ---------- Beneficial Ownership ---------- */}
        <TabsContent value="ubo" className="space-y-4">
          <Card className="p-0 shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="text-sm font-semibold">Ultimate Beneficial Owners</div>
              <div className="text-xs text-muted-foreground">25%+ ownership disclosed, screened against PEP and sanctions lists.</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    {["Entity", "Owner", "Ownership", "Nationality", "ID Status", "PEP", "Sanctions"].map((h) => (
                      <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ubos.map((u, i) => (
                    <tr key={i} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-4 py-3">{u.entity}</td>
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={u.pct} className="h-1.5 w-20" />
                          <span className="text-xs font-mono">{u.pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">{u.nat}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusTone(u.id)}>{u.id}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusTone(u.pep)}>{u.pep}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusTone(u.sanctions)}>{u.sanctions}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ---------- Documents ---------- */}
        <TabsContent value="docs" className="space-y-4">
          <Card className="p-0 shadow-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Document vault</div>
                <div className="text-xs text-muted-foreground">Tracked documents per entity. Green = verified, amber = pending, red = missing.</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.success("Request sent on WhatsApp")}>Request missing</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Entity</th>
                    {docTypes.map((d) => (
                      <th key={d.code} className="text-center font-medium px-2 py-2.5" title={d.label}>{d.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {docMatrix.map((row) => (
                    <tr key={row.entity} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{row.entity}</td>
                      {docTypes.map((d) => (
                        <td key={d.code} className="px-2 py-3 text-center">
                          <DocCell s={(row.state as Record<string, string>)[d.code]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              {docTypes.map((d) => (
                <span key={d.code}><span className="font-mono text-foreground">{d.code}</span> — {d.label}{d.required && <span className="text-destructive"> *</span>}</span>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ---------- Screening ---------- */}
        <TabsContent value="screen" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(["Not Started", "In Review", "Verified", "Enhanced DD", "Rejected"] as ComplianceStatus[]).map((s) => (
              <Card key={s} className="p-3 shadow-card">
                <Badge variant="outline" className={statusTone(s)}>{s}</Badge>
                <div className="mt-2 text-xl font-semibold">{complianceItems.filter((c) => c.status === s).length + (s === "Verified" ? 3 : 0)}</div>
              </Card>
            ))}
          </div>

          <Card className="p-0 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    {["Entity", "Sanctions", "PEP", "Adverse Media", "Business Verification", "Account Verification", "High-Risk Country"].map((h) => (
                      <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {screenings.map((s) => (
                    <tr key={s.entity} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{s.entity}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusTone(s.sanctions)}>{s.sanctions}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusTone(s.pep)}>{s.pep}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusTone(s.media)}>{s.media}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusTone(s.biz)}>{s.biz}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusTone(s.account)}>{s.account}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusTone(s.country)}>{s.country}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ---------- Transaction Audit Trail ---------- */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="p-0 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    {["Reference", "Customer", "Amount", "Purpose", "Docs", "Approvals", "Checks", "Risk Score", "Timestamp", "Reviewer"].map((h) => (
                      <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditTrail.map((a) => {
                    const scoreTone = a.score >= 70 ? "text-destructive bg-destructive/10" : a.score >= 40 ? "text-warning bg-warning/15" : "text-success bg-success/10";
                    return (
                      <tr key={a.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono text-xs">{a.id}</td>
                        <td className="px-4 py-3 font-medium">{a.customer}</td>
                        <td className="px-4 py-3 font-mono text-xs">{a.amount}</td>
                        <td className="px-4 py-3 text-xs">{a.purpose}</td>
                        <td className="px-4 py-3"><Badge variant="outline">{a.docs}</Badge></td>
                        <td className="px-4 py-3"><Badge variant="outline">{a.approvals}</Badge></td>
                        <td className="px-4 py-3"><Badge variant="outline" className={statusTone(a.checks)}>{a.checks}</Badge></td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded font-mono text-xs ${scoreTone}`}>{a.score}</span></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{a.ts}</td>
                        <td className="px-4 py-3 text-xs">{a.reviewer}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ---------- Approval History ---------- */}
        <TabsContent value="approvals" className="space-y-4">
          <Card className="p-0 shadow-card overflow-hidden">
            <div className="divide-y divide-border">
              {approvals.map((a, i) => (
                <div key={i} className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold">
                        {a.by.split(" ").map((p) => p[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{a.by} <span className="text-xs font-normal text-muted-foreground">· {a.role}</span></div>
                        <div className="text-xs text-muted-foreground">Reviewed <span className="font-mono text-foreground">{a.ref}</span> on {a.date}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={statusTone(a.decision)}>{a.decision}</Badge>
                  </div>
                  <div className="mt-3 grid md:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border border-border p-3 bg-secondary/30">
                      <div className="text-[10px] uppercase text-muted-foreground">Documents reviewed</div>
                      <div className="mt-1">{a.docs}</div>
                    </div>
                    <div className="rounded-lg border border-border p-3 bg-secondary/30">
                      <div className="text-[10px] uppercase text-muted-foreground">Comment</div>
                      <div className="mt-1">{a.comment}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ---------- Reports ---------- */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r) => {
              const Icon = r.icon;
              return (
                <Card key={r.id} className="p-5 shadow-card">
                  <div className="flex items-start gap-3">
                    <span className="h-10 w-10 grid place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{r.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => toast.success(`${r.label} generated`)}><Download className="h-3.5 w-3.5 mr-1.5" /> Generate PDF</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success(`${r.label} CSV exported`)}>CSV</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
