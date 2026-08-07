import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { tradeFiles, fmtMoney } from "@/lib/mock";
import { TradeFileExplainer } from "@/components/TradeFileExplainer";
import { createDraftTradeFile, readDraftTradeFiles as readDrafts, type TradeFileEvent } from "@/lib/trade-file-auto";
import { FileText, Plus, Search, ArrowRight, Ship, AlertTriangle, CheckCircle2, Clock, Upload, Receipt, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";


export const Route = createFileRoute("/trade-desk/")({
  head: () => ({ meta: [{ title: "Trade Desk — Canta" }] }),
  validateSearch: (s: Record<string, unknown>): { new?: true } => {
    const isNew = s.new === "1" || s.new === true || s.new === "true";
    return isNew ? { new: true } : {};
  },
  component: TradeDeskList,
});

const STATUS_FILTERS = ["All", "Drafting", "In Transit", "Arrived", "Cleared", "Delivered"] as const;

function readDraftTradeFiles(): typeof tradeFiles {
  return readDrafts() as unknown as typeof tradeFiles;
}

function TradeDeskList() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [draftOpen, setDraftOpen] = useState(false);
  const [drafts, setDrafts] = useState<typeof tradeFiles>([]);

  useEffect(() => { setDrafts(readDraftTradeFiles()); }, [draftOpen]);
  useEffect(() => {
    if (search.new) {
      setDraftOpen(true);
      navigate({ to: "/trade-desk", search: {} as never, replace: true });
    }
  }, [search.new, navigate]);

  const allFiles = useMemo(() => [...drafts, ...tradeFiles], [drafts]);

  const filtered = useMemo(() => {
    return allFiles.filter((f) => {
      if (status !== "All" && f.status !== status) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return [f.name, f.id, f.importer, f.supplier, f.forwarder, f.origin, f.destination, f.goods]
        .some((v) => (v ?? "").toLowerCase().includes(s));
    });
  }, [q, status, allFiles]);

  const stats = useMemo(() => ({
    total: allFiles.length,
    inTransit: allFiles.filter((f) => f.status === "In Transit").length,
    arrived: allFiles.filter((f) => f.status === "Arrived" || f.status === "Cleared").length,
    atRisk: allFiles.filter((f) => f.risk === "High").length,
    value: allFiles.reduce((s, f) => s + (f.invoiceValue ?? 0), 0),
  }), [allFiles]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Trade Files</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Create a Trade File to pay any supplier globally. Add supplier bank details, upload invoice documents,
            accept an FX quote, fund in NGN or USDT, and track settlement. Your supplier does not need a Canta account.
          </p>
        </div>
        <Button onClick={() => setDraftOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> New Trade File
        </Button>
      </div>

      <ContextualStart />

      <NewTradeFileDialog open={draftOpen} setOpen={setDraftOpen} />

      <TradeFileExplainer />




      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi icon={<FileText className="h-4 w-4" />} label="Active trade files" value={stats.total.toString()} />
        <Kpi icon={<Ship className="h-4 w-4" />} label="In transit" value={stats.inTransit.toString()} tone="accent" />
        <Kpi icon={<CheckCircle2 className="h-4 w-4" />} label="Arrived / cleared" value={stats.arrived.toString()} tone="success" />
        <Kpi icon={<AlertTriangle className="h-4 w-4" />} label="At risk" value={stats.atRisk.toString()} tone="danger" />
      </div>

      <Card className="p-4 shadow-card">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by importer, supplier, BL, file ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* List */}
      <Card className="shadow-card overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border bg-secondary/30">
          <div className="col-span-4">Trade file</div>
          <div className="col-span-2">Importer · Supplier</div>
          <div className="col-span-2">Route</div>
          <div className="col-span-1">Value</div>
          <div className="col-span-1">Payment</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">ETA</div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((f) => (
            <Link
              key={f.id}
              to="/trade-desk/$fileId"
              params={{ fileId: f.id }}
              className="grid grid-cols-12 px-5 py-4 items-center hover:bg-secondary/40 group"
            >
              <div className="col-span-4 min-w-0">
                <div className="text-sm font-semibold flex items-center gap-2 truncate">
                  {f.name}
                  <RiskBadge risk={f.risk} />
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{f.id} · {f.goods}</div>
              </div>
              <div className="col-span-2 text-xs">
                <div className="font-medium truncate">{f.importer}</div>
                <div className="text-muted-foreground truncate">{f.supplier}</div>
              </div>
              <div className="col-span-2 text-xs text-muted-foreground truncate">{f.origin} → {f.destination}</div>
              <div className="col-span-1 text-sm font-semibold tabular-nums">{fmtMoney(f.invoiceValue, f.ccy)}</div>
              <div className="col-span-1">
                <Badge variant="outline" className="text-[10px]">{f.paymentStatus}</Badge>
              </div>
              <div className="col-span-1">
                <Badge className="text-[10px] bg-secondary text-secondary-foreground">{f.status}</Badge>
              </div>
              <div className="col-span-1 text-right text-xs text-muted-foreground flex items-center justify-end gap-1">
                <Clock className="h-3 w-3" />
                {f.eta}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 ml-1 text-primary" />
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              <div className="mb-3">No trade files match your filters.</div>
              <Button size="sm" onClick={() => setDraftOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Create your first trade file
              </Button>
            </div>
          )}

        </div>
      </Card>

    </div>
  );
}

