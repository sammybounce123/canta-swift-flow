import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2, Edit3, Upload, Wallet, ShieldCheck, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/merchant/profile")({
  head: () => ({ meta: [{ title: "Merchant Profile — Canta" }] }),
  component: MerchantProfilePage,
});

type Merchant = {
  organizationName: string;
  merchantType: string;
  country: string;
  contactPerson: string;
  email: string;
  phone: string;
  settlementCurrency: string;
  useCases: string[];
  documents: { name: string; uploadedAt: string }[];
  kybStatus: "Approved" | "Submitted" | "In Progress" | "Not Started";
  payoutAccount: { bank: string; account: string; ccy: string };
  createdAt: string;
  accountStatus: "Active" | "Suspended" | "Closed";
};

const DEFAULT: Merchant = {
  organizationName: "Canta Demo Merchant Ltd",
  merchantType: "Business",
  country: "Nigeria",
  contactPerson: "Aisha Bello",
  email: "aisha@canta-demo.com",
  phone: "+234 803 110 2200",
  settlementCurrency: "USD",
  useCases: ["E-commerce", "B2B exports", "Marketplace settlements"],
  documents: [
    { name: "Certificate of Incorporation.pdf", uploadedAt: "2026-03-02" },
    { name: "TIN Document.pdf", uploadedAt: "2026-03-02" },
  ],
  kybStatus: "Approved",
  payoutAccount: { bank: "GTBank", account: "•••• 4421", ccy: "NGN" },
  createdAt: "2026-03-02",
  accountStatus: "Active",
};

const KEY = "canta:merchant:profile:v1";

function load(): Merchant {
  if (typeof window === "undefined") return DEFAULT;
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : DEFAULT; } catch { return DEFAULT; }
}

function MerchantProfilePage() {
  const [m, setM] = useState<Merchant>(DEFAULT);
  const [editOpen, setEditOpen] = useState(false);
  const [ccyOpen, setCcyOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);

  useEffect(() => { setM(load()); }, []);
  function save(next: Merchant) { setM(next); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ } }

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary shrink-0" /> Merchant Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">View, edit and manage your merchant identity, payout account and KYB status.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}><Edit3 className="h-4 w-4 mr-1.5" /> Edit profile</Button>
          <Button variant="outline" onClick={() => setCcyOpen(true)}>Update settlement currency</Button>
          <Button variant="outline" onClick={() => setPayoutOpen(true)}><Wallet className="h-4 w-4 mr-1.5" /> Manage payout account</Button>
          <Button variant="outline" onClick={() => setDocOpen(true)}><Upload className="h-4 w-4 mr-1.5" /> Upload document</Button>
          <Button asChild><Link to="/merchant/kyb"><ShieldCheck className="h-4 w-4 mr-1.5" /> View KYB</Link></Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <Card className="p-5 shadow-card space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Organization</div>
            <div className="text-xl font-semibold">{m.organizationName}</div>
            <div className="text-xs text-muted-foreground">{m.merchantType} · {m.country}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Field k="Contact person" v={m.contactPerson} />
            <Field k="Email" v={m.email} />
            <Field k="Phone" v={m.phone} />
            <Field k="Settlement currency" v={m.settlementCurrency} />
            <Field k="Created" v={m.createdAt} />
            <Field k="Account status" v={m.accountStatus} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Collection use cases</div>
            <div className="flex flex-wrap gap-1.5">
              {m.useCases.map((u) => <Badge key={u} variant="outline" className="text-xs">{u}</Badge>)}
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-card space-y-3">
          <div className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> KYB</div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" /> {m.kybStatus}</Badge>
          </div>
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">Default payout</div>
            <div className="text-sm font-medium">{m.payoutAccount.bank} · {m.payoutAccount.account} ({m.payoutAccount.ccy})</div>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full"><Link to="/merchant/kyb">Manage KYB</Link></Button>
        </Card>
      </div>

      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Business documents</div>
          <Button size="sm" variant="outline" onClick={() => setDocOpen(true)}><Upload className="h-4 w-4 mr-1.5" /> Upload</Button>
        </div>
        {m.documents.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">No documents yet.</div>
        ) : (
          <div className="space-y-2">
            {m.documents.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm border-b border-border/40 py-2">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground">Uploaded {d.uploadedAt}</div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-success/15 text-success border-success/30">On file</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <EditDialog open={editOpen} onClose={() => setEditOpen(false)} merchant={m} onSave={(next) => { save(next); setEditOpen(false); toast.success("Merchant profile updated successfully."); }} />
      <CcyDialog open={ccyOpen} onClose={() => setCcyOpen(false)} current={m.settlementCurrency} onSave={(v) => { save({ ...m, settlementCurrency: v }); setCcyOpen(false); toast.success(`Settlement currency set to ${v}`); }} />
      <PayoutDialog open={payoutOpen} onClose={() => setPayoutOpen(false)} current={m.payoutAccount} onSave={(p) => { save({ ...m, payoutAccount: p }); setPayoutOpen(false); toast.success("Payout account updated"); }} />
      <UploadDialog open={docOpen} onClose={() => setDocOpen(false)} onUpload={(name) => { save({ ...m, documents: [{ name, uploadedAt: new Date().toISOString().slice(0, 10) }, ...m.documents] }); setDocOpen(false); toast.success(`${name} uploaded`); }} />
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="text-sm font-medium">{v}</div>
    </div>
  );
}

