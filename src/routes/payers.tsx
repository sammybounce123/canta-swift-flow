import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { fmtMoney } from "@/lib/mock";
import { toast } from "sonner";
import { Users, Plus, Building2, ShieldCheck, Upload, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/payers")({
  head: () => ({ meta: [{ title: "Payers — Canta" }] }),
  component: PayersPage,
});

type PayStatus = "Paid" | "Pending" | "Failed" | "Refunded";
type MatchStatus = "Matched" | "Unmatched" | "Exception";
type Payer = {
  id: string; name: string; email: string; phone: string;
  reference: string; invoice: string; amount: number; ccy: string;
  status: PayStatus; match: MatchStatus; paidAt: string;
};

const SEED: Payer[] = [
  { id: "P-001", name: "Adaeze Okafor",  email: "adaeze@lagos.edu.ng",  phone: "+234 803 111 2233", reference: "STU-2024-001", invoice: "INV-9001", amount: 1_200, ccy: "USD", status: "Paid",    match: "Matched",   paidAt: "2026-06-10" },
  { id: "P-002", name: "Tunde Adeyemi",  email: "tunde@parents.ng",      phone: "+234 805 222 3344", reference: "STU-2024-002", invoice: "INV-9002", amount: 1_500, ccy: "USD", status: "Paid",    match: "Unmatched", paidAt: "2026-06-11" },
  { id: "P-003", name: "Sarah Mohammed", email: "sarah@donors.org",     phone: "+234 802 333 4455", reference: "DON-2024-018", invoice: "INV-9003", amount: 5_000, ccy: "GBP", status: "Pending", match: "Unmatched", paidAt: "—" },
  { id: "P-004", name: "Ibrahim Yusuf",  email: "ibrahim@yusuf.com",    phone: "+234 807 444 5566", reference: "STU-2024-003", invoice: "INV-9004", amount: 900,   ccy: "USD", status: "Paid",    match: "Exception", paidAt: "2026-06-09" },
  { id: "P-005", name: "Chinwe Eze",     email: "chinwe@eze.ng",        phone: "+234 809 555 6677", reference: "STU-2024-004", invoice: "INV-9005", amount: 1_800, ccy: "USD", status: "Failed",  match: "Exception", paidAt: "—" },
  { id: "P-006", name: "Mary Johnson",   email: "mary@johnson.com",     phone: "+1 415 666 7788",   reference: "DON-2024-019", invoice: "INV-9006", amount: 2_500, ccy: "USD", status: "Paid",    match: "Matched",   paidAt: "2026-06-12" },
];

const STATUS_TONES: Record<PayStatus, string> = {
  Paid:     "bg-success/15 text-success border-success/30",
  Pending:  "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Failed:   "bg-destructive/15 text-destructive border-destructive/30",
  Refunded: "bg-secondary text-secondary-foreground border-border",
};
const MATCH_TONES: Record<MatchStatus, string> = {
  Matched:   "bg-success/15 text-success border-success/30",
  Unmatched: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Exception: "bg-destructive/15 text-destructive border-destructive/30",
};

