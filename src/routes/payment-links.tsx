import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Link as LinkIcon,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { fmtMoney } from "@/lib/mock";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/payment-links")({
  head: () => ({ meta: [{ title: "Payment Links — Canta" }] }),
  component: PaymentLinksPage,
});

// FX rates expressed as: 1 unit of base currency = X USD (USD is reference).
// settle = supplier currency (what they receive). charge = customer-paying currency.
const USD_PER: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  NGN: 1 / 1612,
  ZAR: 1 / 18.4,
  KES: 1 / 129,
  GHS: 1 / 14.8,
  CNY: 1 / 7.25,
};
const CCYS = Object.keys(USD_PER);

function getRate(from: string, to: string): number {
  // 1 `from` = ? `to`
  const f = USD_PER[from] ?? 1;
  const t = USD_PER[to] ?? 1;
  return f / t;
}

type PaymentLink = {
  id: string;
  invoiceId?: string;
  label: string;
  path: string; // relative path; absolute url computed at render time
  settleAmount: number; // amount supplier receives (main)
  settleCcy: string; // supplier currency (main)
  chargeCcy: string; // currency customer pays in
  rate: number; // 1 settleCcy = rate chargeCcy (locked at creation)
  amount: number; // legacy: settleAmount (kept for fmtMoney listing)
  ccy: string; // legacy: settleCcy
  status: "Active" | "Paid" | "Expired";
  createdAt: string;
};

const LS_KEY = "canta:collections:paymentLinks";
const payPath = (id: string) => `/p/${id.toLowerCase()}`;
const absUrl = (path: string) => {
  if (typeof window === "undefined") return `https://canta.app${path}`;
  return `${window.location.origin}${path}`;
};

const SEED: PaymentLink[] = [
  {
    id: "PL-DEMO-001",
    label: "Tuition — Spring 2026",
    path: payPath("PL-DEMO-001"),
    settleAmount: 8500,
    settleCcy: "USD",
    chargeCcy: "NGN",
    rate: getRate("USD", "NGN"),
    amount: 8500,
    ccy: "USD",
    status: "Active",
    createdAt: "2026-06-12",
  },
  {
    id: "PL-DEMO-002",
    label: "Donation — June Drive",
    path: payPath("PL-DEMO-002"),
    settleAmount: 2500,
    settleCcy: "USD",
    chargeCcy: "USD",
    rate: 1,
    amount: 2500,
    ccy: "USD",
    status: "Paid",
    createdAt: "2026-06-11",
  },
  {
    id: "PL-DEMO-003",
    label: "Conference ticket",
    path: payPath("PL-DEMO-003"),
    settleAmount: 350,
    settleCcy: "EUR",
    chargeCcy: "GBP",
    rate: getRate("EUR", "GBP"),
    amount: 350,
    ccy: "EUR",
    status: "Active",
    createdAt: "2026-06-10",
  },
];

function readLS(): PaymentLink[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return SEED;
    const arr = JSON.parse(raw);
    const norm: PaymentLink[] = (Array.isArray(arr) ? arr : []).map((x: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const settleCcy = x.settleCcy ?? x.ccy ?? "USD";
      const chargeCcy = x.chargeCcy ?? settleCcy;
      const settleAmount = Number(x.settleAmount ?? x.amount) || 0;
      return {
        id: x.id,
        invoiceId: x.invoiceId,
        label: x.label ?? x.invoiceId ?? x.id,
        path: x.path ?? payPath(x.id ?? ""),
        settleAmount,
        settleCcy,
        chargeCcy,
        rate: Number(x.rate) || getRate(settleCcy, chargeCcy),
        amount: settleAmount,
        ccy: settleCcy,
        status: (x.status as PaymentLink["status"]) ?? "Active",
        createdAt: (x.createdAt ?? "").slice(0, 10) || new Date().toISOString().slice(0, 10),
      };
    });
    return [...norm, ...SEED];
  } catch {
    return SEED;
  }
}
function writeLS(arr: PaymentLink[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

function PaymentLinksPage() {
  const [list, setList] = useState<PaymentLink[]>(SEED);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setList(readLS());
    setMounted(true);
  }, []);

  const add = (p: PaymentLink) => {
    const next = [p, ...list];
    setList(next);
    writeLS(next);
    const url = absUrl(p.path);
    toast.success("Payment link created", {
      description: url,
      action: {
        label: "Copy",
        onClick: () => {
          navigator.clipboard?.writeText(url);
          toast.success("Link copied");
        },
      },
    });
    setOpen(false);
  };
  const remove = (id: string) => {
    const next = list.filter((l) => l.id !== id);
    setList(next);
    writeLS(next);
    toast.success("Payment link removed");
  };

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Payment links include payer and reconciliation references."
      />
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <Badge variant="outline" className="gap-1">
            <LinkIcon className="h-3 w-3" /> Payment Links
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Payment Links</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Shareable links for tuition, donations, products and bookings. Customers pay in their
            local currency — you settle in yours.
          </p>
        </div>
        <NewLinkDialog open={open} setOpen={setOpen} onAdd={add} />
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3">Link</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 text-right">Settles</th>
                <th className="px-4 py-3 text-right">Customer pays</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const url = mounted ? absUrl(p.path) : `https://canta.app${p.path}`;
                const customerAmount = p.settleAmount * p.rate;
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.label}</div>
                      <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[280px]">
                        {url}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">{p.invoiceId ?? p.id}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {fmtMoney(p.settleAmount, p.settleCcy)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {p.chargeCcy === p.settleCcy ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        fmtMoney(customerAmount, p.chargeCcy)
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-muted-foreground tabular-nums">
                      {p.chargeCcy === p.settleCcy
                        ? "—"
                        : `1 ${p.settleCcy} = ${p.rate.toFixed(p.rate < 1 ? 4 : 2)} ${p.chargeCcy}`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          p.status === "Paid"
                            ? "border-success/30 text-success bg-success/10 text-[10px]"
                            : p.status === "Expired"
                              ? "border-border text-muted-foreground text-[10px]"
                              : "border-primary/30 text-primary bg-primary/10 text-[10px]"
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard?.writeText(url);
                          toast.success("Link copied");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(p.id)}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    No payment links yet — create your first.
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