type QuickStart = { key: string; label: string; icon: typeof Upload; event: TradeFileEvent; hint: string };
const QUICK_STARTS: QuickStart[] = [
  { key: "bl",      label: "Upload Bill of Lading",  icon: Upload,  event: "bl_upload",                hint: "Drop a BL and we open a Trade File with the shipment already attached." },
  { key: "invoice", label: "Add Supplier Invoice",   icon: Receipt, event: "supplier_invoice",         hint: "Attach a supplier invoice to draft a file with payment and cost lined up." },
  { key: "track",   label: "Track Shipment",         icon: Ship,    event: "container_document",       hint: "Enter a container or booking to start a file that tracks the movement." },
  { key: "pay",     label: "Start Supplier Payment", icon: Send,    event: "supplier_payment_request", hint: "Open a payment request — the Trade File follows the money." },
];

function ContextualStart() {
  const navigate = useNavigate();
  const run = (q: QuickStart) => {
    const { id } = createDraftTradeFile(q.event);
    toast.success("Trade File opened", { description: `${id} — ${q.label}` });
    navigate({ to: "/trade-desk/$fileId", params: { fileId: id } });
  };
  return (
    <Card className="p-4 shadow-card border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <div className="text-[11px] uppercase tracking-widest text-primary font-semibold mb-2">Start here</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {QUICK_STARTS.map((q) => (
          <button
            key={q.key}
            onClick={() => run(q)}
            className="text-left rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition p-3 group"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <q.icon className="h-4 w-4 text-primary" />
              <span>{q.label}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{q.hint}</div>
          </button>
        ))}
      </div>
    </Card>
  );
}


