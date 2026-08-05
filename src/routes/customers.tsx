import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, ShieldCheck, FlaskConical } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "All Customers — Canta Ops" }] }),
  component: CustomersPage,
});

type Workspace = "Importer" | "Supplier" | "Merchant" | "Partner";
type Segment = "SME" | "Enterprise" | "Individual" | "Solicitor Firm" | "Marketer";
type Verification = "Verified" | "Pending Review" | "More Info Required" | "Unverified";

type OpsCustomer = {
  id: string;
  name: string;
  segment: Segment;
  workspace: Workspace;
  verification: Verification;
  lastActivity: string;
};

// Fictional demo directory spanning workspaces — for investor-demo purposes only.
const SEED: OpsCustomer[] = [
  { id: "ALL-001", name: "Amara Trading Co. (demo)",        segment: "SME",            workspace: "Importer", verification: "Verified",           lastActivity: "2026-06-23 09:14" },
  { id: "ALL-002", name: "Northbridge Textiles (demo)",     segment: "Enterprise",     workspace: "Importer", verification: "Pending Review",     lastActivity: "2026-06-22 15:40" },
  { id: "ALL-003", name: "Silverline Auto Parts (demo)",    segment: "SME",            workspace: "Importer", verification: "More Info Required", lastActivity: "2026-06-21 11:02" },
  { id: "ALL-004", name: "Harbor Foods Ltd. (demo)",        segment: "SME",            workspace: "Merchant", verification: "Verified",           lastActivity: "2026-06-23 08:02" },
  { id: "ALL-005", name: "Golden Coast Retail (demo)",      segment: "Individual",     workspace: "Merchant", verification: "Unverified",         lastActivity: "2026-06-18 10:12" },
  { id: "ALL-006", name: "PolyPack Trading (demo)",         segment: "Enterprise",     workspace: "Supplier", verification: "Verified",           lastActivity: "2026-06-23 10:15" },
  { id: "ALL-007", name: "Yiwu Home Goods (demo)",          segment: "SME",            workspace: "Supplier", verification: "More Info Required", lastActivity: "2026-06-20 14:33" },
  { id: "ALL-008", name: "Dubai Auto Parts Hub (demo)",     segment: "Enterprise",     workspace: "Supplier", verification: "Verified",           lastActivity: "2026-06-22 09:44" },
  { id: "ALL-009", name: "Quinn Solicitors LLP (demo)",     segment: "Solicitor Firm", workspace: "Partner",  verification: "Verified",           lastActivity: "2026-06-23 11:14" },
  { id: "ALL-010", name: "Howell & Sons (demo)",            segment: "Solicitor Firm", workspace: "Partner",  verification: "Pending Review",     lastActivity: "2026-06-19 16:20" },
  { id: "ALL-011", name: "Sade O. — Referral Partner (demo)", segment: "Marketer",     workspace: "Partner",  verification: "Verified",           lastActivity: "2026-06-23 09:58" },
  { id: "ALL-012", name: "Riverside Electronics (demo)",    segment: "SME",            workspace: "Importer", verification: "Unverified",         lastActivity: "2026-06-17 13:05" },
  { id: "ALL-013", name: "Cedar Grove Hardware (demo)",     segment: "Individual",     workspace: "Merchant", verification: "Pending Review",     lastActivity: "2026-06-21 08:47" },
  { id: "ALL-014", name: "Bryant Legal (demo)",             segment: "Solicitor Firm", workspace: "Partner",  verification: "More Info Required", lastActivity: "2026-06-16 12:30" },
];

const VERIFICATION_TONE: Record<Verification, string> = {
  "Verified": "bg-success/15 text-success border-success/30",
  "Pending Review": "bg-warning/15 text-warning border-warning/30",
  "More Info Required": "bg-accent/15 text-accent border-accent/30",
  "Unverified": "bg-muted text-muted-foreground",
};

function CustomersPage() {
  const [q, setQ] = useState("");
  const [workspace, setWorkspace] = useState<"All" | Workspace>("All");
  const [verification, setVerification] = useState<"All" | Verification>("All");

  const filtered = useMemo(() =>
    SEED.filter((c) =>
      (workspace === "All" || c.workspace === workspace) &&
      (verification === "All" || c.verification === verification) &&
      (!q || [c.name, c.segment, c.workspace, c.id].join(" ").toLowerCase().includes(q.toLowerCase()))
    ),
    [q, workspace, verification],
  );

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="This directory aggregates fictional demo records across every workspace for ops review." />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-primary shrink-0" /> All customers
            <Badge variant="outline" className="ml-2 text-[10px] gap-1"><FlaskConical className="h-3 w-3" /> Demo data</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            A single ops-wide directory of customers across importer, supplier, merchant and partner workspaces — search, filter, and jump into verification.
          </p>
        </div>
      </header>

      <Card className="p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, segment, or workspace..." className="pl-9" />
          </div>
          <Select value={workspace} onValueChange={(v) => setWorkspace(v as typeof workspace)}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All workspaces</SelectItem>
              {(["Importer", "Supplier", "Merchant", "Partner"] as Workspace[]).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={verification} onValueChange={(v) => setVerification(v as typeof verification)}>
            <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All verification statuses</SelectItem>
              {(Object.keys(VERIFICATION_TONE) as Verification[]).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Workspace</TableHead>
              <TableHead>Verification status</TableHead>
              <TableHead>Last activity</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.id}</div>
                </TableCell>
                <TableCell className="text-xs">{c.segment}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{c.workspace}</Badge></TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] ${VERIFICATION_TONE[c.verification]}`}>{c.verification}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground tabular-nums">{c.lastActivity}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" asChild>
                    <Link to="/verification-center"><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Review</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">No customers match your filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
