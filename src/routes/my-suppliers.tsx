import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { Factory, Plus, Search, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/my-suppliers")({
  head: () => ({ meta: [{ title: "My Suppliers — Canta" }] }),
  component: MySuppliersPage,
});

type Supplier = {
  id: string;
  name: string;
  country: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  terms: string;
  notes: string;
};

const SEED: Supplier[] = [
  {
    id: "SUP-001",
    name: "Yiwu Fashion Co.",
    country: "China",
    category: "Apparel",
    contact: "Mei Lin",
    email: "mei@yiwufashion.cn",
    phone: "+86 579 0001",
    terms: "30% TT, 70% on BL",
    notes: "Reliable, 12 shipments",
  },
  {
    id: "SUP-002",
    name: "Guangzhou Electronics",
    country: "China",
    category: "Electronics",
    contact: "Wei Zhang",
    email: "wei@gze.cn",
    phone: "+86 20 0101",
    terms: "50/50 TT",
    notes: "",
  },
  {
    id: "SUP-003",
    name: "Istanbul Textiles",
    country: "Turkey",
    category: "Textiles",
    contact: "Ahmet K.",
    email: "ahmet@istex.tr",
    phone: "+90 212 0101",
    terms: "Net 45",
    notes: "",
  },
];

const KEY = "canta:my-suppliers";

function MySuppliersPage() {
  const [list, setList] = useState<Supplier[]>(SEED);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setList(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* noop */
    }
  }, [list]);

  const filtered = useMemo(
    () =>
      list.filter(
        (s) =>
          !q ||
          s.name.toLowerCase().includes(q.toLowerCase()) ||
          s.country.toLowerCase().includes(q.toLowerCase()) ||
          s.category.toLowerCase().includes(q.toLowerCase()),
      ),
    [list, q],
  );

  function handleAdd(data: Omit<Supplier, "id">) {
    const id = `SUP-${String(list.length + 1).padStart(3, "0")}`;
    setList((cur) => [{ id, ...data }, ...cur]);
    toast.success(`${data.name} added to your suppliers`);
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Verification helps reduce supplier risk but does not guarantee supplier performance."
      />
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary shrink-0" /> My Suppliers
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Your private supplier list — relationships, contacts, terms and trade history.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1.5" /> Add supplier
            </Button>
          </DialogTrigger>
          <AddSupplierDialog onSubmit={handleAdd} onClose={() => setOpen(false)} />
        </Dialog>
      </header>

      <Card className="p-3 shadow-card">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, country, or category..."
            className="pl-9"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((s) => (
          <Card key={s.id} className="p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {s.country} · {s.category}
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {s.id}
              </Badge>
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> <span className="truncate">{s.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> {s.phone}
              </div>
            </div>
            <div className="mt-3 text-[11px] bg-secondary/40 rounded p-2">
              <b>Terms:</b> {s.terms}
            </div>
            {s.notes && <div className="mt-2 text-[11px] text-muted-foreground">{s.notes}</div>}
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-10">
            No suppliers match.
          </div>
        )}
      </div>
    </div>
  );
}

function AddSupplierDialog({
  onSubmit,
  onClose,
}: {
  onSubmit: (d: Omit<Supplier, "id">) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState({
    name: "",
    country: "",
    category: "",
    contact: "",
    email: "",
    phone: "",
    terms: "",
    notes: "",
  });
  const set =
    (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = () => {
    if (!f.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }
    onSubmit(f);
  };
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Add supplier</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Label>Company name *</Label>
          <Input value={f.name} onChange={set("name")} placeholder="Yiwu Fashion Co." />
        </div>
        <div>
          <Label>Country</Label>
          <Select value={f.country} onValueChange={(v) => setF((s) => ({ ...s, country: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {[
                "China",
                "Turkey",
                "India",
                "Vietnam",
                "Nigeria",
                "Ghana",
                "Kenya",
                "South Africa",
                "United Kingdom",
                "USA",
                "Germany",
                "UAE",
              ].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Category</Label>
          <Input value={f.category} onChange={set("category")} placeholder="Apparel" />
        </div>
        <div>
          <Label>Contact person</Label>
          <Input value={f.contact} onChange={set("contact")} placeholder="Mei Lin" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={f.email} onChange={set("email")} placeholder="sales@supplier.com" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={f.phone} onChange={set("phone")} placeholder="+86 ..." />
        </div>
        <div>
          <Label>Payment terms</Label>
          <Input value={f.terms} onChange={set("terms")} placeholder="30% TT, 70% on BL" />
        </div>
        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Textarea value={f.notes} onChange={set("notes")} placeholder="History, references..." />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit}>Save supplier</Button>
      </DialogFooter>
    </DialogContent>
  );
}
