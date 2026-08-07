import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, Check, Copy, QrCode, RefreshCw, Timer } from "lucide-react";
import {
  useImporter, startFunding, confirmFundingSent, simulateProviderConfirmation, cancelFunding,
  fmtWallet, fmtAnyCcy, buildLockedQuote, GLOBAL_SEND_CCYS, QUOTE_LOCK_SECONDS,
  NGN_COLLECTION_ACCOUNT, USDT_ADDRESSES, USDT_CONFIRMATIONS, USDT_NETWORKS,
  type UsdtNetwork, type LockedQuote,
} from "@/lib/importer-store";

const NGN_TIMELINE = [
  "Funding request created",
  "Awaiting bank transfer",
  "Payment received",
  "Compliance / provider review",
  "Wallet credited",
  "Receipt available",
];

const USDT_TIMELINE = [
  "Funding request created",
  "Awaiting USDT transfer",
  "Blockchain confirmation pending",
  "Compliance / provider review",
  "Wallet credited",
  "Receipt available",
];

const MIN = { NGN: 10_000, USDT: 10 };
const MAX = { NGN: 500_000_000, USDT: 500_000 };

export function FundWalletDialog({
  open,
  onOpenChange,
  initialMethod = "NGN",
  onCredited,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialMethod?: "NGN" | "USDT";
  onCredited?: () => void;
}) {
  const s = useImporter();
  const [method, setMethod] = useState<"NGN" | "USDT">(initialMethod);
  const [network, setNetwork] = useState<UsdtNetwork>("TRC20");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (open) {
      setMethod(initialMethod);
      setNetwork("TRC20");
      setAmount("");
      setPurpose("");
      setFundingId(null);
      setStep(0);
    }
  }, [open, initialMethod]);

  const record = s.funding.find((f) => f.id === fundingId);
  const receipt = s.fundingReceipts.find((r) => r.fundingRef === fundingId);
  const n = Number(amount.replace(/[^\d.]/g, "")) || 0;
  const amountValid = n >= MIN[method] && n <= MAX[method];
  const copy = (v: string) => { navigator.clipboard?.writeText(v); toast.success("Copied"); };

  const timeline = method === "NGN" ? NGN_TIMELINE : USDT_TIMELINE;
  const timelineIndex = !record ? 0
    : record.status === "Wallet credited" ? 5
    : record.status.includes("confirmation submitted") ? 2
    : 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fund wallet</DialogTitle>
          <DialogDescription>
            Funding rails available today are NGN bank transfer and USDT. Your wallet is credited only after
            provider confirmation.
          </DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-3">
            <Label>Select currency</Label>
            {(["NGN", "USDT"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`w-full text-left rounded-lg border p-3 text-sm transition ${method === m ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div className="font-medium">{m === "NGN" ? "NGN — Nigerian bank transfer" : "USDT — stablecoin transfer"}</div>
                <div className="text-xs text-muted-foreground">
                  {m === "NGN" ? "Transfer to your Canta collection account." : "Send USDT on TRC20, ERC20 or BEP20."}
                </div>
              </button>
            ))}
            <Button className="w-full" onClick={() => setStep(1)}>Continue</Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            {method === "USDT" && (
              <div>
                <Label>Network *</Label>
                <Select value={network} onValueChange={(v) => setNetwork(v as UsdtNetwork)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{USDT_NETWORKS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Amount to fund in {method} *</Label>
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={method === "NGN" ? "5,000,000" : "2,000"} />
              <p className="text-[11px] text-muted-foreground mt-1">
                Minimum {fmtWallet(MIN[method], method)} · maximum {fmtWallet(MAX[method], method)}.
              </p>
            </div>
            <div>
              <Label>Funding purpose (optional)</Label>
              <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Supplier payment top-up" />
            </div>

            <RemittanceQuote method={method} amount={n} />

            {method === "USDT" && (
              <p className="text-xs rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                Send only USDT on the selected network. Sending another token or using the wrong network may delay or lose funds.
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
              <Button
                className="flex-1"
                disabled={!amountValid}
                onClick={() => {
                  const id = startFunding({ method, amount: n, network: method === "USDT" ? network : undefined, purpose: purpose || undefined });
                  setFundingId(id);
                  setStep(2);
                }}
              >Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && record && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
              {method === "NGN" ? (
                <>
                  <Detail k="Bank name" v={NGN_COLLECTION_ACCOUNT.bank} onCopy={copy} />
                  <Detail k="Account name" v={NGN_COLLECTION_ACCOUNT.accountName} onCopy={copy} />
                  <Detail k="Account number" v={NGN_COLLECTION_ACCOUNT.accountNumber} onCopy={copy} />
                  <Detail k="Currency" v="NGN" />
                </>
              ) : (
                <>
                  <Detail k="Network" v={record.network ?? network} />
                  <Detail k="Wallet address" v={USDT_ADDRESSES[record.network ?? network]} onCopy={copy} />
                  <Detail k="Minimum confirmations" v={String(USDT_CONFIRMATIONS[record.network ?? network])} />
                </>
              )}
              <Detail k={method === "NGN" ? "Payment reference" : "Deposit reference"} v={record.reference} onCopy={copy} />
              <Detail k="Amount expected" v={fmtWallet(record.amount, method)} />
              <Detail k="Expires" v={record.expiresAt ? new Date(record.expiresAt).toLocaleString() : "—"} />
            </div>

            {method === "USDT" && (
              <div className="rounded-lg border border-dashed border-border p-4 grid place-items-center text-muted-foreground">
                <QrCode className="h-16 w-16" />
                <span className="text-[11px] mt-1">QR code placeholder (demo)</span>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {method === "NGN"
                ? "Transfer exactly this amount using the payment reference so Canta can match your deposit."
                : "Send only USDT on the selected network. Sending another token or using the wrong network may delay or lose funds."}
            </p>

            <Timeline steps={timeline} index={timelineIndex} />

            <div className="rounded-md bg-muted/40 px-3 py-2 text-xs">
              Status: <b>{record.status}</b>
              {record.status.includes("confirmation submitted") && (
                <div className="text-muted-foreground mt-1">
                  {method === "NGN"
                    ? "We will credit your wallet after provider confirmation."
                    : "Your wallet will be credited after blockchain/provider confirmation."}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => copy(
                  method === "NGN"
                    ? `${NGN_COLLECTION_ACCOUNT.bank} · ${NGN_COLLECTION_ACCOUNT.accountName} · ${NGN_COLLECTION_ACCOUNT.accountNumber} · Ref ${record.reference} · ${fmtWallet(record.amount, "NGN")}`
                    : `${record.network} · ${USDT_ADDRESSES[record.network ?? network]} · Ref ${record.reference} · ${fmtWallet(record.amount, "USDT")}`,
                )}
              ><Copy className="h-4 w-4" /> Copy full instructions</Button>
              {!record.status.includes("confirmation submitted") ? (
                <Button onClick={() => { confirmFundingSent(record.id); toast.success(method === "NGN" ? "Payment confirmation submitted" : "Transfer confirmation submitted"); }}>
                  {method === "NGN" ? "I have made payment" : "I have sent USDT"}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    const rc = simulateProviderConfirmation(record.id);
                    if (rc) { toast.success(`${method} wallet credited`, { description: `Receipt ${rc} is available.` }); setStep(3); onCredited?.(); }
                  }}
                >Simulate provider confirmation (demo)</Button>
              )}
              <Button variant="ghost" onClick={() => { cancelFunding(record.id); toast.info("Funding cancelled"); onOpenChange(false); }}>Cancel funding</Button>
            </div>
          </div>
        )}

        {step === 3 && receipt && (
          <div className="space-y-3">
            <Badge className="text-[10px]"><Check className="h-3 w-3" /> Wallet credited</Badge>
            <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
              <Detail k="Receipt number" v={receipt.receiptNo} />
              <Detail k="Funding reference" v={receipt.fundingRef} />
              <Detail k="Amount" v={fmtWallet(receipt.amount, receipt.ccy)} />
              <Detail k="Funding method" v={receipt.method} />
              <Detail k="Provider confirmation reference" v={receipt.providerRef} />
              <Detail k="Date" v={receipt.at} />
            </div>
            <Button className="w-full" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RemittanceQuote({ method, amount }: { method: "NGN" | "USDT"; amount: number }) {
  const [target, setTarget] = useState("USD");
  const [quote, setQuote] = useState<LockedQuote | null>(null);
  const [left, setLeft] = useState(0);

  // Any change to the inputs invalidates a locked quote.
  useEffect(() => { setQuote(null); setLeft(0); }, [method, amount, target]);

  useEffect(() => {
    if (!quote) return;
    const tick = () => setLeft(Math.max(0, Math.ceil((quote.expiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [quote]);

  const lock = () => setQuote(buildLockedQuote(method, amount, target));
  const expired = !!quote && left <= 0;
  const mmss = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold">Remittance quote</div>
        <Badge variant="outline" className="text-[10px]">Illustrative rates</Badge>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Wallets are funded with NGN or USDT only, but you can pay suppliers anywhere — quote against any popular
        currency, whether or not you hold that wallet.
      </p>

      <div>
        <Label className="text-[11px] text-muted-foreground">Quote against</Label>
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-64">
            {GLOBAL_SEND_CCYS.filter((c) => c.code !== method).map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.code} — {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {amount > 0 ? (
        !quote ? (
          <Button size="sm" variant="outline" className="w-full" onClick={lock}>
            <Timer className="h-3.5 w-3.5" /> Lock quote for {QUOTE_LOCK_SECONDS}s
          </Button>
        ) : (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Conversion fee (0.4%)</span>
              <span className="font-medium">{fmtWallet(quote.fee, method)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Convertible amount</span>
              <span className="font-medium">{fmtWallet(quote.net, method)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium">
                1 {method} = {quote.rate >= 1 ? quote.rate.toFixed(2) : quote.rate.toFixed(6)} {quote.target}
              </span>
            </div>
            <div className="flex justify-between items-center rounded-md border border-border px-2.5 py-2">
              <span className="text-xs text-muted-foreground">Supplier receives (indicative)</span>
              <span className="text-sm font-semibold">{fmtAnyCcy(quote.receive, quote.target)}</span>
            </div>

            {expired ? (
              <div className="flex items-center justify-between gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-2.5 py-2">
                <span className="text-[11px] text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Quote expired — refresh to see the current rate.
                </span>
                <Button size="sm" variant="secondary" onClick={lock}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-2">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" /> Rate locked — valid for <b className="tabular-nums">{mmss}</b>
                </span>
                <Button size="sm" variant="ghost" onClick={lock}><RefreshCw className="h-3.5 w-3.5" /> Re-lock</Button>
              </div>
            )}
          </>
        )
      ) : (
        <p className="text-[11px] text-muted-foreground">Enter an amount to lock a {target} quote.</p>
      )}
    </div>
  );
}

function Detail({ k, v, onCopy }: { k: string; v: string; onCopy?: (v: string) => void }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground text-xs">{k}</span>
      <span className="font-medium text-right break-all text-xs flex items-center gap-1">
        {v}
        {onCopy && (
          <button aria-label={`Copy ${k}`} onClick={() => onCopy(v)} className="text-muted-foreground hover:text-foreground">
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    </div>
  );
}

function Timeline({ steps, index }: { steps: string[]; index: number }) {
  return (
    <ol className="space-y-1.5">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center gap-2 text-xs">
          <span className={`h-2 w-2 rounded-full ${i <= index ? "bg-primary" : "bg-border"}`} />
          <span className={i <= index ? "font-medium" : "text-muted-foreground"}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
