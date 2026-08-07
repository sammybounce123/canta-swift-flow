import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search, Send, Download, Share2, Receipt } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import { PaySupplierWizard } from "@/components/importer/PaySupplierWizard";
import { useImporter, fmtNGN, NEXT_ACTION, type SupplierPayment } from "@/lib/importer-store";

type Tab = "new" | "pending" | "completed" | "receipts";
const TABS: Tab[] = ["new", "pending", "completed", "receipts"];

export const Route = createFileRoute("/importer/payments")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => {
    const t = String(search.tab ?? "");
    return TABS.includes(t as Tab) ? { tab: t as Tab } : {};
  },
  head: () => ({
    meta: [
      { title: "Supplier Payments — Canta Importer" },
      { name: "description", content: "Start a new supplier payment, follow pending payments, review completed payments and download receipts." },
      { property: "og:title", content: "Supplier Payments — Canta Importer" },
      { property: "og:description", content: "Start a new supplier payment, follow pending payments, review completed payments and download receipts." },
    ],
  }),
  component: PaymentsPage,
});

const DONE: SupplierPayment["status"][] = ["Supplier paid", "Receipt available"];

function PaymentsPage() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const s = useImporter();
  const [q, setQ] = useState("");

  const match = (p: SupplierPayment) =>
    !q || `${p.supplier} ${p.id} ${p.status}`.toLowerCase().includes(q.toLowerCase());
  const pending = s.payments.filter((p) => !DONE.includes(p.status)).filter(match);
  const completed = s.payments.filter((p) => DONE.includes(p.status)).filter(match);
  const receipts = s.payments.filter((p) => p.receiptNo || DONE.includes(p.status)).filter(match);

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Payments are reviewed before payout. Records here are illustrative." />
      <header>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" /> Payments
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Pay any supplier globally. Your supplier does not need a Canta account. Start a payment, follow its
          progress, and download the receipt once the payout is confirmed.
        </p>
      </header>

      <Tabs value={tab ?? "pending"} onValueChange={(v) => navigate({ search: { tab: v as Tab } })}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="new">New supplier payment</TabsTrigger>
          <TabsTrigger value="pending">Pending payments</TabsTrigger>
          <TabsTrigger value="completed">Completed payments</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-4">
          <PaySupplierWizard />
        </TabsContent>

        <TabsContent value="pending" className="mt-4 space-y-3">
          <SearchBar q={q} setQ={setQ} />
          <PaymentGrid
            rows={pending}
            empty="No pending payments. Start a new supplier payment to begin."
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-3">
          <SearchBar q={q} setQ={setQ} />
          <PaymentGrid rows={completed} empty="No completed payments yet." />
        </TabsContent>

        <TabsContent value="receipts" className="mt-4 space-y-3">
          <SearchBar q={q} setQ={setQ} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {receipts.map((p) => (
              <Card key={p.id} className="p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate flex items-center gap-1.5">
                      <Receipt className="h-4 w-4 text-primary" /> {p.receiptNo ?? `RC-${p.id.slice(3)}`}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{p.supplier} · {p.createdAt}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                </div>
                <dl className="mt-3 text-xs space-y-1">
                  <Line k="Supplier bank account" v={`${p.bank} · ${p.accountNumber}`} />
                  <Line k="Amount you paid" v={fmtNGN(p.ngnCost)} />
                  <Line k="Amount supplier received" v={`${p.currency} ${p.amount.toLocaleString()}`} />
                  <Line k="Exchange rate" v={`1 ${p.currency} = ₦${p.rate}`} />
                  <Line k="Fees" v={fmtNGN(p.fee)} />
                  <Line k="Canta reference" v={p.id} />
                </dl>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Receipt opened")}>View receipt</Button>
                  <Button size="sm" onClick={() => toast.success("Receipt download started")}><Download className="h-3.5 w-3.5" /> Download</Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.success("Receipt shared by email")}><Share2 className="h-3.5 w-3.5" /> Share by email</Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.success("Receipt shared on WhatsApp")}><Share2 className="h-3.5 w-3.5" /> Share on WhatsApp</Button>
                </div>
              </Card>
            ))}
            {receipts.length === 0 && (
              <div className="col-span-full text-center text-sm text-muted-foreground py-10">
                No receipts yet. Receipts appear once a supplier payment is confirmed.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SearchBar({ q, setQ }: { q: string; setQ: (v: string) => void }) {
  return (
    <Card className="p-3 shadow-card">
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search supplier, reference or status..." className="pl-9" />
      </div>
    </Card>
  );
}

function PaymentGrid({ rows, empty }: { rows: SupplierPayment[]; empty: string }) {
  return (
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
            <div>Supplier bank account: {p.bank} · {p.accountNumber}</div>
            <div>Documents linked: {p.documents.length || "none yet"}</div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs">Next: <b>{NEXT_ACTION[p.status]}</b></span>
            <div className="ml-auto flex gap-1.5">
              <Button asChild size="sm" variant="outline"><Link to="/importer/documents">Documents</Link></Button>
              <Button asChild size="sm" variant="ghost"><Link to="/importer/shipments">Shipments</Link></Button>
            </div>
          </div>
        </Card>
      ))}
      {rows.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-10">{empty}</div>}
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
