import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Receipt, AlertTriangle, Send, Wallet, Landmark, RefreshCw } from "lucide-react";
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
        <Button size="sm" asChild>
          <Link to="/supplier-portal/fx-quotes">
            <RefreshCw className="h-4 w-4 mr-2" /> FX Exchange · 实时汇率
          </Link>
        </Button>
      </ButtonGroup>

      <Card className="p-4">
        <div className="text-sm font-semibold mb-3">How settlement works · 结算流程</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: Send, t: "1. Send payment request", d: "Attach invoice and RMB amount. Buyer sees NGN they owe using the current FX quote.", cn: "1. 发送收款请求" },
            { icon: Landmark, t: "2. Buyer pays in NGN", d: "Nigerian buyer pays locally via bank transfer. Canta reviews compliance and processes FX.", cn: "2. 买家在尼日利亚以奈拉付款" },
            { icon: Wallet, t: "3. You receive RMB", d: "RMB lands in your Canta wallet. Full receipt and audit trail attached to the request.", cn: "3. 人民币结算至您的钱包" },
          ].map((s) => (
            <div key={s.t} className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm font-semibold"><s.icon className="h-4 w-4 text-primary" /> {s.t}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.d}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.cn}</div>
            </div>
          ))}
        </div>
      </Card>


      {(!verified || REQUESTS.some((r) => r.status === "Compliance Review")) && (
        <Card className="p-4 border-amber-300 bg-amber-50 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm flex-1">
            <div className="font-semibold">Action needed</div>
            <ul className="text-xs mt-1 list-disc pl-4 space-y-0.5">
              {!verified && <li>Verification incomplete — RMB settlement is paused until verification is approved.</li>}
              {!verified && <li>2 documents required: Factory address proof, Bank statement.</li>}
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
