import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldCheck, Building2, Clock, AlertTriangle, CheckCircle2, Lock, Sparkles, FileText, Copy,
} from "lucide-react";
import {
  findCaseByLinkId, markLinkOpened, submitVerification, expireQuoteIfNeeded,
  activateClientAccount, subscribe,
} from "@/lib/partner-store";
import { getSolicitor, PARTNER_ORG, formatGBP } from "@/lib/partner";
import { toast } from "sonner";

export const Route = createFileRoute("/pay/$linkId")({
  head: () => ({ meta: [{ title: "Secure Property Payment — Canta × Baron & Cabot" }] }),
  component: ClientPayPage,
});

type Step = "review" | "verify" | "documents" | "fund" | "done";

function ClientPayPage() {
  const { linkId } = useParams({ from: "/pay/$linkId" });
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);
  useEffect(() => {
    const c = findCaseByLinkId(linkId);
    if (c) markLinkOpened(c.id);
  }, [linkId]);
  useEffect(() => {
    const i = setInterval(() => {
      const c = findCaseByLinkId(linkId);
      if (c) expireQuoteIfNeeded(c.id);
      force((n) => n + 1);
    }, 1000);
    return () => clearInterval(i);
  }, [linkId]);

  const c = findCaseByLinkId(linkId);
  const [step, setStep] = useState<Step>("review");

  if (!c) {
    return (
      <PublicShell>
        <Card className="p-10 text-center shadow-card">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
          <h2 className="mt-3 text-lg font-semibold">Payment link invalid or expired</h2>
          <p className="text-sm text-muted-foreground mt-2">Please contact Baron &amp; Cabot for a new link.</p>
        </Card>
      </PublicShell>
    );
  }
  const sol = getSolicitor(c.solicitorId);
  const quote = c.quotes.find((q) => q.id === c.activeQuoteId);
  const expiresMs = quote ? new Date(quote.expiresAt).getTime() - Date.now() : 0;
  const expired = !quote || quote.status !== "Active" || expiresMs <= 0;

  return (
    <PublicShell>
      <BrandHeader />
      <div className="mx-auto max-w-3xl px-4 pb-16 space-y-5">
        <Card className="p-5 shadow-card flex flex-wrap items-center gap-3 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <Building2 className="h-5 w-5 text-primary" />
          <div className="text-sm">
            <span className="font-semibold">{PARTNER_ORG.name}</span>
            <span className="text-muted-foreground"> referred this payment · Canta will process FX and pay your UK solicitor.</span>
          </div>
          {quote && !expired && (
            <Badge variant="outline" className="ml-auto text-warning border-warning/30">
              <Clock className="h-3 w-3 mr-1" /> Quote expires in {formatRemaining(expiresMs)}
            </Badge>
          )}
          {expired && (
            <Badge variant="outline" className="ml-auto text-destructive border-destructive/30">Quote expired</Badge>
          )}
        </Card>

        <Stepper step={step} />

        {step === "review" && <ReviewStep c={c} quote={quote} sol={sol?.firm ?? "—"} expired={expired} onNext={() => setStep("verify")} />}
        {step === "verify" && <VerifyStep caseId={c.id} clientName={c.clientName} expired={expired} onDone={() => setStep("documents")} />}
        {step === "documents" && <DocStep c={c} onNext={() => setStep("fund")} />}
        {step === "fund" && <FundStep c={c} quote={quote} expired={expired} onPaid={() => setStep("done")} />}
        {step === "done" && <DoneStep caseId={c.id} sol={sol?.firm ?? "your solicitor"} amount={c.amountGBP} />}
      </div>
    </PublicShell>
  );
}

/* ---------- pieces ---------- */

function PublicShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}

