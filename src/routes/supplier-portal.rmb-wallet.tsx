import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Wallet, Download, Landmark, ArrowDownLeft, TrendingUp } from "lucide-react";
import { REQUESTS, STATUS_TONE, COMPLIANCE_DISCLAIMER, useVerified } from "@/lib/supplier-data";
import { toast } from "sonner";

export const Route = createFileRoute("/supplier-portal/rmb-wallet")({
  head: () => ({ meta: [{ title: "RMB Settlement — Supplier Portal — Canta" }] }),
  component: RmbWalletPanel,
});

function RmbWalletPanel() {
  const verified = useVerified();
  const settled = REQUESTS.filter((r) => r.status === "RMB Paid");
  const pending = REQUESTS.filter((r) =>
    ["NGN Received", "Compliance Review", "FX Processing"].includes(r.status),
  );
  const balance = 128_400;
  const pendingRmb = pending.reduce((s, r) => s + r.amountRmb, 0);
  const monthRmb = settled.reduce((s, r) => s + r.amountRmb, 0);

  return (
    <div className="space-y-4">
      {/* Wallet hero */}
      <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80 flex items-center gap-1">
              <Wallet className="h-3 w-3" /> RMB Wallet · 人民币钱包
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-4xl font-semibold tabular-nums">¥{balance.toLocaleString()}.00</div>
              <Badge variant="outline" className="bg-white/15 text-white border-white/30 text-[10px]">Demo balance · 演示</Badge>
            </div>
            <div className="text-xs opacity-80 mt-1">Available balance · 可用余额 · CNY · Held by Canta's RMB settlement partner</div>
          </div>

          <ButtonGroup label="Wallet actions">
            <Button size="sm" variant="secondary" onClick={() => toast.success("Withdrawal request sent to your verified RMB bank account")}>
              <ArrowDownLeft className="h-4 w-4 mr-2" /> Withdraw to bank 提现到银行
            </Button>
            <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => toast.success("Statement downloaded")}>
              <Download className="h-4 w-4 mr-2" /> Statement 对账单
            </Button>
          </ButtonGroup>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          <MiniStat label="Awaiting settlement · 待结算" value={`¥${pendingRmb.toLocaleString()}`} />
          <MiniStat label="Settled this month · 本月已结算" value={`¥${monthRmb.toLocaleString()}`} />
          <MiniStat label="Linked bank · 收款银行" value="ICBC ****4821" />
        </div>
      </Card>

      {!verified && (
        <Card className="p-3 text-xs text-amber-800 bg-amber-50 border-amber-300">
          Withdrawals are on hold until verification is complete. 请先完成认证再提现。{" "}
          <Link to="/supplier-portal/verification" className="underline font-semibold">Verify now →</Link>
        </Card>
      )}

      {/* Incoming settlements */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Incoming settlements · 即将到账</div>
          <Badge variant="outline" className="text-xs">{pending.length} in progress</Badge>
        </div>
        {pending.length === 0 ? (
          <div className="text-xs text-muted-foreground py-6 text-center">No settlements in progress. 暂无待结算款项。</div>
        ) : (
          <ul className="space-y-2">
            {pending.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">{r.buyer}</div>
                  <div className="text-xs text-muted-foreground font-mono">{r.id} · {r.invoiceNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">+¥{r.amountRmb.toLocaleString()}</div>
                  <Badge className={`${STATUS_TONE[r.status]} text-[10px] mt-1`}>{r.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* History */}
      <Card className="p-5">
        <div className="text-sm font-semibold mb-3 flex items-center gap-2"><Landmark className="h-4 w-4" /> Recent RMB credits · 最近入账</div>
        {settled.length === 0 ? (
          <div className="text-xs text-muted-foreground py-6 text-center">No settled payments yet.</div>
        ) : (
          <ul className="divide-y">
            {settled.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm">Settlement from {r.buyer}</div>
                  <div className="text-xs text-muted-foreground">{r.paidDate ?? r.updated} · Ref {r.payoutRef ?? "—"}</div>
                </div>
                <div className="text-sm font-semibold text-emerald-700 tabular-nums">+¥{r.amountRmb.toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">
        {COMPLIANCE_DISCLAIMER}
      </Card>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 border border-white/20 p-3">
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-sm font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  );
}
