import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users, Plus, Search, Phone, Mail, MapPin, FileText, Receipt, Ship, MessageCircle,
  Edit3, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — Canta Freight" }] }),
  component: CustomersPage,
});

type CustomerStatus =
  | "Active"
  | "Pending Documents"
  | "Has Active Shipment"
  | "Has Outstanding Invoice"
  | "Inactive";

type Customer = {
  id: string;
  customerName: string;
  businessName: string;
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
  category: string;
  route: string;
  staff: string;
  status: CustomerStatus;
};

const SEED: Customer[] = [
  { id: "CUS-001", customerName: "Aisha Bello",      businessName: "Bello Electronics",   phone: "+234 803 110 2200", whatsapp: "+234 803 110 2200", email: "aisha@belloelec.ng",  location: "Lagos, Nigeria",  category: "Electronics", route: "China → Lagos",  staff: "Tunde B.",  status: "Has Active Shipment" },
  { id: "CUS-002", customerName: "Kwame Mensah",     businessName: "Mensah Imports",      phone: "+233 24 555 8821",  whatsapp: "+233 24 555 8821",  email: "kwame@mensah.gh",     location: "Accra, Ghana",    category: "Apparel",     route: "Turkey → Tema",  staff: "Aisha B.",  status: "Active" },
  { id: "CUS-003", customerName: "Chinedu Okafor",   businessName: "Okafor Auto Parts",   phone: "+234 802 770 4411", whatsapp: "+234 802 770 4411", email: "chinedu@okafor.ng",   location: "Onitsha, Nigeria",category: "Auto parts",  route: "Dubai → Lagos",  staff: "Tunde B.",  status: "Has Outstanding Invoice" },
  { id: "CUS-004", customerName: "Linda Achieng",    businessName: "Achieng Textiles",    phone: "+254 712 998 110",  whatsapp: "+254 712 998 110",  email: "linda@achieng.ke",    location: "Nairobi, Kenya",  category: "Textiles",    route: "China → Mombasa",staff: "Ops Team",  status: "Pending Documents" },
  { id: "CUS-005", customerName: "Femi Adekunle",    businessName: "Adekunle Hardware",   phone: "+234 705 222 4400", whatsapp: "+234 705 222 4400", email: "femi@adekunle.ng",    location: "Ibadan, Nigeria", category: "Hardware",    route: "China → Lagos",  staff: "Adaeze O.", status: "Inactive" },
];

const KEY = "canta:freight:customers:v1";

const STATUS_TONE: Record<CustomerStatus, string> = {
  "Active": "bg-success/15 text-success border-success/30",
  "Pending Documents": "bg-amber-500/15 text-amber-700 border-amber-500/30",
  "Has Active Shipment": "bg-primary/15 text-primary border-primary/30",
  "Has Outstanding Invoice": "bg-destructive/15 text-destructive border-destructive/30",
  "Inactive": "bg-muted text-muted-foreground",
};

