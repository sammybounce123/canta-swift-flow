import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Wallet,
  Plus,
  Download,
  Share2,
  LifeBuoy,
  Receipt,
  ArrowLeftRight,
  Send,
} from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import { FundWalletDialog } from "@/components/importer/FundWalletDialog";
import { ConvertDialog } from "@/components/importer/ConvertDialog";
import {
  useImporter,
  fmtWallet,
  createWallet,
  confirmFundingSent,
  simulateProviderConfirmation,
  cancelFunding,
  WALLET_CCYS,
  FUNDABLE_CCYS,
  FUNDING_OPEN,
  walletOf,
  type WalletCcy,
  type WalletTx,
} from "@/lib/importer-store";

export const Route = createFileRoute("/importer/balance")({
  head: () => ({
    meta: [
      { title: "Balance & Wallets — Canta Importer" },
      {
        name: "description",
        content:
          "Create NGN, USDT, USD, GBP and EUR wallets, fund with NGN or USDT, and follow every deposit to credit.",
      },
      { property: "og:title", content: "Balance & Wallets — Canta Importer" },
      {
        property: "og:description",
        content:
          "Create NGN, USDT, USD, GBP and EUR wallets, fund with NGN or USDT, and follow every deposit to credit.",
      },
    ],
  }),
  component: BalancePage,
});

const TX_TYPES = [
  "Wallet funding",
  "Supplier payment",
  "FX conversion",
  "Refund",
  "Fee",
  "Receipt generated",
];

