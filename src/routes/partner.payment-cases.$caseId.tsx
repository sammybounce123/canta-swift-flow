import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { getSolicitor } from "@/lib/partner";
import {
  PARTNER_FEE_ACCOUNT,
  isFeeCase,
  clientEmailMessage,
  clientWhatsAppMessage,
  formatFx,
  formatNgn,
  listSolicitorAccounts,
  markCaseLinkSent,
  partnerCaseTone,
  paymentLinkUrl,
  quoteExpired,
  refreshCaseQuote,
  usePartnerPayments,
} from "@/lib/partner-payments";
import { maskAccountNumber, PAYOUT_STATUS_TONE, payoutBlockReason } from "@/lib/payout-security";
import { ReadinessBar } from "@/components/ReadinessBar";
import { getKyc, useKycState } from "@/lib/partner-kyc";
import { formatIsoDateTime } from "@/lib/hydration-time";

export const Route = createFileRoute("/partner/payment-cases/$caseId")({
  head: () => ({
    meta: [
      { title: "Client Payment Case — Kingsbridge Property Partners" },
      {
        name: "description",
        content: "Client payment case detail: solicitor mapping, FX quote, settlement and receipt.",
      },
      { property: "og:title", content: "Client Payment Case — Kingsbridge Property Partners" },
      {
        property: "og:description",
        content: "Track a single client payment case from NGN payment to solicitor payout.",
      },
    ],
  }),
  component: CaseDetail,
});

function copyText(text: string, label: string) {
  if (typeof navigator === "undefined") return;
  navigator.clipboard?.writeText(text);
  toast.success(`${label} copied`);
}