function NewLinkDialog({
  open,
  setOpen,
  onAdd,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  onAdd: (p: PaymentLink) => void;
}) {
  const [d, setD] = useState({ label: "", amount: "", settleCcy: "USD", chargeCcy: "NGN" });

  const rate = useMemo(() => getRate(d.settleCcy, d.chargeCcy), [d.settleCcy, d.chargeCcy]);
  const settleAmount = Number(d.amount) || 0;
  const customerAmount = settleAmount * rate;
  const sameCcy = d.settleCcy === d.chargeCcy;

  const submit = () => {
    if (!d.label.trim() || !d.amount) {
      toast.error("Label and amount are required");
      return;
    }
    const id = `PL-${Math.floor(1000 + Math.random() * 9000)}`;
    onAdd({
      id,
      label: d.label.trim(),
      path: payPath(id),
      settleAmount,
      settleCcy: d.settleCcy,
      chargeCcy: d.chargeCcy,
      rate,
      amount: settleAmount,
      ccy: d.settleCcy,
      status: "Active",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setD({ label: "", amount: "", settleCcy: "USD", chargeCcy: "NGN" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 mr-1.5" /> Create payment link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create payment link</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Set what you (the supplier) want to receive. We show your customer the converted amount
            in their currency at today's rate.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Label *" wide>
            <Input
              value={d.label}
              onChange={(e) => setD({ ...d, label: e.target.value })}
              placeholder="Tuition — Spring 2026"
            />
          </Field>

          <Field label="Settles in (you receive) *">
            <Select value={d.settleCcy} onValueChange={(v) => setD({ ...d, settleCcy: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CCYS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Amount to receive *">
            <Input
              type="number"
              value={d.amount}
              onChange={(e) => setD({ ...d, amount: e.target.value })}
              placeholder="1500"
            />
          </Field>

          <Field label="Customer pays in">
            <Select value={d.chargeCcy} onValueChange={(v) => setD({ ...d, chargeCcy: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CCYS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Today's rate">
            <div className="h-9 rounded-md border border-input bg-secondary/30 px-3 flex items-center text-xs font-mono">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-primary" />
              {sameCcy
                ? "Same currency"
                : `1 ${d.settleCcy} = ${rate.toFixed(rate < 1 ? 4 : 2)} ${d.chargeCcy}`}
            </div>
          </Field>
        </div>

        <Card className="p-3 bg-secondary/30 border-dashed">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">
                You receive
              </div>
              <div className="font-semibold tabular-nums">
                {settleAmount ? fmtMoney(settleAmount, d.settleCcy) : `— ${d.settleCcy}`}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="text-right">
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">
                Customer pays
              </div>
              <div className="font-semibold tabular-nums">
                {sameCcy ? (
                  <span className="text-muted-foreground">Same currency</span>
                ) : settleAmount ? (
                  fmtMoney(customerAmount, d.chargeCcy)
                ) : (
                  `— ${d.chargeCcy}`
                )}
              </div>
            </div>
          </div>
          {!sameCcy && (
            <div className="mt-2 text-[10px] text-muted-foreground">
              Rate is locked when the link is created. Canta absorbs intraday movement up to
              settlement.
            </div>
          )}
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="bg-primary" onClick={submit}>
            Create link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
