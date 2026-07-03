import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Receipt, ShieldCheck, AlertTriangle } from "lucide-react";
import { REQUESTS, STATUS_TONE, RequestsTable, SettlementTimeline, useVerified } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/")({
  head: () => ({ meta: [{ title: "Overview — Supplier Portal — Canta" }] }),
  component: OverviewPanel,
});

function OverviewPanel() {
  const verified = useVerified();
  return (
    <div className="space-y-4">
      <ButtonGroup label="Overview quick actions">
        <Button size="sm" asChild><Link to="/supplier-portal/requests"><Receipt className="h-4 w-4 mr-2" /> Create Payment Request</Link></Button>
        {!verified && (
          <Button size="sm" variant="outline" asChild>
            <Link to="/supplier-portal/verification"><ShieldCheck className="h-4 w-4 mr-2" /> Complete Verification</Link>
          </Button>
        )}
      </ButtonGroup>

      {(!verified || REQUESTS.some((r) => r.status === "Compliance Review")) && (
        <Card className="p-4 border-amber-300 bg-amber-50 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm flex-1">
            <div className="font-semibold">Action needed</div>
            <ul className="text-xs mt-1 list-disc pl-4 space-y-0.5">
              {!verified && <li>Verification incomplete — RMB settlement is on hold until verification is approved.</li>}
              <li>2 documents required: Factory address proof, Bank statement.</li>
              {REQUESTS.some((r) => r.status === "Compliance Review") && <li>1 payment request under compliance review.</li>}
            </ul>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm font-semibold mb-3">Recent payment requests</div>
          <RequestsTable rows={REQUESTS.slice(0, 3)} compact />
        </Card>
        <Card className="p-5">
          <div className="text-sm font-semibold mb-3">Recent settlement activity</div>
          <ul className="text-sm space-y-2">
            {REQUESTS.filter((r) => ["RMB Paid","FX Processing","Compliance Review"].includes(r.status)).map((r) => (
              <li key={r.id} className="flex items-center justify-between border rounded-lg p-2">
                <div>
                  <div className="font-mono text-xs">{r.id} · {r.invoiceNumber}</div>
                  <div className="text-xs text-muted-foreground">{r.buyer} · {r.updated}</div>
                </div>
                <Badge className={STATUS_TONE[r.status]}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5">
        <div className="text-sm font-semibold mb-3">Most recent payment request timeline</div>
        <SettlementTimeline currentIndex={5} />
      </Card>

      <Card className="p-4 text-xs text-muted-foreground">
        You only see your own buyers, invoices, payment requests, documents, messages, FX quotes, RMB wallet, and settlement status.
      </Card>

    </div>
  );
}
