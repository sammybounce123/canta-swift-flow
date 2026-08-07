import { useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Ship, Wallet, Bell, ArrowRight, Receipt, Send, Plus } from "lucide-react";
import { toast } from "sonner";
import { createDraftTradeFile, type TradeFileEvent } from "@/lib/trade-file-auto";

const STEPS = [
  { icon: Upload,   t: "Create",     d: "Open a Trade File for the payment — from a document, an invoice or manually." },
  { icon: FileText, t: "Add supplier", d: "Enter supplier company, country, contact and bank details. No supplier account needed." },
  { icon: Ship,     t: "Quote",      d: "Upload the invoice, get an FX quote and accept the rate you want." },
  { icon: Wallet,   t: "Fund & pay", d: "Fund in NGN or USDT. Canta reviews compliance and pays the supplier's bank." },
  { icon: Bell,     t: "Settle",     d: "Track settlement and download the payment receipt and confirmation." },
];

type ContextualAction = {
  key: string;
  label: string;
  icon: typeof Upload;
  event: TradeFileEvent;
  desc: string;
};

const ACTIONS: ContextualAction[] = [
  { key: "bl",       label: "Upload Bill of Lading", icon: Upload,  event: "bl_upload",              desc: "Drop a BL — we open a Trade File and pull the shipment details in." },
  { key: "invoice",  label: "Add Supplier Invoice",  icon: Receipt, event: "supplier_invoice",       desc: "Add a supplier invoice and we tie payment, docs and landed cost together." },
  { key: "track",    label: "Track Shipment",        icon: Ship,    event: "container_document",     desc: "Enter a container or BL number — a Trade File follows the movement." },
  { key: "pay",      label: "Start Supplier Payment", icon: Send,   event: "supplier_payment_request", desc: "Kick off a supplier payment and Canta wires it to a fresh Trade File." },
];

export function TradeFileExplainer() {
  const navigate = useNavigate();

  const run = (a: ContextualAction) => {
    const { id } = createDraftTradeFile(a.event);
    toast.success("Trade File opened", { description: `${id} — ${a.label}` });
    navigate({ to: "/trade-desk/$fileId", params: { fileId: id } });
  };

  const manual = () => {
    navigate({ to: "/trade-desk", search: { new: "1" } as never });
  };

  return (
    <Card className="p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">What is a Trade File?</div>
          <h3 className="text-lg font-semibold mt-1">One Trade File. Every supplier, invoice, shipment, document and payment connected to the trade.</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            A Trade File is your private payment case. Create one to pay any supplier globally — add supplier bank details,
            upload invoice documents, accept an FX quote, fund in NGN or USDT, and track settlement.
            Your supplier does not need a Canta account.
          </p>
        </div>
      </div>

      {/* Contextual actions (primary path) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.key}
            onClick={() => run(a)}
            className="text-left rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition p-3 group"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <a.icon className="h-4 w-4 text-primary" />
              <span>{a.label}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.desc}</div>
          </button>
        ))}
      </div>

      {/* Secondary: manual create */}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Planning ahead without any documents yet?</span>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={manual}>
          <Plus className="h-3.5 w-3.5" /> New Trade File
        </Button>
      </div>

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
        {STEPS.map((s, i) => (
          <li key={s.t} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-5 w-5 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">{i + 1}</span>
              <s.icon className="h-3.5 w-3.5" />
              <span className="font-semibold text-foreground">{s.t}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
