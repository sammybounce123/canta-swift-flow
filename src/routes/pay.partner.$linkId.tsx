import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, Copy, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getSolicitor } from "@/lib/partner";
import {
  formatFx,
  formatNgn,
  markCaseLinkViewed,
  quoteExpired,
  simulateClientPayment,
  usePartnerPayments,
  verifiedAccount,
} from "@/lib/partner-payments";
import {
  CONSENT_TEXT,
  CONSENT_TEXT_VERSION,
  PRIVACY_POLICY_VERSION,
  generateCaseAccount,
  getKyc,
  recordConsent,
  submitIdentity,
  useKycState,
  type IdMethod,
  type IdentityOutcome,
} from "@/lib/partner-kyc";
import { countdownTo, formatIsoDateTime, useNow } from "@/lib/hydration-time";

export const Route = createFileRoute("/pay/partner/$linkId")({
  head: () => ({
    meta: [
      { title: "Secure Property Payment — Canta" },
      {
        name: "description",
        content:
          "Consent, verify your identity and pay your property solicitor payment in Naira before the quote expires.",
      },
      { property: "og:title", content: "Secure Property Payment — Canta" },
      {
        property: "og:description",
        content:
          "Client consent, identity verification and NGN payment for a partner-managed property payment case.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClientPayPage,
});

function ClientPayPage() {
  const { linkId } = useParams({ from: "/pay/partner/$linkId" });
  const { cases } = usePartnerPayments();
  useKycState();
  const kase = cases.find((c) => c.linkId === linkId);
  const now = useNow();

  useEffect(() => {
    if (kase) markCaseLinkViewed(kase.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kase?.id]);

  // consent form state
  const [consented, setConsented] = useState(false);
  // identity form state
  const [method, setMethod] = useState<IdMethod>("BVN");
  const [reference, setReference] = useState("");
  const [passportCountry, setPassportCountry] = useState("Nigeria");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [outcome, setOutcome] = useState<IdentityOutcome>("match");
  const [payAmount, setPayAmount] = useState("");

  if (!kase) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <Card className="p-8 text-center text-sm text-muted-foreground">
          This payment link is not available. Please contact your property partner.
        </Card>
      </div>
    );
  }

  const kyc = getKyc(kase.id, kase.linkId);
  const solicitor = getSolicitor(kase.solicitorId);
  const solicitorVerified = !!verifiedAccount(kase.solicitorId, kase.payoutCurrency);
  const expired = quoteExpired(kase.quote);
  const cd = countdownTo(kase.quote.expiresAt, now);
  const countdown = cd
    ? cd.expired
      ? "Expired"
      : `${cd.minutes}m ${String(cd.seconds).padStart(2, "0")}s`
    : "—";
  const highValue = kase.quote.ngnTotal >= 100_000_000;

  const stage: "consent" | "identity" | "account" | "pay" | "done" = kyc.payment
    ? "done"
    : kyc.account
      ? "pay"
      : kyc.identity?.status === "Identity Verified"
        ? "account"
        : kyc.consent
          ? "identity"
          : "consent";

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Secure property payment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your payment request was created by {kase.partnerName}. Canta will process your identity
          verification and payment securely.
        </p>
      </div>

      {/* 1. Payment details */}
      <Card className="p-5 shadow-card space-y-3">
        <Row label="Partner" value={kase.partnerName} />
        <Row label="Client" value={kase.clientName} />
        <Row label="Property / project" value={kase.property} />
        <Row label="Payment purpose" value={kase.purpose} />
        <Row label="Solicitor / law firm" value={solicitor?.firm ?? "—"} />
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
        <p className="text-[11px] text-muted-foreground">
          This rate is time-bound. Pay the exact NGN amount before the quote expires. If payment is
          received after expiry, Canta may require a refreshed quote before settlement.
        </p>
      </Card>

      {/* 2. Consent */}
      {stage === "consent" && (
        <Card className="p-5 shadow-card space-y-3">
          <h2 className="font-medium text-sm">Your consent</h2>
          <p className="text-xs text-muted-foreground">
            Before we can verify your identity and generate your NGN payment account, you must
            consent to {kase.partnerName} sharing your details with Canta and to Canta processing
            your data for verification, compliance, and payment processing.
          </p>
          <label className="flex gap-3 items-start rounded-lg border p-3 text-xs leading-relaxed">
            <Checkbox
              checked={consented}
              onCheckedChange={(v) => setConsented(v === true)}
              aria-label="I consent"
            />
            <span>{CONSENT_TEXT}</span>
          </label>
          <div className="text-[11px] text-muted-foreground space-x-3">
            <a className="underline" href="/docs">
              Privacy Policy
            </a>
            <a className="underline" href="/docs">
              Terms of Service
            </a>
            <a className="underline" href="/docs">
              Data Processing Notice
            </a>
            <span>
              · Consent {CONSENT_TEXT_VERSION} · Privacy {PRIVACY_POLICY_VERSION}
            </span>
          </div>
          <Button
            className="w-full"
            disabled={!consented}
            onClick={() => {
              recordConsent({
                caseId: kase.id,
                linkId: kase.linkId,
                clientName: kase.clientName,
                contact: kase.clientEmail || kase.clientPhone,
              });
              toast.success("Consent recorded");
            }}
          >
            I consent — continue to identity verification
          </Button>
        </Card>
      )}

      {/* 3. Identity verification */}
      {stage === "identity" && (
        <Card className="p-5 shadow-card space-y-3">
          <h2 className="font-medium text-sm">Identity verification</h2>
          <p className="text-xs text-muted-foreground">
            Your BVN/NIN/passport is processed through Canta's approved verification provider. Canta
            stores only a masked reference — {kase.partnerName} never sees your full details.
          </p>
          {kyc.identity && kyc.identity.status !== "Identity Verified" && (
            <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {kyc.identity.status} — Canta Compliance is reviewing your submission. You cannot
                receive a payment account until this is resolved.
              </span>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Labeled label="ID type">
              <Select value={method} onValueChange={(v) => setMethod(v as IdMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["BVN", "NIN", "Passport"] as IdMethod[]).map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Labeled>
            <Labeled label={`${method} number`}>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={method === "Passport" ? "A01234567" : "22XXXXXXXXX"}
              />
            </Labeled>
            {method === "Passport" && (
              <>
                <Labeled label="Passport country">
                  <Input
                    value={passportCountry}
                    onChange={(e) => setPassportCountry(e.target.value)}
                  />
                </Labeled>
                <Labeled label="Passport expiry">
                  <Input
                    type="date"
                    value={passportExpiry}
                    onChange={(e) => setPassportExpiry(e.target.value)}
                  />
                </Labeled>
              </>
            )}
            <Labeled label="Date of birth">
              <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </Labeled>
            <Labeled label="Residential address">
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </Labeled>
            {highValue && (
              <div className="sm:col-span-2">
                <Labeled label="Source of funds (required for high-value payments)">
                  <Input
                    value={sourceOfFunds}
                    onChange={(e) => setSourceOfFunds(e.target.value)}
                    placeholder="e.g. Sale of property, business income"
                  />
                </Labeled>
              </div>
            )}
          </div>

          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-xs font-medium">Selfie / liveness check</div>
            <Button
              size="sm"
              variant={selfieCaptured ? "secondary" : "outline"}
              onClick={() => {
                setSelfieCaptured(true);
                toast.success("Selfie captured — demo only (no image is stored)");
              }}
            >
              {selfieCaptured ? "Selfie captured" : "Capture selfie — demo only"}
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Demo only: no image is captured or stored. Canta keeps a provider reference only.
            </p>
          </div>

          <Labeled label="Simulated provider result — demo only">
            <Select value={outcome} onValueChange={(v) => setOutcome(v as IdentityOutcome)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Simulate BVN/NIN match</SelectItem>
                <SelectItem value="mismatch">Simulate name mismatch</SelectItem>
                <SelectItem value="selfie-fail">Simulate selfie failure</SelectItem>
                <SelectItem value="sanctions">Simulate sanctions/PEP review</SelectItem>
              </SelectContent>
            </Select>
          </Labeled>

          <Button
            className="w-full"
            disabled={!reference.trim() || !selfieCaptured || (highValue && !sourceOfFunds.trim())}
            onClick={() => {
              const r = submitIdentity({
                caseId: kase.id,
                linkId: kase.linkId,
                clientName: kase.clientName,
                method,
                reference,
                passportCountry: method === "Passport" ? passportCountry : undefined,
                passportExpiry: method === "Passport" ? passportExpiry : undefined,
                dob,
                address,
                sourceOfFunds: sourceOfFunds || undefined,
                outcome,
              });
              setReference("");
              if (r.ok) toast.success("Identity verified");
              else toast.error(r.error ?? `${r.status} — Canta Compliance will review`);
            }}
          >
            Submit identity verification
          </Button>
        </Card>
      )}

      {/* 4. Account generation */}
      {stage === "account" && (
        <Card className="p-5 shadow-card space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 text-sm">
            <CheckCircle2 className="h-4 w-4" /> Identity verified
          </div>
          {expired ? (
            <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Quote expired — ask {kase.partnerName} to refresh the quote before paying.
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Your case-specific NGN account is single-use, bound to this payment amount and expires
              with the quote.
            </p>
          )}
          <Button
            className="w-full"
            disabled={expired || !solicitorVerified}
            onClick={() => {
              const r = generateCaseAccount({
                caseId: kase.id,
                linkId: kase.linkId,
                clientName: kase.clientName,
                partnerName: kase.partnerName,
                amountNgn: kase.quote.ngnTotal,
                expiresAt: kase.quote.expiresAt,
                quoteExpired: expired,
                solicitorVerified,
              });
              if (r.ok) toast.success("Case NGN account generated");
              else toast.error(r.error ?? "Account generation blocked");
            }}
          >
            Generate my NGN payment account
          </Button>
          {!solicitorVerified && (
            <p className="text-[11px] text-destructive">
              Solicitor payout account is not verified — payment cannot be collected yet.
            </p>
          )}
        </Card>
      )}

      {/* 5. Pay */}
      {stage === "pay" && kyc.account && (
        <Card className="p-5 shadow-card space-y-3 text-sm">
          <h2 className="font-medium">Pay into your case account</h2>
          <div className="rounded-lg border p-3 text-xs space-y-1">
            <CopyRow label="Bank" value={kyc.account.bank} />
            <CopyRow label="Account name" value={kyc.account.accountName} />
            <CopyRow label="Account number" value={kyc.account.accountNumber} />
            <CopyRow label="Exact amount" value={formatNgn(kyc.account.amountNgn)} />
            <CopyRow label="Payment reference" value={kyc.account.reference} />
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">Valid until</span>
              <span>{formatIsoDateTime(kyc.account.expiresAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quote expires in</span>
              <span className={expired ? "text-destructive" : ""}>{countdown}</span>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] items-end">
            <Labeled label="Amount you are paying (NGN) — demo only">
              <Input
                inputMode="decimal"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder={String(Math.round(kase.quote.ngnTotal))}
              />
            </Labeled>
            <Button
              onClick={() => {
                const amt = Number(payAmount.replace(/,/g, "")) || kase.quote.ngnTotal;
                const r = simulateClientPayment(kase.id, amt);
                if (!r.ok) toast.error(r.error ?? "Payment could not be recorded");
                else if (r.variance === "Exact") toast.success("Payment received — thank you");
                else toast.warning(`Payment held: ${r.variance}`);
              }}
            >
              Simulate my payment — demo only
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            Funds are remitted only to the solicitor account verified by Canta for this case. Canta
            may request identity or source-of-funds documents before settlement.
          </p>
        </Card>
      )}

      {/* 6. Result */}
      {stage === "done" && kyc.payment && (
        <Card className="p-5 shadow-card space-y-2 text-sm">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Payment received
          </div>
          <Row label="Amount received" value={formatNgn(kyc.payment.amountNgn)} />
          <Row label="Received" value={formatIsoDateTime(kyc.payment.receivedAt)} />
          <Row label="Status" value={kyc.payment.variance} />
          {kyc.payment.variance === "After expiry" && (
            <p className="text-xs text-destructive">
              Payment was received after the quote expired. A refreshed quote is required before
              conversion.
            </p>
          )}
          {kyc.payment.variance === "Underpaid" && (
            <p className="text-xs text-destructive">
              Partially paid — outstanding {formatNgn(kase.quote.ngnTotal - kyc.payment.amountNgn)}.
              Conversion is blocked until the balance is received.
            </p>
          )}
          {kyc.payment.variance === "Overpaid" && (
            <p className="text-xs text-destructive">
              Overpaid — Canta Ops will decide whether to refund or apply the excess before
              conversion.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Canta will convert and remit {formatFx(kase.quote.payoutAmount, kase.payoutCurrency)} to
            the verified solicitor account once compliance checks are complete.
          </p>
        </Card>
      )}
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

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <button
        type="button"
        className="font-medium flex items-center gap-1.5 hover:text-primary"
        onClick={() => {
          navigator.clipboard?.writeText(value);
          toast.success(`${label} copied`);
        }}
      >
        {value} <Copy className="h-3 w-3" />
      </button>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium leading-none">{label}</span>
      {children}
    </label>
  );
}
