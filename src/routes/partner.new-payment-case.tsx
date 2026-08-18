import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { SOLICITORS, getSolicitor, PARTNER_ORG } from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import {
  PAYOUT_CURRENCIES,
  accountsForSolicitor,
  buildQuote,
  clientEmailMessage,
  clientWhatsAppMessage,
  createClientPaymentCase,
  currencyBlockMessage,
  formatFx,
  formatNgn,
  paymentLinkUrl,
  usePartnerPayments,
  verifiedAccount,
  type ClientPaymentCase,
  type PayoutCurrency,
} from "@/lib/partner-payments";
import { canReceivePayout, maskAccountNumber, PAYOUT_STATUS_TONE } from "@/lib/payout-security";
import { setPartnerIdHint, type IdMethod } from "@/lib/partner-kyc";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/partner/new-payment-case")({
  head: () => ({
    meta: [
      { title: "New Client Payment Case — Kingsbridge Property Partners" },
      {
        name: "description",
        content:
          "Create a client payment case, map the client to a solicitor, generate an NGN payment link and track remittance.",
      },
      { property: "og:title", content: "New Client Payment Case — Kingsbridge Property Partners" },
      {
        property: "og:description",
        content: "Map a client to a solicitor and generate a Client Payment Link in NGN.",
      },
    ],
  }),
  component: NewPaymentCasePage,
});

const STEPS = [
  "Client details",
  "Select solicitor",
  "Payout currency",
  "Amount & quote",
  "Payment link",
];

function copyText(text: string, label: string) {
  if (typeof navigator === "undefined") return;
  navigator.clipboard?.writeText(text);
  toast.success(`${label} copied`);
}

