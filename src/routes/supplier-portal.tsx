import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Factory, Users, Receipt, Wallet,
  ArrowRight, Clock, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";
import { ButtonGroup } from "@/components/ui/action-group";
import {
  SUPPLIER_TABS, REQUESTS, COMPLIANCE_DISCLAIMER,
  KPI, useVerified, verifiedStore, useFxQuotes,
} from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal")({
  head: () => ({ meta: [{ title: "Supplier Portal — Canta" }] }),
  component: SupplierPortalLayout,
});

function SupplierPortalLayout() {
  const verified = useVerified();
  const fxQuotes = useFxQuotes();
  const [invite, setInvite] = useState<null | "buyer" | "request">(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPaymentRequests = pathname === "/supplier-portal/payment-requests" || pathname.startsWith("/supplier-portal/payment-requests/");

  const totals = {
    pending: REQUESTS.filter((r) => r.status === "Awaiting Buyer Payment").length,
    ngnHeld: REQUESTS.filter((r) => ["NGN Received","Compliance Review","FX Processing"].includes(r.status))
      .reduce((s, r) => s + r.amountNgn, 0),
    rmbPaid: REQUESTS.filter((r) => r.status === "RMB Paid").reduce((s, r) => s + r.amountRmb, 0),
    buyers: new Set(REQUESTS.map((r) => r.buyer)).size,
  };
  const activeQuoteCount = fxQuotes.filter((q) =>
    q.status === "Quote Generated" || q.status === "Rate Locked" || q.status === "Sent to Buyer",
  ).length;

  return (
    <div className="space-y-6">
      <nav aria-label="Supplier Portal sections" className="flex w-full min-w-0 flex-wrap items-stretch justify-start gap-3">
        {SUPPLIER_TABS.map((item) => {
          const active = item.to === "/supplier-portal"
            ? pathname === "/supplier-portal" || pathname === "/supplier-portal/"
            : pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`inline-flex min-h-11 max-w-full flex-none shrink-0 items-center justify-center whitespace-normal break-words rounded-lg border-2 px-4 py-2.5 text-center text-sm font-semibold leading-snug shadow-sm transition-all hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {!isPaymentRequests && (
        <>
          <ReadinessBar
            status="Demo Preview"
            cue="Interactive demo — buyers, invoices, FX quotes and RMB wallet shown here are illustrative. 演示环境"
          />

          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <Badge variant="outline" className="gap-1"><Factory className="h-3 w-3" /> Supplier Portal · 供应商门户</Badge>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <h1 className="text-2xl font-semibold tracking-tight">欢迎, Li Wei 👋</h1>
                <Badge variant="outline" className="text-[10px]">Demo persona · 演示账户</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Your Nigerian buyer pays in <strong>NGN</strong> to Canta's designated NGN collection account. Canta reviews compliance, converts at the locked FX rate, and settles you in <strong>RMB</strong> to your verified RMB payout account. You never make outbound payments here — this portal is receive-only.
                <br />
                <span className="text-xs">尼日利亚买家用奈拉付款至 Canta 合规收款账户，Canta 审核合规后按锁定汇率换汇，将人民币直接结算至您的钱包。</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className="text-xs bg-primary/10 text-primary border-primary/30">Li Wei · Supplier Admin</Badge>
                <Badge variant="outline" className="text-xs">Guangzhou Tech Factory · 广州</Badge>
              </div>
            </div>

            <ButtonGroup label="Supplier portal actions" className="w-auto justify-start md:justify-end">
              <Button variant="outline" size="sm" onClick={() => setInvite("buyer")}>
                <Users className="h-4 w-4 mr-2" /> Add buyer 添加买家
              </Button>
              <Button size="sm" asChild>
                <Link to="/supplier-portal/payment-requests" search={{ new: true }}>
                  <Receipt className="h-4 w-4 mr-2" /> New payment request 新建收款
                </Link>
              </Button>
            </ButtonGroup>
          </header>

          {!verified && (
            <Card className="p-4 border-amber-300 bg-amber-50 text-amber-900 flex items-start gap-3">
              <Lock className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm flex-1">
                <div className="font-semibold">Verify your business to unlock RMB payouts · 完成认证以解锁人民币结算</div>
                <div className="text-xs mt-1">You can view requests and upload documents now. RMB wallet payouts unlock after verification.</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => { verifiedStore.set(true); toast.success("Verification simulated — RMB payouts enabled"); }}>
                Verify now
              </Button>
            </Card>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="RMB Settlement Balance · 待结算余额" value="¥128,400" icon={Wallet} />
            <KPI label="Awaiting Settlement · 待结算" value={`¥${(totals.ngnHeld / 204).toLocaleString(undefined,{maximumFractionDigits:0})}`} icon={Clock} />
            <KPI label="Active Payment Requests · 收款中" value={String(totals.pending + activeQuoteCount)} icon={Receipt} />
            <KPI label="Nigerian Buyers · 买家" value={String(totals.buyers)} icon={Users} />
          </div>

          <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">
            {COMPLIANCE_DISCLAIMER}
          </Card>
        </>
      )}


      <section className="space-y-4">
        <Outlet />
      </section>

      <Dialog open={!!invite} onOpenChange={(o) => !o && setInvite(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{invite === "buyer" ? "Add Nigerian buyer" : "New payment request"}</DialogTitle>
            <DialogDescription>
              {invite === "buyer"
                ? "Invite a Nigerian buyer to pay you through Canta. Buyer pays in NGN; you receive RMB settlement."
                : "Send a payment request to a Nigerian buyer. Buyer receives a Canta NGN payment link; you receive RMB after payment, FX processing, and compliance approval."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {invite === "buyer" ? (
              <>
                <div><Label className="text-xs">Buyer company</Label><Input placeholder="e.g. Zenith Imports Nigeria" /></div>
                <div><Label className="text-xs">Buyer contact name</Label><Input placeholder="e.g. Tunde Bakare" /></div>
                <div><Label className="text-xs">Buyer WhatsApp or email</Label><Input placeholder="+234 802 111 2233 or tunde@zenithimports.ng" /></div>
                <div><Label className="text-xs">Goods / order description</Label><Input placeholder="Bluetooth speakers x 500" /></div>
                <div><Label className="text-xs">Expected invoice amount (RMB)</Label><Input type="number" placeholder="50000" /></div>
                <div><Label className="text-xs">Notes to buyer</Label><Textarea placeholder="50% deposit, balance on BL" /></div>
                <div className="text-[11px] text-muted-foreground italic">Canta will create a payment reference automatically after you send the invite.</div>
              </>
            ) : (
              <>
                <div><Label className="text-xs">Nigerian buyer</Label><Input placeholder="Zenith Imports Nigeria" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Invoice number</Label><Input placeholder="INV-2026-091" /></div>
                  <div><Label className="text-xs">Amount to receive (RMB)</Label><Input type="number" placeholder="50000" /></div>
                </div>
                <div><Label className="text-xs">Goods / order description</Label><Input placeholder="Bluetooth speakers x 500" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Expiry date</Label><Input type="date" /></div>
                  <div><Label className="text-xs">Settlement currency</Label><Input placeholder="RMB (default)" defaultValue="RMB" /></div>
                </div>
                <div><Label className="text-xs">Notes for buyer</Label><Textarea placeholder="50% deposit, balance on BL" /></div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInvite(null)}>Cancel</Button>
            <Button onClick={() => { setInvite(null); toast.success(invite === "buyer" ? "Buyer invitation sent" : "Payment request sent"); }}>
              {invite === "buyer" ? "Send invitation" : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!isPaymentRequests && (
        <Card className="p-4 text-xs text-muted-foreground">
          <Link to="/welcome" className="inline-flex items-center gap-1 hover:underline">
            Switch workspace <ArrowRight className="h-3 w-3" />
          </Link>
        </Card>
      )}
    </div>
  );
}
