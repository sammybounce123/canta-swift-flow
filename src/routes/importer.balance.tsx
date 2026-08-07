import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wallet, Copy, Upload, ArrowRight } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import { useImporter, fmtNGN, addFunding, advanceFunding, addDocument } from "@/lib/importer-store";

export const Route = createFileRoute("/importer/balance")({
  head: () => ({
    meta: [
      { title: "Balance — Canta Importer" },
      { name: "description", content: "Fund your Canta balance in NGN or USDT and follow every deposit to credit." },
      { property: "og:title", content: "Balance — Canta Importer" },
      { property: "og:description", content: "Fund your Canta balance in NGN or USDT and follow every deposit to credit." },
    ],
  }),
  component: BalancePage,
});

const NGN_DETAILS = [
  ["Bank", "Providus Bank"],
  ["Account name", "Canta Payments / ABC Electronics"],
  ["Account number", "9901234567"],
  ["Reference", "ABC-IMP-2026"],
];

const USDT_DETAILS = [
  ["Network", "TRC-20"],
  ["Wallet address", "TXk9QeDemoWalletAddressNotReal4421"],
  ["Memo / reference", "ABC-IMP-2026"],
];

function BalancePage() {
  const s = useImporter();
  const [method, setMethod] = useState<"NGN" | "USDT">("NGN");
  const [amount, setAmount] = useState("");

  const details = method === "NGN" ? NGN_DETAILS : USDT_DETAILS;
  const pending = s.funding.filter((f) => f.status !== "Balance credited" && f.status !== "Failed");
  const done = s.funding.filter((f) => f.status === "Balance credited");

  const copy = (v: string) => { navigator.clipboard?.writeText(v); toast.success("Copied"); };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ReadinessBar status="Demo Preview" cue="Balances update after provider confirmation. Figures here are illustrative." />
      <header>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Balance</h1>
        <p className="text-sm text-muted-foreground mt-1">Fund your Canta balance, then use it to pay suppliers globally.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 shadow-card">
          <div className="text-xs text-muted-foreground">NGN balance</div>
          <div className="text-2xl font-semibold mt-1 break-words">{fmtNGN(s.ngnBalance)}</div>
        </Card>
        <Card className="p-4 shadow-card">
          <div className="text-xs text-muted-foreground">USDT balance</div>
          <div className="text-2xl font-semibold mt-1">{s.usdtBalance.toLocaleString()} USDT</div>
        </Card>
        <Card className="p-4 shadow-card">
          <div className="text-xs text-muted-foreground">Pending deposits</div>
          <div className="text-2xl font-semibold mt-1">{pending.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">{done.length} successful deposits</div>
        </Card>
      </div>

      <Card className="p-4 sm:p-5 shadow-card">
        <h2 className="font-semibold">Fund your balance</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant={method === "NGN" ? "default" : "outline"} onClick={() => setMethod("NGN")}>Fund with NGN</Button>
          <Button size="sm" variant={method === "USDT" ? "default" : "outline"} onClick={() => setMethod("USDT")}>Fund with USDT</Button>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border p-3 space-y-2">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Payment instructions</div>
            {details.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium truncate flex items-center gap-1">
                  <span className="truncate">{v}</span>
                  <button aria-label={`Copy ${k}`} onClick={() => copy(v)} className="text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
                </span>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground pt-1">Your balance is credited after the provider confirms the deposit.</p>
          </div>

          <div className="rounded-lg border border-border p-3 space-y-3">
            <div>
              <Label>Amount you are sending ({method})</Label>
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={method === "NGN" ? "5,000,000" : "2,000"} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  const n = Number(amount.replace(/[^\d.]/g, ""));
                  if (!n) { toast.error("Enter the amount you are sending"); return; }
                  const id = addFunding(method, n);
                  setAmount("");
                  toast.success(`Funding request ${id} created`, { description: "Status: awaiting payment" });
                }}
              >Create funding request</Button>
              <Button
                variant="outline"
                onClick={() => {
                  addDocument({ name: `Proof of payment — ${new Date().toLocaleDateString()}.pdf`, type: "Payment proof" });
                  toast.success("Proof of payment uploaded");
                }}
              ><Upload className="h-4 w-4" /> Upload proof of payment</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 shadow-card">
        <h2 className="font-semibold">Funding history</h2>
        <div className="mt-3 space-y-2">
          {s.funding.map((f) => (
            <div key={f.id} className="rounded-lg border border-border p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium">{f.id} · {f.method === "NGN" ? fmtNGN(f.amount) : `${f.amount.toLocaleString()} USDT`}</div>
                <div className="text-xs text-muted-foreground">{f.createdAt}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{f.status}</Badge>
                {f.status !== "Balance credited" && f.status !== "Failed" && (
                  <Button size="sm" variant="ghost" onClick={() => advanceFunding(f.id)}>Advance status <ArrowRight className="h-3.5 w-3.5" /></Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          Statuses: awaiting payment → payment received → under review → balance credited. If a deposit fails, contact support.
        </p>
      </Card>
    </div>
  );
}