function PayersPage() {
  const [payers, setPayers] = useState<Payer[]>(SEED);
  const [tab, setTab] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    if (tab === "matched") return payers.filter((p) => p.match === "Matched");
    if (tab === "unmatched") return payers.filter((p) => p.match === "Unmatched");
    if (tab === "exceptions") return payers.filter((p) => p.match === "Exception");
    return payers;
  }, [payers, tab]);

  const updateMatch = (id: string, match: MatchStatus) => {
    setPayers(payers.map((p) => p.id === id ? { ...p, match } : p));
    toast.success(`Payer ${id} marked ${match}`);
  };
  const exportCsv = () => toast.success("Payer report exported (CSV)");

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Payer details are stored for reconciliation and audit." />
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Payers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage students, parents, donors and customers paying your organization.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
          <AddPayerDialog open={addOpen} setOpen={setAddOpen} onAdd={(p) => setPayers([p, ...payers])} />
        </div>
      </div>

      <MerchantProfileBlock />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Payments ({payers.length})</TabsTrigger>
          <TabsTrigger value="matched">Matched ({payers.filter((p) => p.match === "Matched").length})</TabsTrigger>
          <TabsTrigger value="unmatched">Unmatched ({payers.filter((p) => p.match === "Unmatched").length})</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions ({payers.filter((p) => p.match === "Exception").length})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <PayersTable payers={filtered} onMatch={updateMatch} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PayersTable({ payers, onMatch }: { payers: Payer[]; onMatch: (id: string, m: MatchStatus) => void }) {
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
            <th className="px-4 py-3">Payer</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Invoice</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Match</th>
            <th className="px-4 py-3">Date paid</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {payers.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-xs"><div>{p.email}</div><div className="text-muted-foreground">{p.phone}</div></td>
                <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.invoice}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(p.amount, p.ccy)}</td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_TONES[p.status]}`}>{p.status}</span></td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${MATCH_TONES[p.match]}`}>{p.match}</span></td>
                <td className="px-4 py-3 text-xs">{p.paidAt}</td>
                <td className="px-4 py-3 text-right">
                  {p.match !== "Matched"
                    ? <Button size="sm" variant="outline" onClick={() => onMatch(p.id, "Matched")}>Match</Button>
                    : <Button size="sm" variant="ghost" onClick={() => toast.success("Receipt sent")}>Receipt</Button>}
                </td>
              </tr>
            ))}
            {payers.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-xs text-muted-foreground">No payers in this view.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AddPayerDialog({ open, setOpen, onAdd }: { open: boolean; setOpen: (o: boolean) => void; onAdd: (p: Payer) => void }) {
  const [d, setD] = useState({ name: "", email: "", phone: "", reference: "", invoice: "", amount: "", ccy: "USD" });
  const submit = () => {
    if (!d.name || !d.reference) { toast.error("Name and reference are required"); return; }
    onAdd({
      id: `P-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: d.name, email: d.email, phone: d.phone,
      reference: d.reference, invoice: d.invoice || "—",
      amount: Number(d.amount) || 0, ccy: d.ccy,
      status: "Pending", match: "Unmatched", paidAt: "—",
    });
    setOpen(false);
    setD({ name: "", email: "", phone: "", reference: "", invoice: "", amount: "", ccy: "USD" });
    toast.success("Payer added");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> Add payer</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add payer</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name"><Input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></Field>
          <Field label="Email"><Input value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} /></Field>
          <Field label="Phone"><Input value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value })} /></Field>
          <Field label="Payment reference"><Input value={d.reference} onChange={(e) => setD({ ...d, reference: e.target.value })} /></Field>
          <Field label="Invoice"><Input value={d.invoice} onChange={(e) => setD({ ...d, invoice: e.target.value })} /></Field>
          <Field label="Amount"><Input type="number" value={d.amount} onChange={(e) => setD({ ...d, amount: e.target.value })} /></Field>
          <Field label="Currency">
            <Select value={d.ccy} onValueChange={(v) => setD({ ...d, ccy: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["USD", "GBP", "EUR", "NGN"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button className="bg-primary" onClick={submit}>Add payer</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label><div className="mt-1">{children}</div></div>;
}

// ===== Merchant Profile + KYB =====
type KybStatus = "Not Started" | "In Progress" | "Submitted" | "Approved" | "Rejected" | "More Info Required";
const KYB_TONES: Record<KybStatus, string> = {
  "Not Started":        "bg-secondary text-secondary-foreground border-border",
  "In Progress":        "bg-amber-500/15 text-amber-700 border-amber-500/30",
  "Submitted":          "bg-blue-500/15 text-blue-700 border-blue-500/30",
  "Approved":           "bg-success/15 text-success border-success/30",
  "Rejected":           "bg-destructive/15 text-destructive border-destructive/30",
  "More Info Required": "bg-warning/15 text-warning border-warning/30",
};

function MerchantProfileBlock() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    org: "University of Lagos",
    type: "Higher Education",
    country: "Nigeria",
    contact: "Bursar's Office",
    email: "bursar@unilag.edu.ng",
    settlement: "NGN · GTB ••••2210",
  });
  const [kyb, setKyb] = useState<KybStatus>("Approved");
  const [docs, setDocs] = useState([
    { name: "Certificate of Incorporation", uploaded: true },
    { name: "Tax Identification", uploaded: true },
    { name: "Director ID", uploaded: true },
    { name: "Bank account proof", uploaded: true },
    { name: "Proof of regulatory licence", uploaded: false },
  ]);
  const upload = (i: number) => { setDocs(docs.map((d, j) => j === i ? { ...d, uploaded: true } : d)); toast.success("Document uploaded"); };
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="p-5 shadow-card lg:col-span-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center"><Building2 className="h-6 w-6 text-primary" /></div>
            <div>
              <div className="font-semibold">{profile.org}</div>
              <div className="text-xs text-muted-foreground">{profile.type} · {profile.country}</div>
            </div>
          </div>
          {!editing
            ? <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit profile</Button>
            : <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button><Button size="sm" className="bg-primary" onClick={() => { setEditing(false); toast.success("Merchant profile saved"); }}>Save</Button></div>}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
          {!editing ? (
            <>
              <Info label="Organization name" value={profile.org} />
              <Info label="Merchant type" value={profile.type} />
              <Info label="Country" value={profile.country} />
              <Info label="Contact person" value={profile.contact} />
              <Info label="Email" value={profile.email} />
              <Info label="Settlement currency" value={profile.settlement} />
            </>
          ) : (
            <>
              <Field label="Organization name"><Input value={profile.org} onChange={(e) => setProfile({ ...profile, org: e.target.value })} /></Field>
              <Field label="Merchant type"><Input value={profile.type} onChange={(e) => setProfile({ ...profile, type: e.target.value })} /></Field>
              <Field label="Country"><Input value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} /></Field>
              <Field label="Contact person"><Input value={profile.contact} onChange={(e) => setProfile({ ...profile, contact: e.target.value })} /></Field>
              <Field label="Email"><Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></Field>
              <Field label="Settlement currency"><Input value={profile.settlement} onChange={(e) => setProfile({ ...profile, settlement: e.target.value })} /></Field>
            </>
          )}
        </div>
      </Card>
      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> KYB</div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${KYB_TONES[kyb]}`}>{kyb}</span>
        </div>
        <Select value={kyb} onValueChange={(v) => setKyb(v as KybStatus)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.keys(KYB_TONES).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <div className="mt-3 space-y-2">
          {docs.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                {d.uploaded ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                {d.name}
              </span>
              <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => upload(i)}><Upload className="h-3 w-3 mr-1" /> {d.uploaded ? "Replace" : "Upload"}</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div><div className="mt-0.5">{value}</div></div>;
}
