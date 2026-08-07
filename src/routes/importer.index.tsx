import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReadinessBar } from "@/components/ReadinessBar";
import {
  Wallet, Send, Ship, Receipt, Upload, Building2, ArrowRight, ShieldCheck,
} from "lucide-react";
import { useImporter, fmtNGN, NEXT_ACTION } from "@/lib/importer-store";

export const Route = createFileRoute("/importer/")({
  head: () => ({
    meta: [
      { title: "Importer Dashboard — Canta" },
      { name: "description", content: "Fund your Canta balance, pay suppliers globally, track shipments and download receipts." },
      { property: "og:title", content: "Importer Dashboard — Canta" },
      { property: "og:description", content: "Fund your balance, pay any supplier globally, upload documents, track shipments and download receipts." },
    ],
  }),
  component: ImporterHome,
});

function ImporterHome() {
  const s = useImporter();
  const pending = s.payments.filter((p) => !["Supplier paid", "Receipt available", "Refunded", "Failed"].includes(p.status));
  const shipping = s.shipments.filter((sh) => !["Delivered"].includes(sh.status));
  const receipts = s.payments.filter((p) => p.receiptNo);
  const pendingFunding = s.funding.filter((f) => FUNDING_OPEN.includes(f.status));
  const ngn = walletOf(s, "NGN");
  const usdt = walletOf(s, "USDT");
  const totalNgnEquivalent = s.wallets.reduce(
    (sum, w) => sum + (w.ccy === "NGN" ? w.available : w.available * (FX_RATES[w.ccy === "USDT" ? "USD" : w.ccy] ?? 0)),
    0,
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ReadinessBar status="Demo Preview" cue="Payments are reviewed before payout. Balances, rates and records shown here are illustrative." />

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Importer Dashboard</h1>
          <Badge variant="outline" className="text-[10px]">Demo persona</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Pay any supplier globally. Your supplier does not need a Canta account. Fund your balance, pay your
          supplier, track the shipment, and download the receipt.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard icon={Wallet} label="Total available balance" value={fmtNGN(totalNgnEquivalent)}
          helper={`NGN ${fmtNGN(ngn?.available ?? 0)} · USDT ${(usdt?.available ?? 0).toLocaleString()} (illustrative conversion).`} to="/importer/balance" />
        <StatCard icon={Wallet} label="Pending funding" value={`${pendingFunding.length} request${pendingFunding.length === 1 ? "" : "s"}`}
          helper="Deposits waiting for provider or blockchain confirmation before your wallet is credited." to="/importer/balance" />
        <StatCard icon={Send} label="Pending supplier payments" value={`${pending.length} payment${pending.length === 1 ? "" : "s"}`}
          helper="Payments awaiting funding, FX quote, compliance review, or payout confirmation." to="/importer/payments" />
        <StatCard icon={Receipt} label="Receipts available" value={`${receipts.length} receipt${receipts.length === 1 ? "" : "s"}`}
          helper="Download payment and settlement receipts for your records." to="/importer/payments" />
      </div>

      <Card className="p-4 sm:p-5 shadow-card">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Your wallets</div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
          {WALLET_CCYS.map((c) => {
            const w = walletOf(s, c);
            return (
              <div key={c} className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">{c} Wallet</div>
                <div className="text-sm font-semibold mt-1 break-words">{w ? fmtWallet(w.available, c) : "Not created"}</div>
                <Badge variant="outline" className="text-[10px] mt-1">{w ? w.status : "Create wallet"}</Badge>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Shipments in progress: {shipping.length}
        </div>
      </Card>


      <Card className="p-4 sm:p-5 shadow-card">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Quick actions</div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <Button asChild size="lg" className="justify-start sm:col-span-2 lg:col-span-3">
            <Link to="/importer/payments" search={{ tab: "new" }}><Send className="h-4 w-4" /> Pay supplier</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start"><Link to="/importer/balance"><Wallet className="h-4 w-4" /> Fund balance</Link></Button>
          <Button asChild variant="outline" className="justify-start"><Link to="/importer/suppliers"><Building2 className="h-4 w-4" /> Add supplier bank details</Link></Button>
          <Button asChild variant="outline" className="justify-start"><Link to="/importer/shipments"><Upload className="h-4 w-4" /> Upload BL</Link></Button>
          <Button asChild variant="outline" className="justify-start"><Link to="/importer/shipments"><Ship className="h-4 w-4" /> Track shipment</Link></Button>
          <Button asChild variant="outline" className="justify-start"><Link to="/importer/payments" search={{ tab: "receipts" }}><Receipt className="h-4 w-4" /> View receipts</Link></Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
          Your supplier does not need a Canta account. Add their bank details and Canta will process the payout after review.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">Recent supplier payments</h2>
            <Button asChild size="sm" variant="ghost"><Link to="/importer/payments">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </div>
          <ul className="mt-3 space-y-2">
            {s.payments.slice(0, 4).map((p) => (
              <li key={p.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.supplier}</div>
                    <div className="text-xs text-muted-foreground">{p.id} · {p.currency} {p.amount.toLocaleString()}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Next: {NEXT_ACTION[p.status]}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">Shipments</h2>
            <Button asChild size="sm" variant="ghost"><Link to="/importer/shipments">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </div>
          <ul className="mt-3 space-y-2">
            {s.shipments.slice(0, 4).map((sh) => (
              <li key={sh.id} className="rounded-lg border border-border p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{sh.blNumber} · {sh.shippingLine}</div>
                  <div className="text-xs text-muted-foreground truncate">{sh.portLoading} → {sh.portDestination} · ETA {sh.eta}</div>
                </div>
                <Badge variant="outline" className="text-[10px]">{sh.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper, to }: {
  icon: typeof Wallet; label: string; value: string; helper: string; to: string;
}) {
  return (
    <Card className="p-4 shadow-card flex flex-col">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" /> {label}
      </div>
      <div className="text-xl sm:text-2xl font-semibold mt-2 break-words">{value}</div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed flex-1">{helper}</p>
      <Button asChild size="sm" variant="ghost" className="mt-2 self-start px-2">
        <Link to={to}>Open <ArrowRight className="h-3.5 w-3.5" /></Link>
      </Button>
    </Card>
  );
}
