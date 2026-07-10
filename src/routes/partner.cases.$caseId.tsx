import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Download, FileText, Upload, Mail, MapPin, Building2, ArrowLeftRight,
  Link as LinkIcon, ShieldCheck, Banknote, Send, Copy, Clock, AlertTriangle, CheckCircle2,
  Sparkles, ClipboardList,
} from "lucide-react";
import { getSolicitor, formatGBP, formatNGN, statusTone, getMarketer, canSeeSolicitorBankDetails, PARTNER_ORG, MARKETERS } from "@/lib/partner";
import {
  generateQuote, generatePaymentLink, markLinkSent, addDocument, recordFunding,
  convertFx, markPaidToSolicitor, uploadReceipt, inviteToCanta, partnerActorFromUser,
  DOC_TYPES, type FxQuote,
} from "@/lib/partner-store";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { usePartnerCase } from "@/hooks/usePartnerCases";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/partner/cases/$caseId")({
  head: () => ({ meta: [{ title: "Client Case — Kingsbridge Property Partners" }] }),
  component: CaseDetail,
});

const TABS = ["Overview", "Documents", "FX Quote", "Payment Link", "Verification", "Funding", "Payout", "Activity"] as const;
type Tab = (typeof TABS)[number];

function CaseDetail() {
  const { caseId } = useParams({ from: "/partner/cases/$caseId" });
  const { role, userId } = usePartnerRole();
  const c = usePartnerCase(caseId);
  const [tab, setTab] = useState<Tab>("Overview");

  // tick for countdowns
  const [, force] = useState(0);
  useEffect(() => { const i = setInterval(() => force((n) => n + 1), 1000); return () => clearInterval(i); }, []);

  if (!c) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Case not found.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/partner/cases">Back to cases</Link></Button>
      </div>
    );
  }
  const sol = getSolicitor(c.solicitorId)!;
  const actor = partnerActorFromUser(userId);
  const activeQuote = c.quotes.find((q) => q.id === c.activeQuoteId);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm"><Link to="/partner/cases"><ArrowLeft className="h-4 w-4 mr-1" /> Cases</Link></Button>
        <div className="text-xs text-muted-foreground">/ {c.ref}</div>
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>{c.status}</Badge>
              <Badge variant="outline" className="text-[10px]"><Building2 className="h-3 w-3 mr-1" /> {PARTNER_ORG.name}</Badge>
              <span className="text-xs text-muted-foreground">{c.ref}</span>
            </div>
            <h1 className="text-2xl font-semibold">{c.clientName}</h1>
            <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {c.property}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {c.propertyLocation}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Solicitor receives</div>
            <div className="text-3xl font-semibold tabular-nums">{formatGBP(c.amountGBP)}</div>
            {c.amountNGN && <div className="text-xs text-muted-foreground tabular-nums mt-0.5">≈ {formatNGN(c.amountNGN)}</div>}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="p-5 shadow-card lg:col-span-2">
            <div className="text-sm font-semibold mb-3">Case details</div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Row label="Client name" value={c.clientName} />
              <Row label="Email" value={c.clientEmail} icon={Mail} />
              <Row label="Phone" value={c.clientPhone} />
              <Row label="Property" value={c.property} />
              <Row label="Location" value={c.propertyLocation} />
              <Row label="Payment purpose" value={c.paymentPurpose ?? "Property completion"} />
              <Row label="Required amount" value={formatGBP(c.amountGBP)} />
              <Row label="Payment deadline" value={c.paymentDeadline ?? c.expectedPayout} />
              <Row label="Solicitor" value={sol.firm} />
              <Row label="Source" value={c.clientSource} />
              <Row label="Referral marketer" value={getMarketer(c.assignedMarketerId)?.name ?? "—"} />
              <Row label="Created by" value={getMarketer(c.createdBy ?? c.assignedMarketerId)?.name ?? "—"} />
              <Row label="Date created" value={c.createdAt} />
              <Row label="Status" value={c.status} />
            </dl>
          </Card>
          <Card className="p-5 shadow-card">
            <div className="text-sm font-semibold mb-3">Quick actions</div>
            <div className="space-y-2">
              <Button className="w-full justify-start" onClick={() => setTab("FX Quote")}><ArrowLeftRight className="h-4 w-4 mr-2" /> Generate FX quote</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setTab("Payment Link")} disabled={!c.activeQuoteId}><LinkIcon className="h-4 w-4 mr-2" /> Generate payment link</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setTab("Documents")}><Upload className="h-4 w-4 mr-2" /> Upload KYC documents</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => { inviteToCanta(c.id, actor); toast.success("Client invited to activate Canta"); }}>
                <Sparkles className="h-4 w-4 mr-2" /> Invite client to Canta
              </Button>
            </div>
          </Card>
        </div>
      )}

      {tab === "Documents" && <DocumentsTab caseId={c.id} docs={c.documents} actor={actor} />}

      {tab === "FX Quote" && <FxQuoteTab caseId={c.id} quote={activeQuote} quotes={c.quotes} amount={c.amountGBP} actor={actor} paymentLink={c.paymentLink} clientName={c.clientName} clientEmail={c.clientEmail} />}

      {tab === "Payment Link" && <PaymentLinkTab c={c} actor={actor} />}

      {tab === "Verification" && <VerificationTab c={c} />}

      {tab === "Funding" && <FundingTab c={c} actor={actor} />}

      {tab === "Payout" && (
        <Card className="p-6 shadow-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">Solicitor payout</div>
              <div className="text-xs text-muted-foreground">{sol.firm}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { markPaidToSolicitor(c.id, actor); toast.success("Marked paid to solicitor"); }}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Mark paid
              </Button>
              <Button size="sm" variant="outline" onClick={() => { uploadReceipt(c.id, actor); toast.success("Receipt uploaded"); }}>
                <Upload className="h-4 w-4 mr-1" /> Upload receipt
              </Button>
            </div>
          </div>
          {canSeeSolicitorBankDetails(role) ? (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <Row label="Firm name" value={sol.firm} />
              <Row label="Account name" value={sol.accountName} />
              <Row label="Bank" value={sol.bank} />
              <Row label="Account number" value={sol.accountNumberMasked} />
              <Row label="Sort code" value={sol.sortCode ?? "—"} />
              <Row label="IBAN" value={sol.iban ?? "—"} />
              <Row label="SWIFT / BIC" value={sol.swift} />
              <Row label="Payout amount" value={formatGBP(c.amountGBP)} />
              <Row label="Payout status" value={c.payout?.status ?? "Pending"} />
              <Row label="Payment reference" value={c.payout?.reference ?? `BC/${c.id}/COMPL`} />
            </dl>
          ) : (
            <div className="text-xs text-muted-foreground italic border-t pt-3">
              Solicitor bank details are restricted. Ask a Partner Admin or Finance Viewer for access.
            </div>
          )}
        </Card>
      )}

      {tab === "Activity" && (
        <Card className="p-6 shadow-card">
          <div className="text-sm font-semibold mb-3 flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" /> Activity log</div>
          <ul className="text-sm divide-y">
            {[...c.activity].reverse().map((a) => (
              <li key={a.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{a.action}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {a.userName} · <Badge variant="outline" className="text-[9px]">{a.userRole}</Badge>
                    {a.notes && <span className="ml-2 italic">— {a.notes}</span>}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ---------- Tabs ---------- */

function DocumentsTab({ caseId, docs, actor }: any) {
  const [type, setType] = useState<typeof DOC_TYPES[number]>("International passport");
  const [name, setName] = useState("");
  const add = () => {
    if (!name.trim()) { toast.error("Enter a document name"); return; }
    addDocument(caseId, { type, name, uploadedBy: actor.id, uploadedByName: actor.name, uploadedByRole: actor.role, clientConsent: false });
    setName("");
    toast.success("Document added");
  };
  return (
    <div className="space-y-5">
      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-3">Upload document on behalf of client</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="File name (e.g. passport.pdf)" className="md:col-span-1" />
          <Button onClick={add}><Upload className="h-4 w-4 mr-1.5" /> Add document</Button>
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-3">Case documents ({docs.length})</div>
        {docs.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">No documents uploaded yet.</div>
        ) : (
          <ul className="text-sm divide-y border rounded-lg">
            {docs.map((d: any) => (
              <li key={d.id} className="px-3 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground">{d.type} · uploaded by {d.uploadedByName} ({d.uploadedByRole}) · {new Date(d.uploadedAt).toLocaleString()}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function FxQuoteTab({ caseId, quote, quotes, amount, actor, paymentLink, clientName, clientEmail }: { caseId: string; quote?: FxQuote; quotes: FxQuote[]; amount: number; actor: any; paymentLink?: any; clientName?: string; clientEmail?: string }) {
  const [validity, setValidity] = useState<FxQuote["validity"]>("1h");
  const [amountInput, setAmountInput] = useState(String(amount));
  const [rateInput, setRateInput] = useState("2050");
  const gbp = Number(amountInput.replace(/,/g, "")) || 0;
  const rate = Number(rateInput.replace(/,/g, "")) || 0;
  const fee = gbp > 0 ? Math.max(20, Math.round(gbp * 0.0075)) : 0;
  const ngnPreview = gbp > 0 && rate > 0 ? Math.round((gbp + fee) * rate) : 0;
  const remaining = quote ? Math.max(0, new Date(quote.expiresAt).getTime() - Date.now()) : 0;
  const expired = !quote || quote.status !== "Active" || remaining === 0;

  const onGenerate = () => {
    if (!gbp) { toast.error("Enter GBP amount"); return; }
    if (!rate) { toast.error("Enter FX rate"); return; }
    const q = generateQuote(caseId, validity, actor, { amountGBP: gbp, rate });
    if (q) {
      // Auto-generate the client payment link alongside the FX quote so partners have
      // a single artefact to send to their client.
      const link = generatePaymentLink(caseId, actor);
      if (link) toast.success(`FX quote ${q.reference} + payment link ready to send`);
      else toast.success(`FX quote ${q.reference} generated`);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="p-6 shadow-card space-y-4">
        <div>
          <div className="text-sm font-semibold">Generate a new FX quote</div>
          <div className="text-xs text-muted-foreground">Enter the GBP amount and the FX rate. The NGN total and Canta fee are calculated automatically.</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">GBP amount</div>
            <Input value={amountInput} onChange={(e) => setAmountInput(e.target.value)} inputMode="numeric" placeholder="e.g. 248500" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">FX rate (1 GBP = ₦)</div>
            <Input value={rateInput} onChange={(e) => setRateInput(e.target.value)} inputMode="decimal" placeholder="e.g. 2050" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Validity</div>
            <Select value={validity} onValueChange={(v) => setValidity(v as FxQuote["validity"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30m">30 minutes</SelectItem>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="same_day">Same day</SelectItem>
                <SelectItem value="custom">Custom (4h)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={onGenerate}>
              <ArrowLeftRight className="h-4 w-4 mr-1.5" /> Generate quote
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t text-sm">
          <Row label="GBP solicitor receives" value={formatGBP(gbp)} />
          <Row label="Canta fee" value={formatGBP(fee)} />
          <Row label="Rate" value={rate ? `1 GBP = ₦${rate.toLocaleString()}` : "—"} />
          <Row label="NGN client pays" value={ngnPreview ? `₦${ngnPreview.toLocaleString()}` : "—"} highlight />
        </div>
      </Card>

      {quote && (
        <Card className="p-6 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Active quote · {quote.reference}</div>
            {expired ? (
              <Badge variant="outline" className="text-destructive border-destructive/30"><AlertTriangle className="h-3 w-3 mr-1" /> Expired</Badge>
            ) : (
              <Badge variant="outline" className="text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" /> {Math.floor(remaining/60000)}m {Math.floor((remaining%60000)/1000)}s</Badge>
            )}
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
            <Row label="GBP solicitor receives" value={formatGBP(quote.gbpAmount)} />
            <Row label="Exchange rate" value={`1 GBP = ₦${quote.rate.toLocaleString()}`} />
            <Row label="Canta fee" value={formatGBP(quote.feeGBP)} />
            <Row label="NGN client pays" value={`₦${quote.ngnTotal.toLocaleString()}`} />
            <Row label="Validity" value={quote.validity} />
            <Row label="Generated by" value={quote.generatedByName} />
            <Row label="Generated at" value={new Date(quote.generatedAt).toLocaleString()} />
            <Row label="Expires" value={new Date(quote.expiresAt).toLocaleString()} />
          </dl>
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" disabled={expired || !paymentLink} onClick={() => {
              if (!paymentLink || typeof window === "undefined") return;
              const full = window.location.origin + paymentLink.url;
              navigator.clipboard?.writeText(full);
              toast.success("Payment link copied — paste it to your client");
            }}>
              <LinkIcon className="h-4 w-4 mr-1.5" /> Copy payment link
            </Button>
            <Button size="sm" variant="outline" disabled={expired || !paymentLink} onClick={() => {
              if (!paymentLink || typeof window === "undefined") return;
              const full = window.location.origin + paymentLink.url;
              const body = encodeURIComponent(`Hi ${clientName ?? "there"},\n\nYour FX quote ${quote.reference} is ready.\nGBP: ${formatGBP(quote.gbpAmount)}\nRate: 1 GBP = ₦${quote.rate.toLocaleString()}\nNGN total: ₦${quote.ngnTotal.toLocaleString()}\nExpires: ${new Date(quote.expiresAt).toLocaleString()}\n\nPay here: ${full}`);
              window.open(`mailto:${clientEmail ?? ""}?subject=${encodeURIComponent("Your FX quote from Kingsbridge Property Partners × Canta")}&body=${body}`, "_blank");
            }}>
              Email quote to client
            </Button>
            <Button size="sm" variant="outline" disabled={expired || !paymentLink} onClick={() => {
              if (!paymentLink || typeof window === "undefined") return;
              const full = window.location.origin + paymentLink.url;
              const msg = encodeURIComponent(`Your FX quote ${quote.reference}: ₦${quote.ngnTotal.toLocaleString()} at 1 GBP = ₦${quote.rate.toLocaleString()}. Pay here: ${full}`);
              window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
            }}>
              Send on WhatsApp
            </Button>
            <Button size="sm" disabled={expired} onClick={() => {
              const link = paymentLink ?? generatePaymentLink(caseId, actor);
              if (link) {
                toast.success(paymentLink ? "Opening payment link" : "Payment link generated");
                if (typeof window !== "undefined") window.open(link.url, "_blank", "noopener,noreferrer");
              }
            }}>
              <LinkIcon className="h-4 w-4 mr-1.5" /> {paymentLink ? "Preview payment page" : "Create payment link"}
            </Button>
          </div>
        </Card>
      )}

      {quotes.length > 1 && (
        <Card className="p-6 shadow-card">
          <div className="text-sm font-semibold mb-3">Quote history</div>
          <ul className="text-xs divide-y">
            {quotes.slice().reverse().map((q) => (
              <li key={q.id} className="py-2 flex justify-between">
                <span>{q.reference} · {q.status}</span>
                <span className="text-muted-foreground">{new Date(q.generatedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}


function PaymentLinkTab({ c, actor }: any) {
  const link = c.paymentLink;
  const copy = () => {
    if (!link || typeof window === "undefined") return;
    navigator.clipboard?.writeText(window.location.origin + link.url);
    toast.success("Link copied");
  };
  return (
    <div className="space-y-5">
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-semibold">Branded client payment link</div>
            <div className="text-xs text-muted-foreground">Canta × Baron &amp; Cabot — expires when the FX quote expires.</div>
          </div>
          <Button onClick={() => {
            const newLink = generatePaymentLink(c.id, actor);
            if (newLink) {
              toast.success("Payment link generated");
              if (typeof window !== "undefined") window.open(newLink.url, "_blank", "noopener,noreferrer");
            } else {
              toast.error("Generate an FX quote first");
            }
          }} disabled={!c.activeQuoteId}>
            <LinkIcon className="h-4 w-4 mr-1.5" /> {link ? "Regenerate" : "Generate"} payment link
          </Button>

        </div>
      </Card>

      {link && (
        <Card className="p-6 shadow-card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-muted-foreground">URL</div>
              <div className="font-mono text-sm">{link.url}</div>
            </div>
            <Badge variant="outline">{link.status}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={copy}><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</Button>
            <Button size="sm" variant="outline" onClick={() => { markLinkSent(c.id, actor); toast.success("Marked as sent"); }}><Send className="h-3.5 w-3.5 mr-1.5" /> Mark as sent</Button>
            <Button size="sm" asChild variant="ghost"><a href={link.url} target="_blank" rel="noreferrer">Preview client page</a></Button>
          </div>
          <div className="text-[11px] text-muted-foreground border-t pt-2">
            Created {new Date(link.createdAt).toLocaleString()}{link.sentAt ? ` · sent ${new Date(link.sentAt).toLocaleString()}` : ""}{link.openedAt ? ` · opened ${new Date(link.openedAt).toLocaleString()}` : ""}
          </div>
        </Card>
      )}
    </div>
  );
}

function VerificationTab({ c }: any) {
  const v = c.verification;
  return (
    <Card className="p-6 shadow-card">
      <div className="text-sm font-semibold mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Client verification</div>
      {!v ? (
        <div className="text-sm text-muted-foreground">Client has not yet completed verification. Once they open the payment link they'll enter their BVN, confirm consent and proceed to funding.</div>
      ) : (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Row label="BVN status" value={`BVN ${v.bvnStatus}`} />
          <Row label="Date of birth" value={v.dob ? "On file" : "—"} />
          <Row label="Source of funds" value={v.sourceOfFunds ? "Declared" : "—"} />
          <Row label="Name confirmed" value={v.fullNameConfirmed ? "Yes" : "No"} />
          <Row label="Submitted at" value={v.submittedAt ? new Date(v.submittedAt).toLocaleString() : "—"} />
          <Row label="Property purpose consent" value={v.consent?.propertyPurpose ? "✓" : "—"} />
          <Row label="Canta processing consent" value={v.consent?.canta ? "✓" : "—"} />
          <Row label="Shared docs consent" value={v.consent?.sharedDocs ? "✓" : "—"} />
          <Row label="Terms accepted" value={v.consent?.terms ? "✓" : "—"} />
          <Row label="Privacy accepted" value={v.consent?.privacy ? "✓" : "—"} />
        </dl>
      )}
      <div className="mt-4 text-[11px] text-muted-foreground italic border-t pt-3">
        BVN is collected by Canta directly from the client. Baron &amp; Cabot users cannot enter a BVN on behalf of the client and never see the raw or masked BVN — only the status (BVN Pending / Submitted / Verified / Failed).
      </div>

    </Card>
  );
}

function FundingTab({ c, actor }: any) {
  const f = c.funding;
  const [payer, setPayer] = useState(c.clientName);
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState(c.activeQuoteId ? c.quotes.find((q: any) => q.id === c.activeQuoteId)?.reference ?? "" : "");
  const record = () => {
    const n = Number(amount.replace(/,/g, ""));
    if (!n) { toast.error("Enter NGN amount received"); return; }
    recordFunding(c.id, { payerName: payer, receivedNGN: n, reference: ref });
    toast.success("Funding recorded");
  };
  return (
    <div className="space-y-5">
      <Card className="p-6 shadow-card space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2"><Banknote className="h-4 w-4 text-primary" /> Funding</div>
        {f ? (
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
            <Row label="Expected NGN" value={`₦${f.expectedNGN.toLocaleString()}`} />
            <Row label="Received NGN" value={f.receivedNGN ? `₦${f.receivedNGN.toLocaleString()}` : "—"} />
            <Row label="Payer name" value={f.payerName ?? "—"} />
            <Row label="Reference" value={f.reference ?? "—"} />
            <Row label="Received at" value={f.receivedAt ? new Date(f.receivedAt).toLocaleString() : "—"} />
            <Row label="Review status" value={f.reviewStatus ?? "—"} />
          </dl>
        ) : (
          <div className="text-sm text-muted-foreground">No funding recorded yet.</div>
        )}
      </Card>

      <Card className="p-6 shadow-card space-y-3">
        <div className="text-sm font-semibold">Record funding (simulated webhook)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input value={payer} onChange={(e) => setPayer(e.target.value)} placeholder="Payer name" />
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="NGN amount received" inputMode="numeric" />
          <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Reference" />
        </div>
        <div className="flex gap-2">
          <Button onClick={record}><CheckCircle2 className="h-4 w-4 mr-1.5" /> Record funding</Button>
          <Button variant="outline" onClick={() => { convertFx(c.id, actor); toast.success("FX converted, payout processing"); }}>
            Convert FX &amp; start payout
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, icon: Icon, highlight }: { label: string; value: string; icon?: React.ComponentType<{ className?: string }>; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={`flex items-center gap-1.5 mt-0.5 ${highlight ? "text-base font-semibold" : "text-sm font-medium"}`}>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />} {value}
      </dd>
    </div>
  );
}

// keep unused-import silencer
void MARKETERS;