function BalancePage() {
  const s = useImporter();
  const navigate = useNavigate();
  const [fundOpen, setFundOpen] = useState(false);
  const [fundMethod, setFundMethod] = useState<"NGN" | "USDT">("NGN");
  const [convOpen, setConvOpen] = useState(false);
  const [convFrom, setConvFrom] = useState<WalletCcy>("NGN");
  const [convTo, setConvTo] = useState<WalletCcy>("USD");
  const [fCcy, setFCcy] = useState("all");
  const [fType, setFType] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fDate, setFDate] = useState("");

  const openFund = (m: "NGN" | "USDT") => {
    setFundMethod(m);
    setFundOpen(true);
  };

  const openConvert = (from: WalletCcy, to: WalletCcy) => {
    setConvFrom(from);
    setConvTo(to);
    setConvOpen(true);
  };


  const pending = s.funding.filter((f) => FUNDING_OPEN.includes(f.status));
  const missing = WALLET_CCYS.filter((c) => !s.wallets.some((w) => w.ccy === c));

  const tx = useMemo(
    () =>
      s.walletTx.filter(
        (t) =>
          (fCcy === "all" || t.ccy === fCcy) &&
          (fType === "all" || t.type === fType) &&
          (fStatus === "all" || t.status === fStatus) &&
          (!fDate || t.at === fDate),
      ),
    [s.walletTx, fCcy, fType, fStatus, fDate],
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ReadinessBar
        status="Demo Preview"
        cue="Wallets are credited only after provider confirmation. Figures here are illustrative."
      />
      <header>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" /> Balance
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Hold balances in NGN, USDT, USD, GBP and EUR. You can fund directly with NGN or USDT;
          other wallets hold converted or received balances.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => openFund("NGN")}>Fund NGN wallet</Button>
        <Button variant="outline" onClick={() => openFund("USDT")}>
          Fund USDT wallet
        </Button>
        <Button variant="secondary" onClick={() => openConvert("NGN", "USD")}>
          <ArrowLeftRight className="h-4 w-4" /> Convert
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate({ to: "/importer/payments", search: { tab: "new" } })}
        >
          <Send className="h-4 w-4" /> Convert &amp; Send
        </Button>
        {pending.length > 0 && (
          <Badge variant="outline" className="self-center text-[10px]">
            {pending.length} funding request{pending.length === 1 ? "" : "s"} in progress
          </Badge>
        )}
      </div>
      <div className="grid gap-1 text-[11px] text-muted-foreground -mt-3">
        <span>
          <strong className="text-foreground">Convert</strong> — move money between your Canta
          wallets. No recipient needed.
        </span>
        <span>
          <strong className="text-foreground">Convert &amp; Send</strong> — convert funds and send
          to a supplier or beneficiary after review.
        </span>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {s.wallets.map((w) => (
          <Card key={w.ccy} className="p-4 shadow-card flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">{w.ccy} Wallet</div>
              <Badge
                variant={w.status === "Active" ? "outline" : "secondary"}
                className="text-[10px]"
              >
                {w.status}
              </Badge>
            </div>
            <div className="text-2xl font-semibold mt-2 break-words">
              {fmtWallet(w.available, w.ccy)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Pending: {fmtWallet(w.pending, w.ccy)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Last activity: {w.lastActivity}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {FUNDABLE_CCYS.includes(w.ccy) ? (
                <Button size="sm" onClick={() => openFund(w.ccy as "NGN" | "USDT")}>
                  Fund wallet
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.info(`${w.ccy} funding rail is not enabled in this demo`, {
                      description: "Fund with NGN or USDT and convert.",
                    })
                  }
                >
                  Fund wallet
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => openConvert(w.ccy, w.ccy === "NGN" ? "USD" : "NGN")}
              >
                Convert
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate({ to: "/importer/payments", search: { tab: "new" } })}
              >
                Convert &amp; Send
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFCcy(w.ccy);
                  toast.success(`Showing ${w.ccy} transactions`);
                }}
              >
                View transactions
              </Button>

            </div>
          </Card>
        ))}

        {missing.map((c) => (
          <Card key={c} className="p-4 shadow-card border-dashed flex flex-col justify-between">
            <div>
              <div className="text-sm font-semibold">{c} Wallet</div>
              <p className="text-xs text-muted-foreground mt-1">
                Not created yet. Create it to hold converted or received {c} balances.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 self-start"
              onClick={() => {
                createWallet(c);
                toast.success(`${c} wallet created`, {
                  description: `Your ${c} wallet is active with a zero balance.`,
                });
              }}
            >
              <Plus className="h-4 w-4" /> Create {c} Wallet
            </Button>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="funding">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="funding">Funding requests</TabsTrigger>
          <TabsTrigger value="history">Transaction history</TabsTrigger>
          <TabsTrigger value="receipts">Funding receipts</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="funding" className="mt-4">
          <Card className="p-4 sm:p-5 shadow-card space-y-2">
            {s.funding.map((f) => (
              <div
                key={f.id}
                className="rounded-lg border border-border p-3 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-medium">
                    {f.id} · {fmtWallet(f.amount, f.method as WalletCcy)}
                    {f.network ? ` · ${f.network}` : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {f.createdAt} · Ref {f.reference}
                    {f.providerRef ? ` · ${f.providerRef}` : ""}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {f.status}
                  </Badge>
                  {FUNDING_OPEN.includes(f.status) &&
                    !f.status.includes("confirmation submitted") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          confirmFundingSent(f.id);
                          toast.success("Confirmation submitted");
                        }}
                      >
                        {f.method === "NGN" ? "I have made payment" : "I have sent USDT"}
                      </Button>
                    )}
                  {FUNDING_OPEN.includes(f.status) && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const rc = simulateProviderConfirmation(f.id);
                          if (rc)
                            toast.success("Wallet credited", {
                              description: `Receipt ${rc} is available.`,
                            });
                        }}
                      >
                        Simulate provider confirmation (demo)
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          cancelFunding(f.id);
                          toast.info("Funding cancelled");
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground pt-1">
              Your wallet is credited only after provider confirmation — clicking “I have made
              payment” does not credit the balance.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          <Card className="p-3 shadow-card grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Filter label="Currency" value={fCcy} onChange={setFCcy} options={WALLET_CCYS} />
            <Filter label="Type" value={fType} onChange={setFType} options={TX_TYPES} />
            <Filter
              label="Status"
              value={fStatus}
              onChange={setFStatus}
              options={["Completed", "Pending", "Failed"]}
            />
            <div>
              <div className="text-[11px] text-muted-foreground mb-1">Date</div>
              <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
            </div>
          </Card>
          <Card className="p-4 shadow-card overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-xs text-muted-foreground text-left">
                  <th className="py-2">Date</th>
                  <th>Wallet</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tx.map((t) => (
                  <TxRow key={t.id} t={t} />
                ))}
                {tx.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                      No transactions match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {s.fundingReceipts.map((r) => (
              <Card key={r.receiptNo} className="p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Receipt className="h-4 w-4 text-primary" /> {r.receiptNo}
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {r.status}
                  </Badge>
                </div>
                <dl className="mt-3 text-xs space-y-1">
                  <Line k="Funding reference" v={r.fundingRef} />
                  <Line k="Currency" v={r.ccy} />
                  <Line k="Amount" v={fmtWallet(r.amount, r.ccy)} />
                  <Line k="Funding method" v={r.method} />
                  <Line k="Provider confirmation reference" v={r.providerRef} />
                  <Line k="Date" v={r.at} />
                  <Line k="Wallet credited" v={`${r.ccy} Wallet`} />
                  <Line k="Compliance note" v="Deposit screened and matched before credit." />
                </dl>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Button size="sm" onClick={() => toast.success("Receipt download started")}>
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.success("Receipt shared by email")}
                  >
                    <Share2 className="h-3.5 w-3.5" /> Share by email
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.success("Receipt shared on WhatsApp")}
                  >
                    <Share2 className="h-3.5 w-3.5" /> Share on WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFCcy(r.ccy);
                      toast.success("Wallet transaction filtered");
                    }}
                  >
                    View wallet transaction
                  </Button>
                </div>
              </Card>
            ))}
            {s.fundingReceipts.length === 0 && (
              <div className="col-span-full text-center text-sm text-muted-foreground py-10">
                No funding receipts yet. Receipts appear after a deposit is confirmed.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <FundWalletDialog open={fundOpen} onOpenChange={setFundOpen} initialMethod={fundMethod} />
      <p className="text-[11px] text-muted-foreground">
        Total available:{" "}
        {s.wallets.map((w) => fmtWallet(walletOf(s, w.ccy)?.available ?? 0, w.ccy)).join(" · ")}
      </p>
    </div>
  );
}

function TxRow({ t }: { t: WalletTx }) {
  return (
    <tr className="border-t border-border">
      <td className="py-2 text-xs">{t.at}</td>
      <td className="text-xs">{t.ccy}</td>
      <td className="text-xs">{t.type}</td>
      <td className="text-xs font-medium">{fmtWallet(t.amount, t.ccy)}</td>
      <td>
        <Badge variant="outline" className="text-[10px]">
          {t.status}
        </Badge>
      </td>
      <td className="text-xs">{t.reference}</td>
      <td className="text-right whitespace-nowrap">
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            toast.info(`${t.type} · ${t.reference}`, {
              description: `${fmtWallet(t.amount, t.ccy)} · ${t.status}`,
            })
          }
        >
          Details
        </Button>
        {t.receiptNo && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toast.success(`Receipt ${t.receiptNo} download started`)}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => toast.success("Support request started")}>
          <LifeBuoy className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-right break-words max-w-[60%]">{v}</dd>
    </div>
  );
}
