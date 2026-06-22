import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Link as LinkIcon, Plus, Copy, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { fmtMoney } from "@/lib/mock";

export const Route = createFileRoute("/payment-links")({
  head: () => ({ meta: [{ title: "Payment Links — Canta" }] }),
  component: PaymentLinksPage,
});

type PaymentLink = {
  id: string;
  invoiceId?: string;
  label: string;
  url: string;
  amount: number;
  ccy: string;
  status: "Active" | "Paid" | "Expired";
  createdAt: string;
};

const LS_KEY = "canta:collections:paymentLinks";

const payUrl = (id: string) => {
  const base = typeof window !== "undefined" ? window.location.origin : "https://canta.app";
  return `${base}/p/${id.toLowerCase()}`;
};

const SEED: PaymentLink[] = [
  { id: "PL-DEMO-001", label: "Tuition — Spring 2026",  url: payUrl("PL-DEMO-001"), amount: 8500, ccy: "USD", status: "Active", createdAt: "2026-06-12" },
  { id: "PL-DEMO-002", label: "Donation — June Drive",  url: payUrl("PL-DEMO-002"), amount: 2500, ccy: "USD", status: "Paid",   createdAt: "2026-06-11" },
  { id: "PL-DEMO-003", label: "Conference ticket",      url: payUrl("PL-DEMO-003"), amount: 350,  ccy: "EUR", status: "Active", createdAt: "2026-06-10" },
];

function readLS(): PaymentLink[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return SEED;
    const arr = JSON.parse(raw);
    const norm: PaymentLink[] = (Array.isArray(arr) ? arr : []).map((x: any) => ({
      id: x.id,
      invoiceId: x.invoiceId,
      label: x.label ?? x.invoiceId ?? x.id,
      url: payUrl(x.id ?? ""),
      amount: Number(x.amount) || 0,
      ccy: x.ccy ?? "USD",
      status: (x.status as PaymentLink["status"]) ?? "Active",
      createdAt: (x.createdAt ?? "").slice(0, 10) || new Date().toISOString().slice(0, 10),
    }));
    return [...norm, ...SEED];
  } catch { return SEED; }
}
function writeLS(arr: PaymentLink[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch {}
}

function PaymentLinksPage() {
  const [list, setList] = useState<PaymentLink[]>(SEED);
  const [open, setOpen] = useState(false);

  useEffect(() => { setList(readLS()); }, []);

  const add = (p: PaymentLink) => {
    const next = [p, ...list];
    setList(next); writeLS(next);
    toast.success("Payment link created", {
      description: p.url,
      action: { label: "Copy", onClick: () => { navigator.clipboard?.writeText(p.url); toast.success("Link copied"); } },
    });
    setOpen(false);
  };
  const remove = (id: string) => {
    const next = list.filter(l => l.id !== id);
    setList(next); writeLS(next);
    toast.success("Payment link removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <Badge variant="outline" className="gap-1"><LinkIcon className="h-3 w-3" /> Payment Links</Badge>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Payment Links</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Shareable links for tuition, donations, products and bookings. Collect locally, settle globally.
          </p>
        </div>
        <NewLinkDialog open={open} setOpen={setOpen} onAdd={add} />
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3">Link</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.label}</div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[280px]">{p.url}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{p.invoiceId ?? p.id}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(p.amount, p.ccy)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      p.status === "Paid" ? "border-success/30 text-success bg-success/10 text-[10px]"
                      : p.status === "Expired" ? "border-border text-muted-foreground text-[10px]"
                      : "border-primary/30 text-primary bg-primary/10 text-[10px]"
                    }>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.createdAt}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(p.url); toast.success("Link copied"); }}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={p.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)} aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-muted-foreground">No payment links yet — create your first.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function NewLinkDialog({ open, setOpen, onAdd }: { open: boolean; setOpen: (o: boolean) => void; onAdd: (p: PaymentLink) => void }) {
  const [d, setD] = useState({ label: "", amount: "", ccy: "USD" });
  const submit = () => {
    if (!d.label.trim() || !d.amount) { toast.error("Label and amount are required"); return; }
    const id = `PL-${Math.floor(1000 + Math.random() * 9000)}`;
    onAdd({
      id,
      label: d.label.trim(),
      url: `https://pay.canta.app/${id.toLowerCase()}`,
      amount: Number(d.amount) || 0,
      ccy: d.ccy,
      status: "Active",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setD({ label: "", amount: "", ccy: "USD" });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> Create payment link</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create payment link</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Label *" wide>
            <Input value={d.label} onChange={(e) => setD({ ...d, label: e.target.value })} placeholder="Tuition — Spring 2026" />
          </Field>
          <Field label="Amount *">
            <Input type="number" value={d.amount} onChange={(e) => setD({ ...d, amount: e.target.value })} placeholder="1500" />
          </Field>
          <Field label="Currency">
            <Select value={d.ccy} onValueChange={(v) => setD({ ...d, ccy: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["USD","EUR","GBP","NGN","ZAR","KES"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-primary" onClick={submit}>Create link</Button>
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
