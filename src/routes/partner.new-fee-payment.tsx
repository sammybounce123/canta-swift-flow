import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { usePartnerProjects } from "@/lib/partner-projects";
import {
  PARTNER_FEE_ACCOUNT,
  buildQuote,
  clientEmailMessage,
  clientWhatsAppMessage,
  createPartnerFeeCase,
  formatFx,
  formatNgn,
  paymentLinkUrl,
  type ClientPaymentCase,
} from "@/lib/partner-payments";
import { canReceivePayout, maskAccountNumber, PAYOUT_STATUS_TONE } from "@/lib/payout-security";
import { setPartnerIdHint, type IdMethod } from "@/lib/partner-kyc";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/partner/new-fee-payment")({
  head: () => ({
    meta: [
      { title: "New Partner Fee Payment — Kingsbridge Property Partners" },
      {
        name: "description",
        content:
          "Create a partner fee payment using the same client payment flow: client details, fee account, FX quote and a secure NGN payment link.",
      },
      { property: "og:title", content: "New Partner Fee Payment — Kingsbridge Property Partners" },
      {
        property: "og:description",
        content: "Collect partner fees through the same consent-first client payment link flow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewFeePaymentPage,
});

const STEPS = ["Client details", "Fee destination", "Fee amount & quote", "Payment link"];

const FEE_PURPOSES = [
  "Partner service fee",
  "Reservation / booking fee",
  "Advisory fee",
  "Administration fee",
];

function copyText(text: string, label: string) {
  if (typeof navigator === "undefined") return;
  navigator.clipboard?.writeText(text);
  toast.success(`${label} copied`);
}

function NewFeePaymentPage() {
  const navigate = useNavigate();
  const { user } = usePartnerRole();
  const projects = usePartnerProjects();
  const [step, setStep] = useState(0);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [property, setProperty] = useState("");
  const [purpose, setPurpose] = useState(FEE_PURPOSES[0]);
  const [notes, setNotes] = useState("");
  const [idHintMethod, setIdHintMethod] = useState<IdMethod>("BVN");
  const [idHintLast4, setIdHintLast4] = useState("");
  const [amount, setAmount] = useState("");
  const [created, setCreated] = useState<ClientPaymentCase | null>(null);

  const amountNum = Number(amount.replace(/,/g, "")) || 0;
  const destinationOk = canReceivePayout(PARTNER_FEE_ACCOUNT.status);
  const preview = useMemo(
    () => (amountNum > 0 ? buildQuote(amountNum, "GBP") : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [amountNum, step],
  );

  const canNext = () => {
    if (step === 0) return !!(clientName.trim() && clientEmail.trim() && property.trim());
    if (step === 1) return destinationOk;
    if (step === 2) return amountNum > 0 && destinationOk;
    return false;
  };

  const submit = () => {
    if (!destinationOk) {
      toast.error("Partner fee account is not verified — payment link blocked.");
      return;
    }
    const kase = createPartnerFeeCase({
      clientName,
      clientEmail,
      clientPhone,
      country,
      property,
      purpose,
      notes,
      feeAmount: amountNum,
      createdBy: user?.name ?? "Partner user",
    });
    if (idHintLast4.trim()) {
      setPartnerIdHint(kase.id, { method: idHintMethod, last4: idHintLast4.trim() });
    }
    setCreated(kase);
    setStep(3);
    toast.success(`Partner fee payment ${kase.id} created`);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <ReadinessBar
        status="Demo Preview"
        cue="Partner fees use the same consent-first client payment flow, but settle to the Partner Fee Account."
      />
      <div>
        <h1 className="text-2xl font-semibold">New Partner Fee Payment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Same journey as a client payment case: client details, destination account, FX quote and a
          secure NGN payment link the client completes themselves.
        </p>
      </div>

      <ol className="flex flex-wrap gap-2 text-xs">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`px-3 py-1.5 rounded-full border ${
              i === step
                ? "bg-primary text-primary-foreground border-primary"
                : i < step
                  ? "bg-secondary text-foreground border-border"
                  : "text-muted-foreground border-border"
            }`}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <Card className="p-5 shadow-card space-y-4">
        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Client name">
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </Field>
            <Field label="Client email">
              <Input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </Field>
            <Field label="Client WhatsApp / phone">
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
            </Field>
            <Field label="Country">
              <Input value={country} onChange={(e) => setCountry(e.target.value)} />
            </Field>
            <Field label="Property / project">
              <div className="space-y-1.5">
                <Select
                  value={projects.some((p) => p.name === property) ? property : "__other"}
                  onValueChange={(v) => setProperty(v === "__other" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name} — {p.location}
                      </SelectItem>
                    ))}
                    <SelectItem value="__other">Other / not listed</SelectItem>
                  </SelectContent>
                </Select>
                {!projects.some((p) => p.name === property) && (
                  <Input
                    value={property}
                    onChange={(e) => setProperty(e.target.value)}
                    placeholder="Type the property or project"
                  />
                )}
              </div>
            </Field>
            <Field label="Fee purpose">
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEE_PURPOSES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
              <Field label="Expected ID type (optional hint)">
                <Select value={idHintMethod} onValueChange={(v) => setIdHintMethod(v as IdMethod)}>
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
              </Field>
              <Field label="Last 4 digits (optional hint)">
                <Input
                  value={idHintLast4}
                  maxLength={4}
                  onChange={(e) => setIdHintLast4(e.target.value.replace(/\D/g, ""))}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs font-medium">Notes</Label>
              <Textarea
                className="mt-1.5"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <p className="md:col-span-2 text-[11px] text-muted-foreground">
              The client personally consents and completes identity verification on the payment
              link. Never collect BVN, NIN or passport details on their behalf.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Fee settlement destination</div>
            <div className="p-4 rounded-lg border space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-sm">{PARTNER_FEE_ACCOUNT.label}</div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${PAYOUT_STATUS_TONE[PARTNER_FEE_ACCOUNT.status]}`}
                >
                  {PARTNER_FEE_ACCOUNT.status}
                </Badge>
              </div>
              <Row label="Account name" value={PARTNER_FEE_ACCOUNT.accountName} />
              <Row label="Bank" value={PARTNER_FEE_ACCOUNT.bank} />
              <Row
                label="Account number"
                value={maskAccountNumber(PARTNER_FEE_ACCOUNT.accountNumber)}
              />
              <Row label="SWIFT" value={PARTNER_FEE_ACCOUNT.swift} />
              <Row label="Currency" value={PARTNER_FEE_ACCOUNT.currency} />
            </div>
            {!destinationOk && (
              <div className="flex items-start gap-2 text-xs text-destructive">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                Partner fee account is not verified — settlement is blocked until Ops verifies it.
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Partner fees never mix with solicitor remittances — they settle only to this verified
              GBP account.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Field label="Fee amount the partner receives (GBP)">
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
              />
            </Field>
            {preview && (
              <div className="p-4 rounded-lg border bg-secondary/30 space-y-2 text-sm">
                <Row label="Partner receives" value={formatFx(preview.payoutAmount, "GBP")} />
                <Row label="Client pays" value={formatNgn(preview.ngnTotal)} />
                <Row label="FX rate" value={`1 GBP = ₦${preview.rate}`} />
                <Row
                  label="Quote expires"
                  value={new Date(preview.expiresAt).toLocaleTimeString()}
                />
              </div>
            )}
          </div>
        )}

        {step === 3 && created && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Fee payment link created for {created.clientName}
            </div>
            <div className="p-4 rounded-lg border space-y-2 text-sm">
              <Row label="Fee case" value={created.id} />
              <Row label="Partner receives" value={formatFx(created.quote.payoutAmount, "GBP")} />
              <Row label="Client pays" value={formatNgn(created.quote.ngnTotal)} />
              <Row label="Payment link" value={paymentLinkUrl(created.linkId)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => copyText(paymentLinkUrl(created.linkId), "Payment link")}
              >
                <Copy className="h-4 w-4 mr-1.5" /> Copy link
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  copyText(
                    clientWhatsAppMessage(created, PARTNER_FEE_ACCOUNT.label),
                    "WhatsApp message",
                  )
                }
              >
                Copy WhatsApp message
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  copyText(clientEmailMessage(created, PARTNER_FEE_ACCOUNT.label), "Email message")
                }
              >
                Copy email
              </Button>
              <Button asChild>
                <Link to="/partner/payment-cases/$caseId" params={{ caseId: created.id }}>
                  Open fee case
                </Link>
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <Button
            variant="outline"
            disabled={step === 0 || step === 3}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
          {step < 2 && (
            <Button disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
              Next <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          )}
          {step === 2 && (
            <Button disabled={!canNext()} onClick={submit}>
              Create fee payment link
            </Button>
          )}
          {step === 3 && (
            <Button variant="outline" onClick={() => navigate({ to: "/partner/fee-payments" })}>
              Done
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-right break-all">{value}</span>
    </div>
  );
}
