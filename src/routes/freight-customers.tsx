import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ReadinessBar } from "@/components/ReadinessBar";
import { UserPlus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useFreightStore, freightStore, customerOpenShipments, customerOutstandingBalance, fmtFreight, type FreightCustomer } from "@/lib/freight-store";

export const Route = createFileRoute("/freight-customers")({
  head: () => ({ meta: [{ title: "Customer Records — Canta Freight" }] }),
  component: FreightCustomers,
});

type FormState = { company: string; contact: string; email: string; phone: string; route: string };
const EMPTY_FORM: FormState = { company: "", contact: "", email: "", phone: "", route: "" };

function FreightCustomers() {
  const state = useFreightStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<FreightCustomer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setAddOpen(true); };
  const openEdit = (c: FreightCustomer) => {
    setForm({ company: c.company, contact: c.contact, email: c.email, phone: c.phone, route: c.route });
    setEditing(c);
    setAddOpen(true);
  };

  const submit = () => {
    if (!form.company.trim() || !form.contact.trim() || !form.email.trim() || !form.phone.trim() || !form.route.trim()) {
      toast.error("All fields are required");
      return;
    }
    if (editing) {
      freightStore.updateCustomer(editing.id, form);
      toast.success(`${form.company} updated`);
    } else {
      freightStore.addCustomer(form);
      toast.success(`${form.company} added as a customer`);
    }
    setAddOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Customer records demo — data persists locally in this browser only." />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
            <Link to="/freight"><ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Clearing Agent Portal</Link>
          </Button>
          <h1 className="text-2xl font-semibold">Customer Records</h1>
          <p className="text-sm text-muted-foreground mt-1">Importer customers, contacts, routes, open shipments and outstanding balances.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary" onClick={openAdd}><UserPlus className="h-4 w-4 mr-1.5" /> Add importer customer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing ? "Edit customer" : "Add importer customer"}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <FF label="Company name"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="ABC Electronics Ltd" /></FF>
              <FF label="Contact person"><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Chinedu Okafor" /></FF>
              <FF label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ops@abcelectronics.ng" /></FF>
              <FF label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234 801 234 5566" /></FF>
              <FF label="Trade route"><Input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} placeholder="Guangzhou → Lagos" /></FF>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button className="bg-primary" onClick={submit}>{editing ? "Save changes" : "Add customer"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3 text-right">Open shipments</th>
                <th className="px-4 py-3 text-right">Outstanding</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.customers.map((c) => {
                const outstanding = customerOutstandingBalance(state, c.id);
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{c.company}</td>
                    <td className="px-4 py-3">{c.contact}</td>
                    <td className="px-4 py-3 text-xs">{c.email}</td>
                    <td className="px-4 py-3 text-xs font-mono">{c.phone}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{c.route}</Badge></td>
                    <td className="px-4 py-3 text-right tabular-nums">{customerOpenShipments(state, c.id)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {outstanding > 0 ? <span className="text-destructive font-medium">{fmtFreight(outstanding, "USD")}</span> : "—"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {c.company}?</AlertDialogTitle>
                            <AlertDialogDescription>This removes the customer and any linked shipments/invoices from this demo workspace.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { freightStore.removeCustomer(c.id); toast.success(`${c.company} removed`); }}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                );
              })}
              {state.customers.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No customers yet — add your first importer customer.</td></tr>
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