function BrandHeader() {
  return (
    <div className="border-b bg-card">
      <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">C</div>
          <div>
            <div className="text-sm font-semibold leading-none">Canta × Baron &amp; Cabot</div>
            <div className="text-[11px] text-muted-foreground">Secure Property Payment</div>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px]"><Lock className="h-3 w-3 mr-1" /> 256-bit secure</Badge>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "review", label: "Review" },
    { id: "verify", label: "Verify" },
    { id: "documents", label: "Documents" },
    { id: "fund", label: "Pay" },
    { id: "done", label: "Receipt" },
  ];
  const idx = steps.findIndex((s) => s.id === step);
  return (
    <div className="flex items-center gap-2 text-xs">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-full grid place-items-center font-semibold ${i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
          <span className={i <= idx ? "font-medium" : "text-muted-foreground"}>{s.label}</span>
          {i < steps.length - 1 && <div className={`h-px w-6 ${i < idx ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

function ReviewStep({ c, quote, sol, expired, onNext }: any) {
  return (
    <Card className="p-6 shadow-card space-y-4">
      <div className="text-sm font-semibold">Review your payment</div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Row label="Client" value={c.clientName} />
        <Row label="Property" value={c.property} />
        <Row label="Property location" value={c.propertyLocation} />
        <Row label="Solicitor firm" value={sol} />
        <Row label="Payment purpose" value={c.paymentPurpose ?? "Property payment"} />
        <Row label="Reference" value={c.ref} />
        <Row label="GBP solicitor receives" value={formatGBP(c.amountGBP)} />
        <Row label="Exchange rate" value={quote ? `1 GBP = ₦${quote.rate.toLocaleString()}` : "—"} />
        <Row label="Canta fee" value={quote ? formatGBP(quote.feeGBP) : "—"} />
        <Row label="NGN you pay" value={quote ? `₦${quote.ngnTotal.toLocaleString()}` : "—"} highlight />
      </div>
      <div className="text-xs text-muted-foreground border-t pt-3">
        Expected settlement: 1–2 business days after funding and verification.
      </div>
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={expired}>Continue to verification</Button>
      </div>
    </Card>
  );
}

function VerifyStep({ caseId, clientName, expired, onDone }: any) {
  const [bvn, setBvn] = useState("");
  const [dob, setDob] = useState("");
  const [name, setName] = useState(false);
  const [src, setSrc] = useState("");
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const [c4, setC4] = useState(false);
  const [c5, setC5] = useState(false);
  const valid = bvn.length === 11 && dob && name && src && c1 && c2 && c3 && c4 && c5 && !expired;

  const submit = () => {
    submitVerification(caseId, {
      bvn, dob, fullNameConfirmed: name, sourceOfFunds: src,
      consent: { propertyPurpose: c1, canta: c2, sharedDocs: c3, terms: c4, privacy: c5 },
    });
    toast.success("Verification submitted");
    onDone();
  };

  return (
    <Card className="p-6 shadow-card space-y-5">
      <div>
        <div className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Identity verification</div>
        <p className="text-xs text-muted-foreground mt-1">A quick check before we show you the Canta funding account.</p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
        <strong>Your BVN is collected securely by Canta</strong> for verification and compliance. Baron &amp; Cabot will not enter this on your behalf.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">BVN (11 digits)</Label>
          <Input value={bvn} onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="•••••••••••" inputMode="numeric" />
        </div>
        <div>
          <Label className="text-xs">Date of birth</Label>
          <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs">Source of funds</Label>
          <Input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="e.g. Personal savings / business income / property sale" />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <ConsentRow checked={name} onChange={setName} label={`I confirm my full name matches: ${clientName}`} />
        <ConsentRow checked={c1} onChange={setC1} label="I confirm this payment is for a property purchase or property-related transaction." />
        <ConsentRow checked={c2} onChange={setC2} label="I consent to Canta processing this payment on my behalf." />
        <ConsentRow checked={c3} onChange={setC3} label="I consent to Canta using KYC documents already shared by Baron & Cabot." />
        <ConsentRow checked={c4} onChange={setC4} label="I accept Canta's terms of service." />
        <ConsentRow checked={c5} onChange={setC5} label="I accept Canta's privacy and data processing policy." />
      </div>

      <div className="flex justify-end">
        <Button disabled={!valid} onClick={submit}>Submit verification</Button>
      </div>
    </Card>
  );
}

function ConsentRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} className="mt-0.5" />
      <span className="text-sm leading-snug">{label}</span>
    </label>
  );
}

function DocStep({ c, onNext }: any) {
  return (
    <Card className="p-6 shadow-card space-y-4">
      <div className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Documents</div>
      {c.documents.length > 0 ? (
        <>
          <div className="text-xs text-muted-foreground">Documents already provided by Baron &amp; Cabot:</div>
          <ul className="text-sm border rounded-lg divide-y">
            {c.documents.map((d: any) => (
              <li key={d.id} className="px-3 py-2 flex justify-between">
                <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> {d.type}</span>
                <span className="text-[11px] text-muted-foreground">{d.name}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">No documents on file yet — you can upload any required documents below.</div>
      )}
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        Drag &amp; drop additional documents here (passport, proof of address, proof of funds)
      </div>
      <div className="flex justify-end">
        <Button onClick={onNext}>Confirm &amp; continue</Button>
      </div>
    </Card>
  );
}

function FundStep({ c, quote, expired, onPaid }: any) {
  if (expired || !quote) {
    return (
      <Card className="p-6 shadow-card text-center">
        <AlertTriangle className="h-6 w-6 text-destructive mx-auto" />
        <div className="mt-2 font-semibold">Your FX quote has expired</div>
        <p className="text-sm text-muted-foreground mt-1">Please contact Baron &amp; Cabot to issue a new quote.</p>
      </Card>
    );
  }
  const copy = (s: string) => { navigator.clipboard?.writeText(s); toast.success("Copied"); };
  return (
    <Card className="p-6 shadow-card space-y-4">
      <div className="text-sm font-semibold">Pay into your dedicated Canta account</div>
      <div className="rounded-lg border bg-secondary/30 p-4 grid grid-cols-2 gap-3 text-sm">
        <Row label="Account name" value="Canta Payments Nigeria Ltd" />
        <Row label="Bank" value="Providus Bank" />
        <Row label="Account number" value="1300912488" copyable onCopy={() => copy("1300912488")} />
        <Row label="Amount" value={`₦${quote.ngnTotal.toLocaleString()}`} highlight copyable onCopy={() => copy(String(quote.ngnTotal))} />
        <Row label="Payment reference" value={quote.reference} copyable onCopy={() => copy(quote.reference)} />
        <Row label="Solicitor receives" value={formatGBP(c.amountGBP)} />
      </div>
      <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs">
        Only pay into the Canta account details shown on this secure page. Pay from an account in your own name where possible.
        Canta will process FX conversion and the solicitor payout after funding and compliance checks.
      </div>
      <div className="flex justify-end">
        <Button onClick={onPaid}>I have made the payment</Button>
      </div>
    </Card>
  );
}

function DoneStep({ caseId, sol, amount }: { caseId: string; sol: string; amount: number }) {
  return (
    <Card className="p-8 shadow-card text-center space-y-4">
      <div className="mx-auto h-12 w-12 rounded-full bg-success/15 grid place-items-center"><CheckCircle2 className="h-6 w-6 text-success" /></div>
      <div>
        <div className="text-lg font-semibold">Thank you — your property payment is being processed</div>
        <p className="text-sm text-muted-foreground mt-1">Canta will pay {formatGBP(amount)} to {sol}. You'll receive a receipt once settled.</p>
      </div>
      <div className="border-t pt-4 space-y-2 text-left max-w-md mx-auto">
        <div className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Activate your full Canta account</div>
        <p className="text-sm text-muted-foreground">Use Canta for future international payments, travel cards and global transfers.</p>
        <div className="flex gap-2">
          <Button asChild className="flex-1"><Link to="/welcome" onClick={() => activateClientAccount(caseId)}>Activate Canta account</Link></Button>
          <Button asChild variant="outline" className="flex-1"><Link to="/">Done</Link></Button>
        </div>
      </div>
    </Card>
  );
}

function Row({ label, value, highlight, copyable, onCopy }: { label: string; value: string; highlight?: boolean; copyable?: boolean; onCopy?: () => void }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 flex items-center gap-1.5 ${highlight ? "text-lg font-semibold tabular-nums" : "text-sm font-medium"}`}>
        {value}
        {copyable && <button onClick={onCopy} className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button>}
      </div>
    </div>
  );
}

function formatRemaining(ms: number) {
  const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}
