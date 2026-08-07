import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fmtMoney } from "@/lib/mock";
import { toast } from "sonner";
import { CheckSquare, CheckCircle2, Download } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/reconciliation")({
  head: () => ({ meta: [{ title: "Reconciliation — Canta" }] }),
  component: ReconciliationPage,
});

type Recon = {
  id: string;
  payerRef: string;
  invoiceRef: string;
  expected: number;
  received: number;
  ccy: string;
  match: "Matched" | "Unmatched" | "Exception";
};

type Settlement = {
  id: string;
  amount: number;
  ccy: string;
  destination: string;
  batch: string;
  status: "Pending Approval" | "Approved" | "Rejected" | "Processing" | "Settled" | "Failed";
  requestedBy: string;
};

const RECON: Recon[] = [
  {
    id: "R-1",
    payerRef: "STU-2024-001",
    invoiceRef: "INV-9001",
    expected: 1200,
    received: 1200,
    ccy: "USD",
    match: "Matched",
  },
  {
    id: "R-2",
    payerRef: "STU-2024-002",
    invoiceRef: "INV-9002",
    expected: 1500,
    received: 1500,
    ccy: "USD",
    match: "Unmatched",
  },
  {
    id: "R-3",
    payerRef: "DON-2024-018",
    invoiceRef: "INV-9003",
    expected: 5000,
    received: 0,
    ccy: "GBP",
    match: "Unmatched",
  },
  {
    id: "R-4",
    payerRef: "STU-2024-003",
    invoiceRef: "INV-9004",
    expected: 900,
    received: 850,
    ccy: "USD",
    match: "Exception",
  },
  {
    id: "R-5",
    payerRef: "STU-2024-004",
    invoiceRef: "INV-9005",
    expected: 1800,
    received: 0,
    ccy: "USD",
    match: "Exception",
  },
  {
    id: "R-6",
    payerRef: "DON-2024-019",
    invoiceRef: "INV-9006",
    expected: 2500,
    received: 2500,
    ccy: "USD",
    match: "Matched",
  },
];

const SETTLEMENTS_SEED: Settlement[] = [
  {
    id: "SET-501",
    amount: 45_000,
    ccy: "USD",
    destination: "GTB ••••2210",
    batch: "BATCH-2026-06-A",
    status: "Pending Approval",
    requestedBy: "bursar@unilag.edu.ng",
  },
  {
    id: "SET-502",
    amount: 18_500,
    ccy: "GBP",
    destination: "Barclays ••••8821",
    batch: "BATCH-2026-06-B",
    status: "Approved",
    requestedBy: "finance@unilag.edu.ng",
  },
  {
    id: "SET-503",
    amount: 7_200,
    ccy: "EUR",
    destination: "DB ••••1190",
    batch: "BATCH-2026-06-C",
    status: "Processing",
    requestedBy: "ops@unilag.edu.ng",
  },
  {
    id: "SET-504",
    amount: 12_000,
    ccy: "USD",
    destination: "GTB ••••2210",
    batch: "BATCH-2026-05-Z",
    status: "Settled",
    requestedBy: "bursar@unilag.edu.ng",
  },
];

const SETTLE_TONES: Record<Settlement["status"], string> = {
  "Pending Approval": "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Approved: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
  Processing: "bg-primary/10 text-primary border-primary/20",
  Settled: "bg-success/15 text-success border-success/30",
  Failed: "bg-destructive/15 text-destructive border-destructive/30",
};

