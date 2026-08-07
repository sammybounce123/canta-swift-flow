import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Receipt, Plus, Send, Copy } from "lucide-react";
import { toast } from "sonner";
import { fmtMoney } from "@/lib/mock";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/invoices")({
  head: () => ({ meta: [{ title: "Invoices — Canta" }] }),
  component: InvoicesPage,
});

type Invoice = {
  id: string;
  payer: string;
  payerEmail: string;
  type: string;
  amount: number;
  ccy: string;
  status: "Sent" | "Paid" | "Overdue" | "Draft";
  due: string;
  notes?: string;
  createdAt: string;
};

const LS_KEY = "canta:collections:invoices";

const SEED: Invoice[] = [
  {
    id: "INV-2041",
    payer: "Adaeze Okafor",
    payerEmail: "adaeze@lagos.edu.ng",
    type: "Tuition payment",
    amount: 8500,
    ccy: "USD",
    status: "Sent",
    due: "2026-06-20",
    createdAt: "2026-06-01",
  },
  {
    id: "INV-2039",
    payer: "Tunde Bakare",
    payerEmail: "tunde@parents.ng",
    type: "Property payment",
    amount: 24_000,
    ccy: "USD",
    status: "Paid",
    due: "2026-06-01",
    createdAt: "2026-05-15",
  },
  {
    id: "INV-2034",
    payer: "Lagos Med Clinic",
    payerEmail: "ops@lagosmed.com",
    type: "Medical payment",
    amount: 4_200,
    ccy: "EUR",
    status: "Overdue",
    due: "2026-05-30",
    createdAt: "2026-05-10",
  },
];

function readLS(): Invoice[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return SEED;
    const arr = JSON.parse(raw);
    // Items pushed from /collections/new use a different shape; normalize.
    const norm: Invoice[] = (Array.isArray(arr) ? arr : []).map((x: any) => ({
      // eslint-disable-line @typescript-eslint/no-explicit-any
      id: x.id,
      payer: x.payer ?? x.subject ?? "Payer",
      payerEmail: x.payerEmail ?? x.fields?.payerEmail ?? "",
      type: x.type ?? x.purpose ?? "Invoice",
      amount: Number(x.amount) || 0,
      ccy: x.ccy ?? "USD",
      status: (x.status as Invoice["status"]) ?? "Sent",
      due: x.due ?? x.deadline ?? "—",
      notes: x.notes,
      createdAt: (x.createdAt ?? "").slice(0, 10) || new Date().toISOString().slice(0, 10),
    }));
    return [...norm, ...SEED];
  } catch {
    return SEED;
  }
}
function pushLS(inv: Invoice) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift(inv);
    localStorage.setItem(LS_KEY, JSON.stringify(arr.slice(0, 200)));
  } catch {
    /* ignore */
  }
}

function InvoicesPage() {
  const [list, setList] = useState<Invoice[]>(SEED);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setList(readLS());
  }, []);

  const onCreate = (inv: Invoice) => {
    pushLS(inv);
    setList([inv, ...list]);
    setOpen(false);
    toast.success("Invoice created", {
      description: `${inv.id} sent to ${inv.payerEmail || inv.payer}.`,
      action: {
        label: "Copy link",
        onClick: () => {
          navigator.clipboard?.writeText(`https://pay.canta.app/${inv.id.toLowerCase()}`);
          toast.success("Link copied");
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="KYC/KYB and supporting documents may be required before payout."
      />
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <Badge variant="outline" className="gap-1">
            <Receipt className="h-3 w-3" /> Invoices
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Issue, track and reconcile invoices in any currency. Auto-linked to payers and
            settlements.
          </p>
        </div>
        <NewInvoiceDialog open={open} setOpen={setOpen} onCreate={onCreate} />
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Payer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{i.payer}</div>
                    {i.payerEmail && (
                      <div className="text-xs text-muted-foreground">{i.payerEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{i.type}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    {fmtMoney(i.amount, i.ccy)}
                  </td>
                  <td className="px-4 py-3 text-xs">{i.due}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        i.status === "Paid"
                          ? "border-success/30 text-success bg-success/10 text-[10px]"
                          : i.status === "Overdue"
                            ? "border-destructive/30 text-destructive bg-destructive/10 text-[10px]"
                            : i.status === "Draft"
                              ? "border-border text-muted-foreground text-[10px]"
                              : "border-primary/30 text-primary bg-primary/10 text-[10px]"
                      }
                    >
                      {i.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard?.writeText(
                          `https://pay.canta.app/${i.id.toLowerCase()}`,
                        );
                        toast.success("Payment link copied");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" /> Link
                    </Button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    No invoices yet — create your first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function NewInvoiceDialog({
  open,
  setOpen,
  onCreate,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  onCreate: (i: Invoice) => void;
}) {
  const [d, setD] = useState({
    payer: "",
    payerEmail: "",
    type: "Tuition payment",
    amount: "",
    ccy: "USD",
    due: "",
    notes: "",
  });
  const submit = () => {
    if (!d.payer.trim() || !d.amount) {
      toast.error("Payer name and amount are required");
      return;
    }
    onCreate({
      id: `INV-${Math.floor(2050 + Math.random() * 9999)}`,
      payer: d.payer.trim(),
      payerEmail: d.payerEmail.trim(),
      type: d.type,
      amount: Number(d.amount) || 0,
      ccy: d.ccy,
      status: "Sent",
      due: d.due || "—",
      notes: d.notes,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setD({
      payer: "",
      payerEmail: "",
      type: "Tuition payment",
      amount: "",
      ccy: "USD",
      due: "",
      notes: "",
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 mr-1.5" /> Create invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Invoice type" wide>
            <Select value={d.type} onValueChange={(v) => setD({ ...d, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Tuition payment",
                  "Property payment",
                  "Medical payment",
                  "Supplier invoice",
                  "Travel payment",
                  "E-commerce order",
                  "Professional service",
                ].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Payer name *">
            <Input
              value={d.payer}
              onChange={(e) => setD({ ...d, payer: e.target.value })}
              placeholder="Jane Adewale"
            />
          </Field>
          <Field label="Payer email">
            <Input
              type="email"
              value={d.payerEmail}
              onChange={(e) => setD({ ...d, payerEmail: e.target.value })}
              placeholder="jane@email.com"
            />
          </Field>
          <Field label="Amount *">
            <Input
              type="number"
              value={d.amount}
              onChange={(e) => setD({ ...d, amount: e.target.value })}
              placeholder="8500"
            />
          </Field>
          <Field label="Settlement currency">
            <Select value={d.ccy} onValueChange={(v) => setD({ ...d, ccy: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["USD", "GBP", "EUR", "RMB", "AED", "CAD"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Due date">
            <Input
              type="date"
              value={d.due}
              onChange={(e) => setD({ ...d, due: e.target.value })}
            />
          </Field>
          <Field label="Notes" wide>
            <Textarea
              value={d.notes}
              onChange={(e) => setD({ ...d, notes: e.target.value })}
              placeholder="Description of goods or services"
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="bg-primary" onClick={submit}>
            <Send className="h-4 w-4 mr-1.5" /> Send invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
