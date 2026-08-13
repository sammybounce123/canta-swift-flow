import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  PARTNER_FEE_ACCOUNT,
  confirmFeePayment,
  createPartnerFeePayment,
  formatFx,
  formatNgn,
  partnerCaseTone,
  paymentLinkUrl,
  quoteExpired,
  refreshFeeQuote,
  simulateFeePayment,
  usePartnerPayments,
} from "@/lib/partner-payments";
import { maskAccountNumber, PAYOUT_STATUS_TONE } from "@/lib/payout-security";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/partner/fee-payments")({
  head: () => ({
    meta: [
      { title: "Partner Fee Payments — Kingsbridge Property Partners" },
      {
        name: "description",
        content:
          "Partner fee payments settle separately to the verified Partner GBP account, never mixed with solicitor remittances.",
      },
      { property: "og:title", content: "Partner Fee Payments — Kingsbridge Property Partners" },
      {
        property: "og:description",
        content: "Create and track partner fee payments separate from solicitor payouts.",
      },
    ],
  }),
  component: FeePaymentsPage,
});

function FeePaymentsPage() {
  const { fees } = usePartnerPayments();
  const [clientName, setClientName] = useState("");
  const [property, setProperty] = useState("");
  const [feeAmount, setFeeAmount] = useState("5000");

  const create = () => {
    const amt = Number(feeAmount.replace(/,/g, "")) || 0;
    if (!clientName.trim() || amt <= 0) {
      toast.error("Client and fee amount are required");
      return;
    }
    const fee = createPartnerFeePayment({ clientName, property, feeAmount: amt });
    toast.success(`Partner fee payment ${fee.id} created`);
    setClientName("");
    setProperty("");
  };

  return (
    <div className="space-y-5">
      <ReadinessBar
        status="Demo Preview"
        cue="Partner fees are a separate payment from the solicitor remittance."
      />
      <div>
        <h1 className="text-2xl font-semibold">Partner Fee Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Partner fees are collected separately from the solicitor payment and settle only to the
          verified Partner GBP account.
        </p>
      </div>

      <Card className="p-5 shadow-card space-y-3">
        <h2 className="font-medium text-sm">Create Partner Fee Payment</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Client</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Property / project</Label>
            <Input value={property} onChange={(e) => setProperty(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fee amount (GBP)</Label>
            <Input value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Destination: {PARTNER_FEE_ACCOUNT.label} · {PARTNER_FEE_ACCOUNT.bank} ·{" "}
          {maskAccountNumber(PARTNER_FEE_ACCOUNT.accountNumber)}{" "}
          <Badge
            variant="outline"
            className={`ml-1 text-[10px] ${PAYOUT_STATUS_TONE[PARTNER_FEE_ACCOUNT.status]}`}
          >
            {PARTNER_FEE_ACCOUNT.status}
          </Badge>
        </div>
        <Button onClick={create}>Create Partner Fee Payment</Button>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Fee ID</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Property</th>
                <th className="py-3 px-3 text-right">Fee</th>
                <th className="py-3 px-3 text-right">Client pays NGN</th>
                <th className="py-3 px-3">Rate</th>
                <th className="py-3 px-3">Quote</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.id} className="border-t hover:bg-secondary/30">
                  <td className="py-3 px-3 font-mono text-xs">{f.id}</td>
                  <td className="py-3 px-3">{f.clientName}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{f.property || "—"}</td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatFx(f.feeAmount, "GBP")}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatNgn(f.quote.ngnTotal)}
                  </td>
                  <td className="py-3 px-3 text-xs">1 GBP = ₦{f.quote.rate}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">
                    {quoteExpired(f.quote)
                      ? "Expired"
                      : new Date(f.quote.expiresAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className={`text-[10px] ${partnerCaseTone(f.status)}`}>
                      {f.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard?.writeText(paymentLinkUrl(f.linkId));
                          toast.success("Fee payment link copied");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          refreshFeeQuote(f.id);
                          toast.success("Quote refreshed");
                        }}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh quote
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const r = simulateFeePayment(f.id);
                          if (r.ok) toast.success("Fee payment received");
                          else toast.error(r.error ?? "Blocked");
                        }}
                      >
                        Simulate client payment — demo only
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const r = confirmFeePayment(f.id);
                          if (r.ok) toast.success("Partner fee settled — receipt available");
                          else toast.error(r.error ?? "Blocked");
                        }}
                      >
                        Simulate provider confirmation — demo only
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {fees.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    No partner fee payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