function ReconciliationPage() {
  const [recon, setRecon] = useState<Recon[]>(RECON);
  const [settlements, setSettlements] = useState<Settlement[]>(SETTLEMENTS_SEED);
  const [tab, setTab] = useState("all");

  const kpis = useMemo(() => {
    const totalCollections = recon.reduce((a, r) => a + r.received, 0);
    const matched = recon.filter((r) => r.match === "Matched").length;
    const unmatched = recon.filter((r) => r.match === "Unmatched").length;
    const failed = recon.filter((r) => r.received === 0 && r.match !== "Matched").length;
    const pendingSettlement = settlements
      .filter((s) => s.status === "Pending Approval" || s.status === "Processing")
      .reduce((a, s) => a + s.amount, 0);
    return { totalCollections, matched, unmatched, failed, pendingSettlement };
  }, [recon, settlements]);

  const filtered = useMemo(() => {
    if (tab === "matched") return recon.filter((r) => r.match === "Matched");
    if (tab === "unmatched") return recon.filter((r) => r.match === "Unmatched");
    if (tab === "exceptions") return recon.filter((r) => r.match === "Exception");
    return recon;
  }, [recon, tab]);

  const manualMatch = (id: string) => {
    setRecon(recon.map((r) => (r.id === id ? { ...r, match: "Matched" } : r)));
    toast.success("Payment manually matched");
  };
  const markReviewed = (id: string) => {
    setRecon(recon.map((r) => (r.id === id ? { ...r, match: "Matched" } : r)));
    toast.success("Marked as reviewed");
  };
  const requestClarification = () => toast.success("Clarification email sent to payer");

  const approve = (id: string) => {
    setSettlements(settlements.map((s) => (s.id === id ? { ...s, status: "Approved" } : s)));
    toast.success("Settlement approved");
  };
  const reject = (id: string) => {
    setSettlements(settlements.map((s) => (s.id === id ? { ...s, status: "Rejected" } : s)));
    toast.success("Settlement rejected");
  };

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Matched and unmatched payments should be reviewed before settlement reporting."
      />
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-success" /> Reconciliation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Match incoming collections to invoices and payers. Approve settlements to your accounts.
          </p>
        </div>
        <Button variant="outline" onClick={() => toast.success("Reconciliation report exported")}>
          <Download className="h-4 w-4 mr-1.5" /> Export report
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi label="Total collections" value={fmtMoney(kpis.totalCollections, "USD")} />
        <Kpi label="Matched payments" value={String(kpis.matched)} tone="text-success" />
        <Kpi label="Unmatched payments" value={String(kpis.unmatched)} tone="text-amber-700" />
        <Kpi label="Failed payments" value={String(kpis.failed)} tone="text-destructive" />
        <Kpi label="Pending settlement" value={fmtMoney(kpis.pendingSettlement, "USD")} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="matched">Matched</TabsTrigger>
          <TabsTrigger value="unmatched">Unmatched</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
          <TabsTrigger value="settlements">Settlement Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {tab === "settlements" ? (
            <SettlementApprovals settlements={settlements} onApprove={approve} onReject={reject} />
          ) : (
            <ReconTable
              items={filtered}
              onMatch={manualMatch}
              onClarify={requestClarification}
              onReview={markReviewed}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="p-4 shadow-card">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold tabular-nums mt-2 ${tone || ""}`}>{value}</div>
    </Card>
  );
}

function ReconTable({
  items,
  onMatch,
  onClarify,
  onReview,
}: {
  items: Recon[];
  onMatch: (id: string) => void;
  onClarify: () => void;
  onReview: (id: string) => void;
}) {
  const tones: Record<Recon["match"], string> = {
    Matched: "bg-success/15 text-success border-success/30",
    Unmatched: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    Exception: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-4 py-3">Payer ref</th>
              <th className="px-4 py-3">Invoice ref</th>
              <th className="px-4 py-3 text-right">Amount expected</th>
              <th className="px-4 py-3 text-right">Amount received</th>
              <th className="px-4 py-3 text-right">Variance</th>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const variance = r.received - r.expected;
              return (
                <tr key={r.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{r.payerRef}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.invoiceRef}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmtMoney(r.expected, r.ccy)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmtMoney(r.received, r.ccy)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums ${variance === 0 ? "text-success" : "text-destructive"}`}
                  >
                    {variance === 0 ? "—" : fmtMoney(variance, r.ccy)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${tones[r.match]}`}
                    >
                      {r.match}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {r.match !== "Matched" && (
                      <Button size="sm" variant="outline" onClick={() => onMatch(r.id)}>
                        Match
                      </Button>
                    )}
                    {r.match !== "Matched" && (
                      <Button size="sm" variant="ghost" onClick={onClarify}>
                        Clarify
                      </Button>
                    )}
                    {r.match === "Exception" && (
                      <Button size="sm" variant="ghost" onClick={() => onReview(r.id)}>
                        Mark reviewed
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No items.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SettlementApprovals({
  settlements,
  onApprove,
  onReject,
}: {
  settlements: Settlement[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-4 py-3">Settlement</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Requested by</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">
                  {fmtMoney(s.amount, s.ccy)}
                </td>
                <td className="px-4 py-3 text-xs">{s.destination}</td>
                <td className="px-4 py-3 font-mono text-xs">{s.batch}</td>
                <td className="px-4 py-3 text-xs">{s.requestedBy}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${SETTLE_TONES[s.status]}`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {s.status === "Pending Approval" ? (
                    <>
                      <Button size="sm" className="bg-primary" onClick={() => onApprove(s.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onReject(s.id)}>
                        Reject
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