function Kpi({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: "success" | "danger" | "accent" }) {
  const toneCls =
    tone === "success" ? "text-success" :
    tone === "danger" ? "text-destructive" :
    tone === "accent" ? "text-accent" : "text-foreground";
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon} {label}</div>
      <div className={`text-2xl font-semibold mt-1.5 tabular-nums ${toneCls}`}>{value}</div>
    </Card>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const cls =
    risk === "High" ? "bg-destructive/15 text-destructive border-destructive/30"
    : risk === "Medium" ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
    : "bg-success/15 text-success border-success/30";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cls}`}>{risk}</span>;
}

const SETTLEMENT_CCY = ["RMB", "USD", "EUR", "AED", "GBP", "TRY", "INR", "ZAR"];
const PURPOSES = [
  "Goods import payment",
  "Raw materials purchase",
  "Machinery / equipment purchase",
  "Professional services",
  "Freight and logistics",
  "Other (explain in notes)",
];

function NewTradeFileDialog({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const navigate = useNavigate();
  const [d, setD] = useState({
    name: "", supplier: "", supplierCountry: "", supplierContact: "", supplierEmail: "",
    bankName: "", bankAccount: "", swift: "",
    settlementCcy: "USD", invoiceValue: "", goods: "",
    compliancePurpose: PURPOSES[0], notes: "",
  });
  const [invoiceFile, setInvoiceFile] = useState("");
  const [supportDocs, setSupportDocs] = useState<string[]>([]);

  const submit = () => {
    if (!d.supplier.trim() || !d.supplierCountry.trim() || !d.bankAccount.trim()) {
      toast.error("Supplier name, country and bank account are required");
      return;
    }
    const { id } = createDraftTradeFile("manual", {
      name: d.name.trim() || `${d.supplier.trim()} — supplier payment`,
      supplier: d.supplier.trim(),
      supplierCountry: d.supplierCountry.trim(),
      supplierContact: d.supplierContact.trim(),
      supplierEmail: d.supplierEmail.trim(),
      bankName: d.bankName.trim(),
      bankAccount: d.bankAccount.trim(),
      swift: d.swift.trim(),
      settlementCcy: d.settlementCcy,
      ccy: d.settlementCcy,
      invoiceValue: Number(d.invoiceValue) || 0,
      goods: d.goods.trim(),
      compliancePurpose: d.compliancePurpose,
      notes: d.notes.trim(),
      supplierType: "External supplier",
    });
    setOpen(false);
    toast.success("Trade File created", { description: `${id} — supplier beneficiary saved. No supplier account needed.` });
    setTimeout(() => navigate({ to: "/trade-desk/$fileId", params: { fileId: id } }), 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Trade File</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Pay any supplier globally. Add supplier details and bank account — your supplier does not need a Canta account.
          </p>
        </DialogHeader>

        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Supplier beneficiary</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Supplier company name *"><Input value={d.supplier} onChange={(e) => setD({ ...d, supplier: e.target.value })} placeholder="Shenzhen Hua Tech Co." /></Field>
          <Field label="Supplier country *"><Input value={d.supplierCountry} onChange={(e) => setD({ ...d, supplierCountry: e.target.value })} placeholder="China" /></Field>
          <Field label="Supplier contact name"><Input value={d.supplierContact} onChange={(e) => setD({ ...d, supplierContact: e.target.value })} placeholder="Li Wei" /></Field>
          <Field label="Supplier email / WhatsApp (optional)"><Input value={d.supplierEmail} onChange={(e) => setD({ ...d, supplierEmail: e.target.value })} placeholder="li@huatech.cn" /></Field>
          <Field label="Bank name"><Input value={d.bankName} onChange={(e) => setD({ ...d, bankName: e.target.value })} placeholder="Bank of China" /></Field>
          <Field label="Bank account / IBAN *"><Input value={d.bankAccount} onChange={(e) => setD({ ...d, bankAccount: e.target.value })} placeholder="6210 **** 1144" /></Field>
          <Field label="SWIFT / routing"><Input value={d.swift} onChange={(e) => setD({ ...d, swift: e.target.value })} placeholder="BKCHCNBJ" /></Field>
          <Field label="Settlement currency">
            <Select value={d.settlementCcy} onValueChange={(v) => setD({ ...d, settlementCcy: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SETTLEMENT_CCY.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>

        <div className="text-[11px] uppercase tracking-widest text-muted-foreground pt-1">Invoice & documents</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Trade File name"><Input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Guangzhou Q3 Electronics" /></Field>
          <Field label="Invoice amount"><Input type="number" value={d.invoiceValue} onChange={(e) => setD({ ...d, invoiceValue: e.target.value })} placeholder="184000" /></Field>
          <Field label="Goods / service description" wide><Input value={d.goods} onChange={(e) => setD({ ...d, goods: e.target.value })} placeholder="240 cartons of mixed electronics" /></Field>
          <Field label="Invoice upload">
            <label className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground cursor-pointer hover:border-primary hover:bg-primary/5">
              <Upload className="h-3.5 w-3.5" />
              <span className="truncate">{invoiceFile || "Upload supplier invoice"}</span>
              <Input type="file" className="hidden" onChange={(e) => setInvoiceFile(e.target.files?.[0]?.name ?? "invoice.pdf")} />
            </label>
          </Field>
          <Field label="Supporting documents">
            <label className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground cursor-pointer hover:border-primary hover:bg-primary/5">
              <Upload className="h-3.5 w-3.5" />
              <span className="truncate">{supportDocs.length ? `${supportDocs.length} file(s) attached` : "Proforma, PO, BL, packing list"}</span>
              <Input type="file" multiple className="hidden" onChange={(e) => setSupportDocs(Array.from(e.target.files ?? []).map((f) => f.name))} />
            </label>
          </Field>
          <Field label="Compliance purpose">
            <Select value={d.compliancePurpose} onValueChange={(v) => setD({ ...d, compliancePurpose: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Notes" wide><Input value={d.notes} onChange={(e) => setD({ ...d, notes: e.target.value })} placeholder="Anything Canta compliance should know" /></Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-primary" onClick={submit}>Create Trade File</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
