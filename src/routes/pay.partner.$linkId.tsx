import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getSolicitor } from "@/lib/partner";
import {
  formatFx,
  formatNgn,
  markCaseLinkViewed,
  quoteExpired,
  simulateClientPayment,
  usePartnerPayments,
} from "@/lib/partner-payments";

export const Route = createFileRoute("/pay/partner/$linkId")({
  head: () => ({
    meta: [
      { title: "Secure Property Payment — Canta" },
      {
        name: "description",
        content:
          "Pay your property solicitor payment in Naira. See the solicitor amount, FX rate and quote expiry before paying.",
      },
      { property: "og:title", content: "Secure Property Payment — Canta" },
      {
        property: "og:description",
        content: "Client payment page for a partner-managed property payment case.",
      },
    ],
  }),
  component: ClientPayPage,
});

function useCountdown(expiresAt: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return "Expired";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function ClientPayPage() {
  const { linkId } = useParams({ from: "/pay/partner/$linkId" });
  const { cases } = usePartnerPayments();
  const kase = cases.find((c) => c.linkId === linkId);

  useEffect(() => {
    if (kase) markCaseLinkViewed(kase.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kase?.id]);

  const countdown = useCountdown(kase?.quote.expiresAt ?? new Date().toISOString());

  if (!kase) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <Card className="p-8 text-center text-sm text-muted-foreground">
          This payment link is not available. Please contact your property partner.
        </Card>
      </div>
    );
  }

  const solicitor = getSolicitor(kase.solicitorId);
  const expired = quoteExpired(kase.quote);
  const paid = !!kase.ngnReceived;

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Secure property payment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Arranged by {kase.partnerName} · Powered by Canta
        </p>
      </div>

      <Card className="p-5 shadow-card space-y-3">
        <Row label="Client" value={kase.clientName} />
        <Row label="Property / project" value={kase.property} />
        <Row label="Solicitor" value={solicitor?.firm ?? "—"} />
        <div className="rounded-lg border p-4 space-y-2 bg-secondary/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Solicitor receives</span>
            <span className="text-lg font-semibold">
              {formatFx(kase.quote.payoutAmount, kase.payoutCurrency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">You pay</span>
            <span className="text-lg font-semibold">{formatNgn(kase.quote.ngnTotal)}</span>
          </div>
        </div>
        <Row label="FX rate" value={`1 ${kase.payoutCurrency} = ₦${kase.quote.rate}`} />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Quote expires in</span>
          <Badge variant="outline" className={expired ? "text-destructive" : ""}>
            {countdown}
          </Badge>
        </div>
      </Card>

      <Card className="p-5 shadow-card space-y-2 text-sm">
        <h2 className="font-medium">Payment instructions</h2>
        <p className="text-muted-foreground text-xs">
          Pay the NGN amount before the quote expires. If payment is received after expiry, Canta
          may require a refreshed quote.
        </p>
        <div className="rounded-lg border p-3 text-xs space-y-1">
          <div>Bank: Providus Bank</div>
          <div>Account name: Canta Payments — {kase.partnerName}</div>
          <div>Account number: 9901{kase.id.replace(/\D/g, "").slice(-6)}</div>
          <div>Reference: {kase.id}</div>
        </div>
        <Button
          className="w-full"
          disabled={expired || paid}
          onClick={() => {
            const r = simulateClientPayment(kase.id);
            if (r.ok) toast.success("Payment simulated — thank you");
            else toast.error(r.error ?? "Payment could not be recorded");
          }}
        >
          {paid ? "Payment received" : "Simulate my payment — demo only"}
        </Button>
        <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 pt-1">
          <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          Funds are remitted only to the solicitor account verified by Canta for this case. Canta
          may request identity or source-of-funds documents before settlement.
        </p>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
