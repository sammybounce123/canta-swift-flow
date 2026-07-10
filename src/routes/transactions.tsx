import { createFileRoute } from "@tanstack/react-router";
import { ReadinessBar } from "@/components/ReadinessBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter, X } from "lucide-react";
import { fmtMoney } from "@/lib/mock";
import { getLiveTransactions, subscribeTx } from "@/lib/tx-store";
import { StatusPill } from "@/components/StatusPill";
import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "Transactions — Canta" }] }),
  component: Transactions,
});

const TYPES = ["All", "FX Conversion", "Outgoing", "Funding"] as const;
const PAGE_SIZE = 6;

function Transactions() {
  const transactions = useSyncExternalStore(subscribeTx, getLiveTransactions, getLiveTransactions);
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [ccy, setCcy] = useState("All");
  const [range, setRange] = useState("30");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [active, setActive] = useState<(typeof transactions)[number] | null>(null);

  const filtered = useMemo(() => {
    const days = Number(range);
    const cutoff = Date.now() - days * 86400000;
    return transactions.filter((t) => {
      if (type !== "All" && t.type !== type) return false;
      if (ccy !== "All" && t.ccy !== ccy) return false;
      if (query && !`${t.id} ${t.desc}`.toLowerCase().includes(query.toLowerCase())) return false;
      const ts = Date.parse(t.date.replace(" ", "T"));
      if (!Number.isNaN(ts) && ts < cutoff) return false;
      return true;
    });
  }, [type, ccy, range, query, transactions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = () => {
    const header = ["Reference", "Date", "Description", "Type", "Amount", "Currency", "Status"];
    const rows = filtered.map((t) => [t.id, t.date, t.desc, t.type, t.amount, t.ccy, t.status]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `canta-transactions-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export ready", { description: `${filtered.length} rows downloaded.` });
  };

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Transactions are recorded in your activity history." />
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">All payments, conversions and funding events.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilter(true)}><Filter className="h-4 w-4 mr-1.5" /> Filter</Button>
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>
        </div>
      </div>

      <Card className="p-4 shadow-card">
        <div className="flex flex-wrap gap-3 items-center">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-full border ${type === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
            >
              {t}
            </button>
          ))}
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search reference or description…"
            className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-border bg-card outline-none focus:border-ring w-56"
          />
          <select value={ccy} onChange={(e) => { setCcy(e.target.value); setPage(1); }} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card">
            <option value="All">All currencies</option><option>NGN</option><option>USD</option><option>EUR</option><option>GBP</option>
          </select>
          <select value={range} onChange={(e) => { setRange(e.target.value); setPage(1); }} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card">
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
            <option value="365">This year</option>
          </select>
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
              {pageRows.map((t) => (
                <tr key={t.id} onClick={() => setActive(t)} className="border-t border-border hover:bg-secondary/30 cursor-pointer">
                  <td className="px-5 py-3 font-mono text-xs">{t.id}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{t.date}</td>
                  <td className="px-5 py-3 font-medium">{t.desc}</td>
                  <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded bg-secondary">{t.type}</span></td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{fmtMoney(t.amount, t.ccy)}</td>
                  <td className="px-5 py-3"><StatusPill status={t.status} /></td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">No transactions match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-1 items-center">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2.5 py-1 rounded border border-border hover:bg-secondary disabled:opacity-50">Prev</button>
            <span className="px-2">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2.5 py-1 rounded border border-border hover:bg-secondary disabled:opacity-50">Next</button>
          </div>
        </div>
      </Card>

      {/* Filter side panel */}
      <Dialog open={showFilter} onOpenChange={setShowFilter}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Advanced filters</DialogTitle>
            <DialogDescription>Drill into a precise slice of activity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Type</div>
              <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="w-full p-2 rounded-lg border border-border bg-card">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Currency</div>
              <select value={ccy} onChange={(e) => setCcy(e.target.value)} className="w-full p-2 rounded-lg border border-border bg-card">
                <option value="All">All</option><option>NGN</option><option>USD</option><option>EUR</option><option>GBP</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Date range</div>
              <select value={range} onChange={(e) => setRange(e.target.value)} className="w-full p-2 rounded-lg border border-border bg-card">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="365">This year</option>
              </select>
            </div>
            <Button className="w-full" onClick={() => setShowFilter(false)}>Apply filters</Button>
            <Button variant="ghost" className="w-full" onClick={() => { setType("All"); setCcy("All"); setRange("30"); setQuery(""); setShowFilter(false); }}>
              <X className="h-3.5 w-3.5 mr-1" /> Clear all
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail modal */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-md">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>Transaction {active.id}</DialogTitle>
                <DialogDescription>{active.desc}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <Row k="Date" v={active.date} />
                <Row k="Type" v={active.type} />
                <Row k="Amount" v={fmtMoney(active.amount, active.ccy)} />
                <Row k="Status" v={active.status} />
                <Row k="Corridor" v="Smart-routed · Tier 1" />
                <Row k="Settlement" v="Fast rail · after compliance clears" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => toast.success("Receipt downloaded")}>Download receipt</Button>
                <Button className="flex-1" onClick={() => { setActive(null); toast.info("Opening dispute…"); }}>Raise dispute</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
