import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Zap, Coins } from "lucide-react";
import { wallets, fmtMoney } from "@/lib/mock";
import { useActions } from "@/components/ActionsProvider";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/wallets")({
  head: () => ({ meta: [{ title: "Wallets — Canta" }] }),
  component: Wallets,
});

function Wallets() {
  const { openFund, openSend } = useActions();
  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Wallet balances reflect cleared funds only." />
      <div>
        <h1 className="text-2xl font-semibold">Wallets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Multi-currency balances and funding sources.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {wallets.map((w, i) => (
          <Card
            key={w.ccy}
            className={`p-5 shadow-card relative overflow-hidden ${i === 0 ? "bg-gradient-card text-primary-foreground border-none" : ""}`}
          >
            {i === 0 && (
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
            )}
            <div className="flex items-center justify-between relative">
              <div className="text-2xl">{w.flag}</div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${i === 0 ? "bg-white/15" : "bg-secondary"}`}
              >
                {w.ccy}
              </span>
            </div>
            <div
              className={`mt-4 text-xs ${i === 0 ? "text-primary-foreground/70" : "text-muted-foreground"}`}
            >
              {w.label}
            </div>
            <div className="text-2xl font-semibold tabular-nums mt-1">
              {fmtMoney(w.balance, w.ccy)}
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                size="sm"
                onClick={() => openFund(w.ccy)}
                className={i === 0 ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
              >
                Fund
              </Button>
              <Button
                size="sm"
                onClick={() => openSend()}
                variant={i === 0 ? "secondary" : "outline"}
                className={
                  i === 0
                    ? "bg-white/10 text-primary-foreground border-white/15 hover:bg-white/15"
                    : ""
                }
              >
                Send
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 shadow-card">
        <div className="text-sm font-semibold">Funding Options</div>
        <div className="text-xs text-muted-foreground">
          Funding is only available in NGN or USDT — balances are converted on credit.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {[
            {
              icon: Building,
              label: "NGN Bank Transfer",
              desc: "Free · Virtual account in your name",
              badge: "Recommended",
              ccy: "NGN",
            },
            {
              icon: Coins,
              label: "USDT (TRC20 / ERC20)",
              desc: "Stablecoin deposit · Converted on credit",
              badge: "Crypto",
              ccy: "USDT",
            },
          ].map((o) => (
            <button
              key={o.label}
              onClick={() => openFund(o.ccy)}

              className="text-left p-4 rounded-xl border border-border hover:border-accent hover:shadow-card transition"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center">
                  <o.icon className="h-5 w-5 text-primary" />
                </div>
                {o.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground border border-accent/30">
                    {o.badge}
                  </span>
                )}
              </div>
              <div className="mt-3 font-semibold text-sm">{o.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{o.desc}</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
