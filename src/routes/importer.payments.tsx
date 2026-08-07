import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Send } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import { useImporter, fmtNGN, NEXT_ACTION } from "@/lib/importer-store";

export const Route = createFileRoute("/importer/payments")({
  head: () => ({
    meta: [
      { title: "Supplier Payments — Canta Importer" },
      { name: "description", content: "Every supplier payment with its current status and the next step you need to take." },
      { property: "og:title", content: "Supplier Payments — Canta Importer" },
      { property: "og:description", content: "Every supplier payment with its current status and the next step you need to take." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const s = useImporter();
  const [q, setQ] = useState("");
  const rows = s.payments.filter((p) => !q || `${p.supplier} ${p.id} ${p.status}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Payments are reviewed before payout. Records here are illustrative." />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Send className="h-5 w-5 text-primary" /> Supplier Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track each payment from draft to supplier paid and receipt.</p>
        </div>
        <Button asChild><Link to="/importer/pay-supplier">Pay a supplier</Link></Button>
      </header>

      <Card className="p-3 shadow-card">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search supplier, reference or status..." className="pl-9" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {rows.map((p) => (
          <Card key={p.id} className="p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">{p.supplier}</div>
                <div className="text-xs text-muted-foreground">{p.id} · {p.createdAt} · {p.country}</div>
              </div>
              <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
            </div>
            <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
              <div>Supplier receives: <b className="text-foreground">{p.currency} {p.amount.toLocaleString()}</b></div>
              <div>You pay: <b className="text-foreground">{fmtNGN(p.ngnCost)}</b> (fee {fmtNGN(p.fee)})</div>
              <div>Supplier bank details: {p.bank} · {p.accountNumber}</div>
              <div>Documents linked to this payment: {p.documents.length || "none yet"}</div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs">Next: <b>{NEXT_ACTION[p.status]}</b></span>
              <div className="ml-auto flex gap-1.5">
                <Button asChild size="sm" variant="outline"><Link to="/importer/documents">Documents</Link></Button>
                <Button asChild size="sm" variant="ghost"><Link to="/importer/receipts">Receipts</Link></Button>
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-10">No supplier payments yet.</div>}
      </div>
    </div>
  );
}
