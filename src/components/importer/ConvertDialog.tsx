import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowDown, Download, Lock, ShieldCheck } from "lucide-react";
import {
  WALLET_CCYS,
  buildConversionQuote,
  executeConversion,
  fmtWallet,
  quoteExpired,
  useImporter,
  walletOf,
  type ConversionQuote,
  type ConversionReceipt,
  type WalletCcy,
} from "@/lib/importer-store";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialFrom?: WalletCcy;
  initialTo?: WalletCcy;
};

/**
 * Convert = move money between the customer's own wallets.
 * No beneficiary, invoice or payout account is involved.
 */
export function ConvertDialog({
  open,
  onOpenChange,
  initialFrom = "NGN",
  initialTo = "USD",
}: Props) {
  const s = useImporter();
  const [from, setFrom] = useState<WalletCcy>(initialFrom);
  const [to, setTo] = useState<WalletCcy>(initialTo === initialFrom ? "USD" : initialTo);
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<ConversionQuote | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [receipt, setReceipt] = useState<ConversionReceipt | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!open) return;
    setFrom(initialFrom);
    setTo(initialTo === initialFrom ? (initialFrom === "USD" ? "NGN" : "USD") : initialTo);
    setAmount("");
    setQuote(null);
    setAccepted(false);
    setReceipt(null);
  }, [open, initialFrom, initialTo]);

  useEffect(() => {
    if (!quote || receipt) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [quote, receipt]);

  const amt = Number(amount) || 0;
  const source = walletOf(s, from);
  const available = source?.available ?? 0;
  const insufficient = amt > 0 && amt > available;
  const expired = quote ? quoteExpired(quote) : false;
  const secondsLeft = quote ? Math.max(0, Math.ceil((quote.expiresAt - Date.now()) / 1000)) : 0;
  const status = receipt
    ? "Converted"
    : expired
      ? "Quote expired"
      : quote
        ? "Quote ready"
        : "Draft";

  /** Only currencies the customer actually holds a wallet in. */
  const availableCcys = useMemo(
    () => WALLET_CCYS.filter((c) => s.wallets.some((w) => w.ccy === c)),
    [s.wallets]
  );
  const destinations = useMemo(
    () => availableCcys.filter((c) => c !== from),
    [availableCcys, from]
  );

  useEffect(() => {
    if (availableCcys.length === 0) return;
    if (!availableCcys.includes(from)) setFrom(availableCcys[0]!);
  }, [availableCcys, from]);

  useEffect(() => {
    if (destinations.length === 0) return;
    if (!destinations.includes(to)) setTo(destinations[0]!);
  }, [destinations, to]);


  const getQuote = () => {
    if (amt <= 0) return toast.error("Enter an amount to convert");
    if (from === to) return toast.error("Choose two different wallets");
    if (insufficient)
      return toast.error("Insufficient balance", {
        description: `Your ${from} wallet has ${fmtWallet(available, from)}.`,
      });
    setQuote(buildConversionQuote(from, to, amt));
    setAccepted(false);
  };

  const confirm = () => {
    if (!quote) return;
    const res = executeConversion(quote);
    if (!res.ok) {
      if (res.reason === "expired") toast.error("Quote expired — request a new quote");
      else if (res.reason === "insufficient") toast.error("Insufficient balance");
      else toast.error("Conversion could not be completed");
      return;
    }
    const r = s.conversionReceipts.find((x) => x.receiptNo === res.receiptNo);
    setReceipt(
      r ?? {
        receiptNo: res.receiptNo,
        conversionRef: res.conversion.id,
        from: quote.from,
        to: quote.to,
        debit: quote.debit,
        credit: quote.credit,
        rate: quote.rate,
        fee: quote.fee,
        at: res.conversion.at,
        status: "Converted",
      },
    );
    toast.success("Conversion completed.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert</DialogTitle>
          <DialogDescription>
            Move money between your Canta wallets. No recipient needed.
          </DialogDescription>
        </DialogHeader>

        {receipt ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">Conversion receipt</div>
              <Badge variant="outline" className="text-[10px]">
                {receipt.status}
              </Badge>
            </div>
            <dl className="rounded-lg border border-border p-3 text-xs space-y-1">
              <Row k="Conversion reference" v={receipt.conversionRef} />
              <Row k="Receipt number" v={receipt.receiptNo} />
              <Row k="Source wallet" v={`${receipt.from} Wallet`} />
              <Row k="Destination wallet" v={`${receipt.to} Wallet`} />
              <Row k="Source amount" v={fmtWallet(receipt.debit, receipt.from)} />
              <Row k="Destination amount" v={fmtWallet(receipt.credit, receipt.to)} />
              <Row
                k="FX rate"
                v={`1 ${receipt.from} = ${receipt.rate.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${receipt.to}`}
              />
              <Row k="Canta fee" v={fmtWallet(receipt.fee, receipt.from)} />
              <Row k="Date" v={receipt.at} />
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => toast.success("Receipt download started")}>
                <Download className="h-3.5 w-3.5" /> Download receipt
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Status</span>
              <Badge variant="outline" className="text-[10px]">
                {status}
              </Badge>
            </div>

            <div>
              <Label className="text-xs">From wallet</Label>
              <Select
                value={from}
                onValueChange={(v) => {
                  const next = v as WalletCcy;
                  setFrom(next);
                  setQuote(null);
                  setAccepted(false);
                  if (next === to) {
                    const alt = availableCcys.find((c) => c !== next);
                    if (alt) setTo(alt);
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCcys.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c} Wallet — {fmtWallet(walletOf(s, c)?.available ?? 0, c)}
                    </SelectItem>
                  ))}
                </SelectContent>

              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                Available: {fmtWallet(available, from)}
              </p>
            </div>

            <div className="flex justify-center">
              <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center">
                <ArrowDown className="h-4 w-4" />
              </div>
            </div>

            <div>
              <Label className="text-xs">To wallet</Label>
              <Select
                value={to}
                onValueChange={(v) => {
                  setTo(v as WalletCcy);
                  setQuote(null);
                  setAccepted(false);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c} Wallet
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Amount to convert ({from})</Label>
              <Input
                inputMode="decimal"
                value={amount}
                placeholder="0.00"
                onChange={(e) => {
                  setAmount(e.target.value.replace(/[^0-9.]/g, ""));
                  setQuote(null);
                  setAccepted(false);
                }}
                className="mt-1"
              />
              {insufficient && (
                <p className="text-[11px] text-destructive mt-1">
                  Insufficient balance in your {from} wallet.
                </p>
              )}
            </div>

            {!quote ? (
              <Button className="w-full" onClick={getQuote} disabled={amt <= 0 || insufficient}>
                Show FX quote
              </Button>
            ) : (
              <div className="space-y-3" data-tick={tick}>
                <dl className="rounded-lg border border-border p-3 text-xs space-y-1">
                  <Row k="Source currency" v={quote.from} />
                  <Row k="Destination currency" v={quote.to} />
                  <Row k="Amount debited" v={fmtWallet(quote.debit, quote.from)} />
                  <Row k="Amount credited" v={fmtWallet(quote.credit, quote.to)} />
                  <Row
                    k="FX rate"
                    v={`1 ${quote.from} = ${quote.rate.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${quote.to}`}
                  />
                  <Row k="Canta fee" v={fmtWallet(quote.fee, quote.from)} />
                  <Row k="Quote expiry" v={expired ? "Expired" : `${secondsLeft}s remaining`} />
                  <Row k="Estimated completion" v={quote.eta} />
                  {quote.complianceNote && <Row k="Compliance" v={quote.complianceNote} />}
                </dl>

                {expired ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setQuote(buildConversionQuote(from, to, amt));
                      setAccepted(false);
                    }}
                  >
                    Quote expired — get a new quote
                  </Button>
                ) : accepted ? (
                  <Button className="w-full" onClick={confirm}>
                    <ShieldCheck className="h-4 w-4" /> Confirm conversion
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => setAccepted(true)}>
                    <Lock className="h-4 w-4" /> Accept quote
                  </Button>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Demo preview — balances update only after you confirm. Expired quotes cannot be
                  accepted.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-right break-words max-w-[62%]">{v}</dd>
    </div>
  );
}