function NewPaymentCasePage() {
  const navigate = useNavigate();
  const { user } = usePartnerRole();
  usePartnerPayments(); // subscribe to account changes
  const [step, setStep] = useState(0);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [property, setProperty] = useState("");
  const [purpose, setPurpose] = useState("Property purchase completion");
  const [notes, setNotes] = useState("");
  const [idHintMethod, setIdHintMethod] = useState<IdMethod>("BVN");
  const [idHintLast4, setIdHintLast4] = useState("");

  const [solicitorId, setSolicitorId] = useState("");
  const [currency, setCurrency] = useState<PayoutCurrency>("GBP");
  const [amount, setAmount] = useState("");
  const [created, setCreated] = useState<ClientPaymentCase | null>(null);

  const accounts = solicitorId ? accountsForSolicitor(solicitorId) : [];
  const account = solicitorId ? verifiedAccount(solicitorId, currency) : undefined;
  const currencyBlock = solicitorId ? currencyBlockMessage(solicitorId, currency) : null;
  const solicitor = getSolicitor(solicitorId);
  const amountNum = Number(amount.replace(/,/g, "")) || 0;

  const preview = useMemo(
    () => (amountNum > 0 ? buildQuote(amountNum, currency) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [amountNum, currency, step],
  );

  const canNext = () => {
    if (step === 0) return clientName.trim() && clientEmail.trim() && property.trim();
    if (step === 1) return !!solicitorId;
    if (step === 2) return !!account;
    if (step === 3) return amountNum > 0 && !!account;
    return false;
  };

  const submit = () => {
    if (!account) {
      toast.error("Select a verified solicitor payout account first.");
      return;
    }
    const kase = createClientPaymentCase({
      clientName,
      clientEmail,
      clientPhone,
      country,
      property,
      purpose,
      notes,
      solicitorId,
      solicitorAccountId: account.id,
      payoutCurrency: currency,
      payoutAmount: amountNum,
      createdBy: user?.name ?? "Partner",
    });
    setPartnerIdHint(kase.id, kase.linkId, {
      method: idHintMethod,
      last4: idHintLast4,
      assistedCapture: false,
    });
    setCreated(kase);
    setStep(4);
    toast.success(`Client Payment Case ${kase.id} created`);
  };

  return (
    <div className="space-y-5">
      <ReadinessBar
        status="Demo Preview"
        cue="The partner selects the solicitor — the client only pays the NGN amount."
      />
      <div>
        <h1 className="text-2xl font-semibold">New Client Payment Case</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a payment case, map the client to a solicitor, generate an NGN payment link, and
          track remittance to the solicitor.
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
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground"
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
              <Input value={property} onChange={(e) => setProperty(e.target.value)} />
            </Field>
            <Field label="Payment purpose">
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Property purchase completion",
                    "Deposit / reservation",
                    "Stage payment",
                    "Legal fees",
                    "Stamp duty & disbursements",
                  ].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </Field>
            </div>
            <div className="md:col-span-2 rounded-lg border p-3 space-y-3 bg-secondary/30">
              <div className="text-xs font-medium">
                Optional ID hint — never a substitute for client consent
              </div>
              <p className="text-[11px] text-muted-foreground">
                You may record the ID type and last 4 digits only. The client must personally
                consent and submit their BVN/NIN/passport and selfie through the secure payment
                link. Do not upload client identity documents here.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Expected ID type">
                  <Select
                    value={idHintMethod}
                    onValueChange={(v) => setIdHintMethod(v as IdMethod)}
                  >
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
                <Field label="Last 4 digits (optional)">
                  <Input
                    maxLength={4}
                    value={idHintLast4}
                    onChange={(e) => setIdHintLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="1234"
                  />
                </Field>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The client does not choose the solicitor — {PARTNER_ORG.name} selects the solicitor
              for this payment case.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {SOLICITORS.map((s) => {
                const accts = accountsForSolicitor(s.id);
                const anyVerified = accts.some((a) => canReceivePayout(a.status));
                const selected = solicitorId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSolicitorId(s.id);
                      const first = accts.find((a) => canReceivePayout(a.status));
                      if (first) setCurrency(first.currency);
                    }}
                    className={`text-left rounded-lg border p-3 transition ${
                      selected ? "border-primary bg-primary/5" : "hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-sm">{s.firm}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {s.contact} · {s.country}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${anyVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                      >
                        {anyVerified ? "Verified account" : "Not verified"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {accts.map((a) => (
                        <Badge
                          key={a.id}
                          variant="outline"
                          className={`text-[10px] ${PAYOUT_STATUS_TONE[a.status]}`}
                        >
                          {a.currency} · {a.status}
                        </Badge>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/partner/solicitors">Add solicitor</Link>
              </Button>
              {solicitorId && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/partner/solicitors">View solicitor details</Link>
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Field label="Solicitor payout currency">
              <Select value={currency} onValueChange={(v) => setCurrency(v as PayoutCurrency)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYOUT_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {currencyBlock ? (
              <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{currencyBlock}</span>
              </div>
            ) : (
              account && (
                <div className="rounded-lg border bg-secondary/30 p-3 text-sm">
                  <div className="font-medium">Settlement Destination</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {account.accountName} · {account.bank} ·{" "}
                    {maskAccountNumber(account.accountNumber)} · {account.currency}
                  </div>
                  <Badge
                    variant="outline"
                    className={`mt-2 text-[10px] ${PAYOUT_STATUS_TONE[account.status]}`}
                  >
                    {account.status}
                  </Badge>
                </div>
              )
            )}
            {accounts.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Accounts on file: {accounts.map((a) => `${a.currency} (${a.status})`).join(", ")}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Field label={`Amount the solicitor should receive (${currency})`}>
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="250000"
                className="max-w-[240px]"
              />
            </Field>
            {preview && (
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <Row label="Solicitor receives" value={formatFx(preview.payoutAmount, currency)} />
                <Row label="Client pays" value={formatNgn(preview.ngnTotal)} />
                <Row label="FX rate" value={`1 ${currency} = ₦${preview.rate}`} />
                <Row label="Canta fee" value={formatNgn(preview.feeNgn)} />
                <Row
                  label="Quote expiry"
                  value={new Date(preview.expiresAt).toLocaleTimeString()}
                />
                <Row
                  label="Payment link expiry"
                  value={new Date(preview.expiresAt).toLocaleTimeString()}
                />
                <p className="text-xs text-muted-foreground pt-2">
                  This NGN amount is based on the current quote. Client should pay before the quote
                  expires. If the quote expires, refresh the quote before payment.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 4 && created && solicitor && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Client Payment Case created</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Row label="Payment Case ID" value={created.id} />
              <Row label="Payment Link ID" value={created.linkId} />
              <Row label="Solicitor" value={solicitor.firm} />
              <Row
                label="Solicitor receives"
                value={formatFx(created.quote.payoutAmount, created.payoutCurrency)}
              />
              <Row label="Client pays" value={formatNgn(created.quote.ngnTotal)} />
              <Row label="FX rate" value={`1 ${created.payoutCurrency} = ₦${created.quote.rate}`} />
              <Row
                label="Quote expiry"
                value={new Date(created.quote.expiresAt).toLocaleString()}
              />
            </div>
            <div className="rounded-lg border bg-secondary/30 p-3 font-mono text-xs break-all">
              {paymentLinkUrl(created.linkId)}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => copyText(paymentLinkUrl(created.linkId), "Payment link")}>
                <Copy className="h-4 w-4 mr-1.5" /> Copy payment link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  copyText(clientEmailMessage(created, solicitor.firm), "Email message");
                  toast.info(
                    "Sending is not configured in demo. Copy the message and send manually.",
                  );
                }}
              >
                Send email
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  copyText(clientWhatsAppMessage(created, solicitor.firm), "WhatsApp message");
                  toast.info(
                    "Sending is not configured in demo. Copy the message and send manually.",
                  );
                }}
              >
                Copy WhatsApp message
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([clientEmailMessage(created, solicitor.firm)], {
                    type: "text/plain",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${created.id}-payment-instruction.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Payment instruction downloaded");
                }}
              >
                <Download className="h-4 w-4 mr-1.5" /> Download payment instruction
              </Button>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() =>
                  navigate({
                    to: "/partner/payment-cases/$caseId",
                    params: { caseId: created.id },
                  })
                }
              >
                Open case
              </Button>
              <Button asChild variant="ghost">
                <Link to="/partner/payment-cases">All client payment cases</Link>
              </Button>
            </div>
          </div>
        )}

        {step < 4 && (
          <div className="flex justify-between pt-2">
            <Button
              variant="ghost"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
            {step < 3 ? (
              <Button disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Button disabled={!canNext()} onClick={submit}>
                Generate payment link
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium leading-none">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