function CaseDetail() {
  const { caseId } = useParams({ from: "/partner/payment-cases/$caseId" });
  const { cases } = usePartnerPayments();
  useKycState();
  const kase = cases.find((c) => c.id === caseId);

  if (!kase) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        Payment case not found.{" "}
        <Link to="/partner/payment-cases" className="text-primary underline">
          Back to cases
        </Link>
      </Card>
    );
  }

  const fee = isFeeCase(kase);
  const solicitor = getSolicitor(kase.solicitorId);
  const beneficiaryName = fee ? PARTNER_FEE_ACCOUNT.accountName : (solicitor?.firm ?? "—");
  const account = listSolicitorAccounts().find((a) => a.id === kase.solicitorAccountId);
  const blocked = account ? payoutBlockReason(account.status) : "No settlement destination mapped.";
  const expired = quoteExpired(kase.quote);
  const receiptReady = kase.status === "Receipt Available";
  const kyc = getKyc(kase.id, kase.linkId);

  return (
    <div className="space-y-5">
      <ReadinessBar
        status="Demo Preview"
        cue="Settlement only runs to a verified solicitor payout account."
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{kase.clientName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {kase.id} · {kase.property} · {kase.purpose}
          </p>
        </div>
        <Badge variant="outline" className={`text-xs ${partnerCaseTone(kase.status)}`}>
          {kase.status}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 shadow-card lg:col-span-2 space-y-2 text-sm">
          <h2 className="font-medium mb-2">Summary</h2>
          <Row label="Client" value={`${kase.clientName} · ${kase.clientEmail}`} />
          <Row label="Property / project" value={kase.property} />
          <Row label="Partner" value={kase.partnerName} />
          <Row
            label={fee ? "Fee destination" : "Selected solicitor"}
            value={beneficiaryName}
          />
          <Row
            label="Settlement Destination"
            value={
              account
                ? `${account.accountName} · ${maskAccountNumber(account.accountNumber)} · ${account.currency}`
                : "—"
            }
          />
          <Row
            label="Solicitor receives"
            value={formatFx(kase.quote.payoutAmount, kase.payoutCurrency)}
          />
          <Row label="Client pays NGN" value={formatNgn(kase.quote.ngnTotal)} />
          <Row label="FX rate" value={`1 ${kase.payoutCurrency} = ₦${kase.quote.rate}`} />
          <Row
            label="Quote expiry"
            value={
              expired ? "Expired — refresh quote" : new Date(kase.quote.expiresAt).toLocaleString()
            }
          />
          <Row label="Client Payment Link" value={kase.linkId} />
          {account && (
            <Badge
              variant="outline"
              className={`text-[10px] ${PAYOUT_STATUS_TONE[account.status]}`}
            >
              Solicitor account: {account.status}
            </Badge>
          )}
          {blocked && (
            <p className="text-xs text-destructive pt-1">{blocked} Settlement is blocked.</p>
          )}
        </Card>

        <Card className="p-5 shadow-card space-y-2">
          <h2 className="font-medium text-sm mb-2">Actions</h2>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              refreshCaseQuote(kase.id);
              toast.success("FX quote refreshed");
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh quote
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => copyText(paymentLinkUrl(kase.linkId), "Payment link")}
          >
            <Copy className="h-4 w-4 mr-1.5" /> Copy payment link
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              markCaseLinkSent(kase.id, "Reminder");
              copyText(
                clientWhatsAppMessage(kase, beneficiaryName),
                "Reminder message",
              );
              toast.info("Sending is not configured in demo. Copy the message and send manually.");
            }}
          >
            <Send className="h-4 w-4 mr-1.5" /> Send reminder
          </Button>
          <Button asChild variant="outline" className="w-full justify-start">
            <Link to="/partner/solicitors">View solicitor</Link>
          </Button>
          <p className="text-[11px] text-muted-foreground border-t pt-2">
            Conversion, settlement and identity approval are performed by Canta Compliance/Ops. The
            client must consent and verify their identity on the payment link before an NGN account
            is issued.
          </p>

          <Button
            className="w-full justify-start"
            disabled={!receiptReady}
            onClick={() => {
              const text = [
                `Canta receipt ${kase.receiptId}`,
                `Case ${kase.id}`,
                `Client ${kase.clientName} paid ${formatNgn(kase.ngnReceived ?? 0)}`,
                `${beneficiaryName} received ${formatFx(kase.quote.payoutAmount, kase.payoutCurrency)}`,
                `Provider reference ${kase.providerRef}`,
              ].join("\n");
              const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
              const a = document.createElement("a");
              a.href = url;
              a.download = `${kase.receiptId}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4 mr-1.5" />
            {receiptReady ? "Download receipt" : "Receipt after provider confirmation"}
          </Button>
        </Card>
      </div>

      <Card className="p-5 shadow-card space-y-2">
        <h2 className="font-medium text-sm">Client consent &amp; identity</h2>
        <p className="text-[11px] text-muted-foreground">
          Canta stores masked identity references only. Partner staff cannot view the client's full
          BVN/NIN/passport or selfie.
        </p>
        <Row label="Link status" value={kyc.linkStatus} />
        <Row
          label="Consent"
          value={
            kyc.consent ? `Given ${formatIsoDateTime(kyc.consent.timestamp)}` : "Not yet given"
          }
        />
        <Row
          label="Identity"
          value={
            kyc.identity
              ? `${kyc.identity.status} · ${kyc.identity.method} ${kyc.identity.maskedRef}`
              : "Awaiting client submission"
          }
        />
        <Row
          label="Case NGN account"
          value={kyc.account ? `${kyc.account.accountNumber} · single-use` : "Not generated"}
        />
        {kyc.idHint && (
          <Row
            label="Partner ID hint"
            value={`${kyc.idHint.method} ••••${kyc.idHint.last4} — ${kyc.idHint.note}`}
          />
        )}
        {kyc.flags.filter((f) => f.state === "Open").length > 0 && (
          <p className="text-xs text-destructive">
            {kyc.flags.filter((f) => f.state === "Open").length} open compliance flag(s) — Canta Ops
            review required.
          </p>
        )}
      </Card>

      <Card className="p-5 shadow-card">
        <h2 className="font-medium text-sm mb-3">Timeline</h2>
        <ol className="space-y-2 text-sm">
          {kase.timeline.map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-xs text-muted-foreground w-40 shrink-0 tabular-nums">
                {formatIsoDateTime(t.ts)}
              </span>
              <span>
                {t.label}
                {t.note && <span className="text-muted-foreground"> — {t.note}</span>}
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="p-5 shadow-card">
        <h2 className="font-medium text-sm mb-2">Client message</h2>
        <pre className="text-xs whitespace-pre-wrap bg-secondary/30 rounded-lg p-3">
          {clientEmailMessage(kase, beneficiaryName)}
        </pre>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() =>
            copyText(clientEmailMessage(kase, beneficiaryName), "Email message")
          }
        >
          <Copy className="h-4 w-4 mr-1.5" /> Copy email message
        </Button>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
