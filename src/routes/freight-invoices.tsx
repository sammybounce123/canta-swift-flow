import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ReadinessBar } from "@/components/ReadinessBar";
import { ArrowLeft, Plus, Receipt } from "lucide-react";
import { useFreightStore, freightStore, fmtFreight, type Currency } from "@/lib/freight-store";

export const Route = createFileRoute("/freight-invoices")({
  head: () => ({ meta: [{ title: "Freight Invoices — Canta" }] }),
  component: FreightInvoices,
});

type FormState = { customerId: string; shipmentId: string; description: string; amount: string; currency: Currency; dueDate: string };
const EMPTY_FORM: FormState = { customerId: "", shipmentId: "", description: "Freight & clearing fee", amount: "", currency: "USD", dueDate: "" };

function FreightInvoices() {
  const state = useFreightStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const customerName = (id: string) => state.customers.find((c) => c.id === id)?.company ?? "—";
  const shipmentNumber = (id: string | null) => (id ? state.shipments.find((s) => s.id === id)?.shipmentNumber ?? "—" : "—");

  const submit = () => {
    const amount = Number(form.amount);
    if (!form.customerId) return toast.error("Select a customer");
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (!form.dueDate) return toast.error("Select a due date");
    freightStore.addInvoice({
      customerId: form.customerId,
      shipmentId: form.shipmentId || null,
      lineItems: [{ id: `li_${Date.now()}`, description: form.description || "Freight charges", amount }],
      amount,
      currency: form.currency,
      dueDate: form.dueDate,
    });
    toast.success("Freight invoice created");
    setOpen(false);
    setForm(EMPTY_FORM);
  };

  const shipmentsForCustomer = state.shipments.filter((s) => s.customerId === form.customerId);

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Mark invoice status carefully so customers can track outstanding payments." />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
            <Link to="/freight"><ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Clearing Agent Portal</Link>
          </Button>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Freight Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Issue freight invoices to customers and track collection, linked to shipments.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(EMPTY_FORM); }}>
          <DialogTrigger asChild><Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> Create freight invoice</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create freight invoice</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <FF label="Customer">
                <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v, shipmentId: "" })}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{state.customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}</SelectContent>
                </Select>
              </FF>
              <FF label="Shipment (optional)">
                <Select value={form.shipmentId} onValueChange={(v) => setForm({ ...form, shipmentId: v })} disabled={!form.customerId}>
                  <SelectTrigger><SelectValue placeholder="Select shipment" /></SelectTrigger>
                  <SelectContent>{shipmentsForCustomer.map((s) => <SelectItem key={s.id} value={s.id}>{s.shipmentNumber}</SelectItem>)}</SelectContent>
                </Select>
              </FF>
              <FF label="Line item description"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FF>
              <FF label="Currency">
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v as Currency })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="NGN">NGN</SelectItem></SelectContent>
                </Select>
              </FF>
              <FF label="Amount"><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="4800" /></FF>
              <FF label="Due date"><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></FF>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-primary" onClick={submit}>Create invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Shipment</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Paid</th>
              </tr>
            </thead>
            <tbody>
              {state.invoices.map((i) => (
                <tr key={i.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{i.invoiceNumber}</td>
                  <td className="px-4 py-3">{customerName(i.customerId)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{shipmentNumber(i.shipmentId)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtFreight(i.amount, i.currency)}</td>
                  <td className="px-4 py-3 text-xs tabular-nums">{i.dueDate}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={i.status === "Paid" ? "text-[10px] bg-success/15 text-success border-success/30" : "text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30"}>
                      {i.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-muted-foreground">{i.status === "Paid" ? "Paid" : "Unpaid"}</span>
                      <Switch
                        checked={i.status === "Paid"}
                        onCheckedChange={(checked) => {
                          const next = checked ? "Paid" : "Unpaid";
                          freightStore.updateInvoiceStatus(i.id, next);
                          toast.success(`${i.invoiceNumber} marked ${next.toLowerCase()}`);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {state.invoices.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No freight invoices yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