function EditDialog({ open, onClose, merchant, onSave }: { open: boolean; onClose: () => void; merchant: Merchant; onSave: (m: Merchant) => void }) {
  const [f, setF] = useState(merchant);
  useEffect(() => { setF(merchant); }, [merchant, open]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Edit merchant profile</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><Label>Organization name</Label><Input value={f.organizationName} onChange={(e) => setF({ ...f, organizationName: e.target.value })} /></div>
          <div><Label>Merchant type</Label><Input value={f.merchantType} onChange={(e) => setF({ ...f, merchantType: e.target.value })} /></div>
          <div><Label>Country</Label><Input value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} /></div>
          <div><Label>Contact person</Label><Input value={f.contactPerson} onChange={(e) => setF({ ...f, contactPerson: e.target.value })} /></div>
          <div><Label>Email</Label><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Collection use cases (comma separated)</Label><Input value={f.useCases.join(", ")} onChange={(e) => setF({ ...f, useCases: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(f)}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CcyDialog({ open, onClose, current, onSave }: { open: boolean; onClose: () => void; current: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(current);
  useEffect(() => { setV(current); }, [current, open]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Settlement currency</DialogTitle></DialogHeader>
        <Select value={v} onValueChange={setV}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["USD", "EUR", "GBP", "NGN", "GHS", "KES"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(v)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PayoutDialog({ open, onClose, current, onSave }: { open: boolean; onClose: () => void; current: Merchant["payoutAccount"]; onSave: (p: Merchant["payoutAccount"]) => void }) {
  const [f, setF] = useState(current);
  useEffect(() => { setF(current); }, [current, open]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Manage payout account</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <div><Label>Bank</Label><Input value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} /></div>
          <div><Label>Account</Label><Input value={f.account} onChange={(e) => setF({ ...f, account: e.target.value })} /></div>
          <div><Label>Currency</Label><Input value={f.ccy} onChange={(e) => setF({ ...f, ccy: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(f)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadDialog({ open, onClose, onUpload }: { open: boolean; onClose: () => void; onUpload: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Upload document</DialogTitle></DialogHeader>
        <Input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) setName(f.name); }} />
        {name && <div className="text-[11px] text-muted-foreground">{name}</div>}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (!name) { toast.error("Choose a file"); return; } onUpload(name); setName(""); }}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