function CustomersPage() {
  const [list, setList] = useState<Customer[]>(SEED);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | CustomerStatus>("All");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Customer | null>(null);
  const [view, setView] = useState<Customer | null>(null);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setList(JSON.parse(raw)); } catch { /* noop */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* noop */ }
  }, [list]);

  const filtered = useMemo(() =>
    list.filter((c) =>
      (statusFilter === "All" || c.status === statusFilter) &&
      (!q || [c.customerName, c.businessName, c.phone, c.email, c.location].some((v) => v.toLowerCase().includes(q.toLowerCase())))
    ),
    [list, q, statusFilter],
  );

  const stats = useMemo(() => ({
    total: list.length,
    active: list.filter((c) => c.status === "Active" || c.status === "Has Active Shipment").length,
    pending: list.filter((c) => c.status === "Pending Documents").length,
    outstanding: list.filter((c) => c.status === "Has Outstanding Invoice").length,
  }), [list]);

  function handleSave(data: Omit<Customer, "id">, id?: string) {
    if (id) {
      setList((cur) => cur.map((c) => (c.id === id ? { ...c, ...data } : c)));
      toast.success(`${data.customerName} updated`);
    } else {
      const newId = `CUS-${String(list.length + 1).padStart(3, "0")}`;
      setList((cur) => [{ id: newId, ...data }, ...cur]);
      toast.success(`Customer record created · ${newId}`);
    }
    setOpen(false);
    setEdit(null);
  }

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="WhatsApp updates should match the latest shipment status and available documents." />
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-primary shrink-0" /> Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Create and manage customer records for your importer clients — shipments, invoices, documents and WhatsApp updates.
          </p>
        </div>
        <Dialog open={open || !!edit} onOpenChange={(o) => { if (!o) { setOpen(false); setEdit(null); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEdit(null); setOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Customer
            </Button>
          </DialogTrigger>
          <CustomerDialog
            initial={edit ?? undefined}
            onSubmit={(d) => handleSave(d, edit?.id)}
            onClose={() => { setOpen(false); setEdit(null); }}
          />
        </Dialog>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total customers" value={String(stats.total)} />
        <Stat label="Active" value={String(stats.active)} tone="text-success" />
        <Stat label="Pending docs" value={String(stats.pending)} tone="text-amber-600" />
        <Stat label="Outstanding invoices" value={String(stats.outstanding)} tone="text-destructive" />
      </div>

      <Card className="p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, business, phone or email..." className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {(Object.keys(STATUS_TONE) as CustomerStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="hidden md:block shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Market / Route</th>
                <th className="px-4 py-3">Goods</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.customerName}</div>
                    <div className="text-[11px] text-muted-foreground">{c.businessName} · {c.id}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{c.phone}</div>
                    <div className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{c.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" />{c.location}</div>
                    <div className="text-muted-foreground">{c.route}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{c.category}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.staff}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${STATUS_TONE[c.status]}`}>{c.status}</Badge></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => setView(c)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEdit(c)}><Edit3 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No customers match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {filtered.map((c) => (
          <Card key={c.id} className="p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium">{c.customerName}</div>
                <div className="text-[11px] text-muted-foreground">{c.businessName} · {c.id}</div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${STATUS_TONE[c.status]}`}>{c.status}</Badge>
            </div>
            <div className="text-xs mt-2 space-y-0.5 text-muted-foreground">
              <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</div>
              <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</div>
              <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location} · {c.route}</div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setView(c)}><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setEdit(c)}><Edit3 className="h-3.5 w-3.5 mr-1" /> Edit</Button>
            </div>
          </Card>
        ))}
      </div>

      {view && (
        <Dialog open={true} onOpenChange={(o) => !o && setView(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{view.customerName} <span className="text-xs text-muted-foreground font-normal">· {view.id}</span></DialogTitle>
            </DialogHeader>
            <div className="text-xs text-muted-foreground">{view.businessName} — {view.location}</div>
            <Tabs defaultValue="profile">
              <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="shipments"><Ship className="h-3.5 w-3.5 mr-1" /> Shipments</TabsTrigger>
                <TabsTrigger value="invoices"><Receipt className="h-3.5 w-3.5 mr-1" /> Invoices</TabsTrigger>
                <TabsTrigger value="documents"><FileText className="h-3.5 w-3.5 mr-1" /> Documents</TabsTrigger>
                <TabsTrigger value="whatsapp"><MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="text-sm space-y-1 mt-3">
                <Row k="Phone" v={view.phone} />
                <Row k="WhatsApp" v={view.whatsapp} />
                <Row k="Email" v={view.email} />
                <Row k="Goods category" v={view.category} />
                <Row k="Preferred route" v={view.route} />
                <Row k="Assigned staff" v={view.staff} />
                <Row k="Status" v={view.status} />
              </TabsContent>
              <TabsContent value="shipments" className="text-sm mt-3">
                <EmptyTab label="No shipments linked yet." action={() => toast.success("Create new shipment")} cta="New shipment" />
              </TabsContent>
              <TabsContent value="invoices" className="text-sm mt-3">
                <EmptyTab label="No invoices on file." action={() => toast.success("Invoice created")} cta="New invoice" />
              </TabsContent>
              <TabsContent value="documents" className="text-sm mt-3">
                <EmptyTab label="No documents uploaded." action={() => toast.success("Upload dialog opened")} cta="Upload document" />
              </TabsContent>
              <TabsContent value="whatsapp" className="text-sm mt-3">
                <EmptyTab label="No WhatsApp updates yet." action={() => toast.success(`Message sent to ${view.whatsapp}`)} cta="Send update" />
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEdit(view); setView(null); }}><Edit3 className="h-4 w-4 mr-1.5" /> Edit profile</Button>
              <Button onClick={() => setView(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/40 py-1.5">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function EmptyTab({ label, action, cta }: { label: string; action: () => void; cta: string }) {
  return (
    <div className="text-center text-muted-foreground py-6 border border-dashed rounded-lg">
      <div className="text-sm mb-2">{label}</div>
      <Button size="sm" variant="outline" onClick={action}>{cta}</Button>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="p-4 shadow-card">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold tabular-nums mt-1 ${tone ?? ""}`}>{value}</div>
    </Card>
  );
}

function CustomerDialog({
  initial, onSubmit, onClose,
}: {
  initial?: Customer;
  onSubmit: (d: Omit<Customer, "id">) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState<Omit<Customer, "id">>(() => ({
    customerName: initial?.customerName ?? "",
    businessName: initial?.businessName ?? "",
    phone: initial?.phone ?? "",
    whatsapp: initial?.whatsapp ?? "",
    email: initial?.email ?? "",
    location: initial?.location ?? "",
    category: initial?.category ?? "",
    route: initial?.route ?? "",
    staff: initial?.staff ?? "",
    status: initial?.status ?? "Active",
  }));
  const set = <K extends keyof typeof f>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value as typeof f[K] }));
  const submit = () => {
    if (!f.customerName.trim()) { toast.error("Customer name is required"); return; }
    onSubmit(f);
  };
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle>{initial ? "Edit customer" : "Create customer record"}</DialogTitle></DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><Label>Customer name *</Label><Input value={f.customerName} onChange={set("customerName")} placeholder="Aisha Bello" /></div>
        <div><Label>Business name</Label><Input value={f.businessName} onChange={set("businessName")} placeholder="Bello Electronics" /></div>
        <div><Label>Phone</Label><Input value={f.phone} onChange={set("phone")} placeholder="+234..." /></div>
        <div><Label>WhatsApp</Label><Input value={f.whatsapp} onChange={set("whatsapp")} placeholder="+234..." /></div>
        <div className="sm:col-span-2"><Label>Email</Label><Input value={f.email} onChange={set("email")} placeholder="contact@business.com" /></div>
        <div><Label>Market / Location</Label><Input value={f.location} onChange={set("location")} placeholder="Lagos, Nigeria" /></div>
        <div><Label>Goods category</Label><Input value={f.category} onChange={set("category")} placeholder="Electronics" /></div>
        <div><Label>Preferred route</Label><Input value={f.route} onChange={set("route")} placeholder="China → Lagos" /></div>
        <div><Label>Assigned staff</Label><Input value={f.staff} onChange={set("staff")} placeholder="Tunde B." /></div>
        <div className="sm:col-span-2">
          <Label>Status</Label>
          <Select value={f.status} onValueChange={(v) => setF((s) => ({ ...s, status: v as CustomerStatus }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{(Object.keys(STATUS_TONE) as CustomerStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={submit}>{initial ? "Save changes" : "Create customer"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
