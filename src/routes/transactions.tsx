import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { transactions, fmtMoney } from "@/lib/mock";
import { StatusPill } from "@/components/StatusPill";

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "Transactions — Canta" }] }),
  component: Transactions,
});

function Transactions() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">All payments, conversions and funding events.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-1.5" /> Filter</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>
        </div>
      </div>

      <Card className="p-4 shadow-card">
        <div className="flex flex-wrap gap-3">
          {["All", "FX Conversion", "Outgoing", "Funding"].map((t, i) => (
            <button key={t} className={`px-3 py-1.5 text-xs rounded-full border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
              {t}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <select className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card">
              <option>All currencies</option><option>NGN</option><option>USD</option><option>EUR</option><option>GBP</option>
            </select>
            <select className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card">
              <option>Last 30 days</option><option>Last 7 days</option><option>This month</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-5 py-3 font-mono text-xs">{t.id}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{t.date}</td>
                  <td className="px-5 py-3 font-medium">{t.desc}</td>
                  <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded bg-secondary">{t.type}</span></td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{fmtMoney(t.amount, t.ccy)}</td>
                  <td className="px-5 py-3"><StatusPill status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing 1–{transactions.length} of 248</span>
          <div className="flex gap-1">
            <button className="px-2.5 py-1 rounded border border-border hover:bg-secondary">Prev</button>
            <button className="px-2.5 py-1 rounded border border-border hover:bg-secondary">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
