import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { Users, Plus, MessageCircle, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fmtMoney } from "@/lib/mock";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/buyers")({
  head: () => ({ meta: [{ title: "Buyers — Canta" }] }),
  component: BuyersPage,
});

type Buyer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  ccy: string;
  creditLimit: number;
  status: "Active" | "On hold" | "Prospect";
  createdAt: string;
};

const LS_KEY = "canta:buyers";

const SEED: Buyer[] = [
  {
    id: "B-001",
    name: "ABC Electronics",
    email: "ops@abc.ng",
    phone: "+234 803 111 2233",
    country: "Nigeria",
    ccy: "USD",
    creditLimit: 250_000,
    status: "Active",
    createdAt: "2026-05-12",
  },
  {
    id: "B-002",
    name: "Balogun Trade Hub",
    email: "info@balogun.ng",
    phone: "+234 805 222 3344",
    country: "Nigeria",
    ccy: "USD",
    creditLimit: 120_000,
    status: "Active",
    createdAt: "2026-05-20",
  },
  {
    id: "B-003",
    name: "Accra Imports Ltd",
    email: "buy@accra.gh",
    phone: "+233 244 111 999",
    country: "Ghana",
    ccy: "USD",
    creditLimit: 80_000,
    status: "Prospect",
    createdAt: "2026-06-01",
  },
];

function readLS(): Buyer[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return SEED;
    const arr = JSON.parse(raw) as Buyer[];
    return Array.isArray(arr) && arr.length ? arr : SEED;
  } catch {
    return SEED;
  }
}
function writeLS(arr: Buyer[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  } catch {}
}

function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>(SEED);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setBuyers(readLS());
  }, []);

  const add = (b: Buyer) => {
    const next = [b, ...buyers];
    setBuyers(next);
    writeLS(next);
  };
  const remove = (id: string) => {
    const next = buyers.filter((b) => b.id !== id);
    setBuyers(next);
    writeLS(next);
    toast.success("Buyer removed");
  };

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Buyer verification helps improve trust but does not guarantee payment or purchase completion."
      />
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" /> Buyers
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Buyers</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Your active African buyers — invoices, escrow status, payment history and corridor
            performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/verified-buyers">Browse Verified Buyers</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Outreach drafted", {
                description: "Bulk WhatsApp / email to all active buyers.",
              })
            }
          >
            <MessageCircle className="h-4 w-4 mr-1.5" /> Bulk outreach
          </Button>
          <AddBuyerDialog open={open} setOpen={setOpen} onAdd={add} />
        </div>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3 text-right">Credit limit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{b.name}</td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {b.email}
                    </div>
                    <div className="text-muted-foreground">{b.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{b.country}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    {fmtMoney(b.creditLimit, b.ccy)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        b.status === "Active"
                          ? "border-success/30 text-success bg-success/10 text-[10px]"
                          : b.status === "On hold"
                            ? "border-amber-500/30 text-amber-700 bg-amber-500/10 text-[10px]"
                            : "border-border text-muted-foreground text-[10px]"
                      }
                    >
                      {b.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{b.createdAt}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toast.success("Invoice draft started", { description: `For ${b.name}` })
                      }
                    >
                      Invoice
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(b.id)}
                      aria-label="Remove buyer"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {buyers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    No buyers yet — add your first.
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

function AddBuyerDialog({
  open,
  setOpen,
  onAdd,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  onAdd: (b: Buyer) => void;
}) {
  const [d, setD] = useState({
    name: "",
    email: "",
    phone: "",
    country: "Nigeria",
    ccy: "USD",
    creditLimit: "",
  });
  const submit = () => {
    if (!d.name.trim() || !d.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    onAdd({
      id: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      name: d.name.trim(),
      email: d.email.trim(),
      phone: d.phone,
      country: d.country,
      ccy: d.ccy,
      creditLimit: Number(d.creditLimit) || 0,
      status: "Active",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setOpen(false);
    setD({ name: "", email: "", phone: "", country: "Nigeria", ccy: "USD", creditLimit: "" });
    toast.success("Buyer added");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 mr-1.5" /> Add buyer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add buyer</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Buyer name *">
            <Input
              value={d.name}
              onChange={(e) => setD({ ...d, name: e.target.value })}
              placeholder="ABC Electronics"
            />
          </Field>
          <Field label="Email *">
            <Input
              type="email"
              value={d.email}
              onChange={(e) => setD({ ...d, email: e.target.value })}
              placeholder="ops@abc.com"
            />
          </Field>
          <Field label="Phone">
            <Input
              value={d.phone}
              onChange={(e) => setD({ ...d, phone: e.target.value })}
              placeholder="+234 …"
            />
          </Field>
          <Field label="Country">
            <Select value={d.country} onValueChange={(v) => setD({ ...d, country: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Nigeria",
                  "Ghana",
                  "Kenya",
                  "South Africa",
                  "Senegal",
                  "Côte d'Ivoire",
                  "Tanzania",
                  "Uganda",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Settlement currency">
            <Select value={d.ccy} onValueChange={(v) => setD({ ...d, ccy: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["USD", "EUR", "GBP", "NGN", "ZAR", "KES"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Credit limit">
            <Input
              type="number"
              value={d.creditLimit}
              onChange={(e) => setD({ ...d, creditLimit: e.target.value })}
              placeholder="100000"
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="bg-primary" onClick={submit}>
            Add buyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
