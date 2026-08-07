import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Receipt, Download, Share2, Search } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import { useImporter, fmtNGN } from "@/lib/importer-store";

export const Route = createFileRoute("/importer/receipts")({
  head: () => ({
    meta: [
      { title: "Receipts — Canta Importer" },
      { name: "description", content: "Download and share payment and settlement receipts for every supplier payment." },
      { property: "og:title", content: "Receipts — Canta Importer" },
      { property: "og:description", content: "Download and share payment and settlement receipts for every supplier payment." },
    ],
  }),
  component: ReceiptsPage,
});

function ReceiptsPage() {
  const s = useImporter();
  const [q, setQ] = useState("");
  const [ccy, setCcy] = useState("all");

  const rows = s.payments
    .filter((p) => p.receiptNo || p.status === "Supplier paid" || p.status === "Receipt available")
    .filter((p) => (ccy === "all" || p.currency === ccy) && (!q || `${p.supplier} ${p.id} ${p.createdAt}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Receipts are generated after provider confirmation. Documents here are illustrative." />
      <header>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Receipts</h1>
        <p className="text-sm text-muted-foreground mt-1">Download payment and settlement receipts for your records.</p>
      </header>

      <Card className="p-3 shadow-card flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search supplier, reference or date..." className="pl-9" />
        </div>
        <Select value={ccy} onValueChange={setCcy}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All currencies</SelectItem>
            {Array.from(new Set(s.payments.map((p) => p.currency))).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {rows.map((p) => (
          <Card key={p.id} className="p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">{p.receiptNo ?? `RC-${p.id.slice(3)}`}</div>
                <div className="text-xs text-muted-foreground truncate">{p.supplier} · {p.createdAt}</div>
              </div>
              <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
            </div>
            <dl className="mt-3 text-xs space-y-1">
              <Line k="Supplier bank" v={`${p.bank} · ${p.accountNumber}`} />
              <Line k="Amount you paid" v={fmtNGN(p.ngnCost)} />
              <Line k="Amount supplier received" v={`${p.currency} ${p.amount.toLocaleString()}`} />
              <Line k="FX rate" v={`1 ${p.currency} = ₦${p.rate}`} />
              <Line k="Fees" v={fmtNGN(p.fee)} />
              <Line k="Payment status" v={p.status} />
              <Line k="Canta reference" v={p.id} />
            </dl>
            <p className="text-[11px] text-muted-foreground mt-2">Payment reviewed for compliance before payout.</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Button size="sm" onClick={() => toast.success("Receipt download started")}><Download className="h-3.5 w-3.5" /> Download receipt</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Receipt shared")}><Share2 className="h-3.5 w-3.5" /> Share receipt</Button>
              <Button asChild size="sm" variant="ghost"><Link to="/importer/payments">View payment details</Link></Button>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-10">No receipts yet. Receipts appear once a supplier payment is confirmed.</div>}
      </div>
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
