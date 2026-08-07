import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { Building2, Plus, Search, Upload } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import {
  useImporter,
  addSupplier,
  updateSupplier,
  addDocument,
  COUNTRIES,
  CURRENCIES,
  type SupplierRecord,
} from "@/lib/importer-store";

export const Route = createFileRoute("/importer/suppliers")({
  head: () => ({
    meta: [
      { title: "Suppliers — Canta Importer" },
      {
        name: "description",
        content: "Save supplier bank details once and pay the same supplier again in a few taps.",
      },
      { property: "og:title", content: "Suppliers — Canta Importer" },
      {
        property: "og:description",
        content: "Save supplier bank details once and pay the same supplier again in a few taps.",
      },
    ],
  }),
  component: SuppliersPage,
});

type Draft = Omit<SupplierRecord, "id" | "status">;
const EMPTY: Draft = {
  name: "",
  country: "",
  contact: "",
  contactChannel: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  swift: "",
  bankAddress: "",
  currency: "RMB",
};

function SuppliersPage() {
  const s = useImporter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierRecord | null>(null);

  const list = s.suppliers.filter(
    (x) =>
      !q ||
      `${x.name} ${x.country} ${x.bankName} ${x.currency}`.toLowerCase().includes(q.toLowerCase()),
  );

  const paymentsFor = (name: string) => s.payments.filter((p) => p.supplier === name);

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Supplier bank details are checked before payout. Records here are illustrative."
      />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Suppliers
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Save supplier bank details for future payments. Your supplier does not need a Canta
            account.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Add supplier bank details
            </Button>
          </DialogTrigger>
          <SupplierDialog
            initial={editing}
            onClose={() => {
              setOpen(false);
              setEditing(null);
            }}
          />
        </Dialog>
      </header>

      <Card className="p-3 shadow-card">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search supplier, country, bank or currency..."
            className="pl-9"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.map((sup) => {
          const pays = paymentsFor(sup.name);
          return (
            <Card key={sup.id} className="p-4 shadow-card flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{sup.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {sup.country} · {sup.currency}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {sup.status}
                </Badge>
              </div>
              <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
                <div className="truncate">
                  <b className="text-foreground">Bank:</b> {sup.bankName}
                </div>
                <div className="truncate">
                  {sup.accountNumber}
                  {sup.swift ? ` · ${sup.swift}` : ""}
                </div>
                <div>Last payment: {sup.lastPayment ?? "—"}</div>
                <div>
                  {pays.length} payment{pays.length === 1 ? "" : "s"} recorded
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Button asChild size="sm">
                  <Link to="/importer/payments" search={{ tab: "new" }}>
                    Pay again
                  </Link>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      Edit bank details
                    </Button>
                  </DialogTrigger>
                  <SupplierDialog initial={sup} onClose={() => undefined} />
                </Dialog>
                <Button asChild size="sm" variant="ghost">
                  <Link to="/importer/payments" search={{ tab: "pending" }}>
                    View previous payments
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    addDocument({
                      name: `Supplier document — ${sup.name}.pdf`,
                      type: "Supporting document",
                    });
                    toast.success("Document uploaded");
                  }}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload document
                </Button>
              </div>
            </Card>
          );
        })}
        {list.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-10">
            No suppliers match.
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        "Beneficiary" means the supplier bank account that receives the payment.
      </p>
    </div>
  );
}

function SupplierDialog({
  initial,
  onClose,
}: {
  initial: SupplierRecord | null;
  onClose: () => void;
}) {
  const [f, setF] = useState<Draft>(initial ? { ...initial } : EMPTY);
  const set = (k: keyof Draft) => (v: string) => setF((x) => ({ ...x, [k]: v }));

  const save = () => {
    if (!f.name.trim()) {
      toast.error("Supplier company name is required");
      return;
    }
    if (initial) {
      updateSupplier(initial.id, f);
      toast.success("Supplier bank details updated");
    } else {
      addSupplier(f);
      toast.success(`${f.name} saved`);
    }
    onClose();
  };

  return (
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {initial ? "Edit supplier bank details" : "Add supplier bank details"}
        </DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Label>Supplier company name *</Label>
          <Input value={f.name} onChange={(e) => set("name")(e.target.value)} />
        </div>
        <div>
          <Label>Country</Label>
          <Select value={f.country} onValueChange={set("country")}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Settlement currency</Label>
          <Select value={f.currency} onValueChange={set("currency")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Contact name</Label>
          <Input value={f.contact ?? ""} onChange={(e) => set("contact")(e.target.value)} />
        </div>
        <div>
          <Label>WhatsApp / email</Label>
          <Input
            value={f.contactChannel ?? ""}
            onChange={(e) => set("contactChannel")(e.target.value)}
          />
        </div>
        <div>
          <Label>Bank name</Label>
          <Input value={f.bankName} onChange={(e) => set("bankName")(e.target.value)} />
        </div>
        <div>
          <Label>Account name</Label>
          <Input value={f.accountName} onChange={(e) => set("accountName")(e.target.value)} />
        </div>
        <div>
          <Label>Account number / IBAN</Label>
          <Input value={f.accountNumber} onChange={(e) => set("accountNumber")(e.target.value)} />
        </div>
        <div>
          <Label>SWIFT / BIC</Label>
          <Input value={f.swift} onChange={(e) => set("swift")(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label>Bank address</Label>
          <Input value={f.bankAddress ?? ""} onChange={(e) => set("bankAddress")(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={save}>Save supplier bank details</Button>
      </DialogFooter>
    </DialogContent>
  );
}
