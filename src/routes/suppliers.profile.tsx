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
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Factory, Edit3, Plus, Upload, ShieldCheck, Award, CheckCircle2, AlertCircle, X,
} from "lucide-react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/suppliers/profile")({
  head: () => ({ meta: [{ title: "Supplier Profile — Canta" }] }),
  component: SupplierProfilePage,
});

type Profile = {
  companyName: string; country: string; city: string;
  contactPerson: string; email: string; phone: string;
  productCategories: string[];
  minOrderSize: string;
  settlementCurrencies: string[];
  registration: "Verified" | "Pending" | "Not started";
  bank: "Verified" | "Pending" | "Not started";
  facility: "Verified" | "Pending" | "Not started";
  documents: { name: string; uploadedAt: string }[];
};

const DEFAULT: Profile = {
  companyName: "Yiwu Fashion Co.",
  country: "China",
  city: "Yiwu",
  contactPerson: "Mei Lin",
  email: "mei@yiwufashion.cn",
  phone: "+86 579 0001",
  productCategories: ["Apparel", "Accessories"],
  minOrderSize: "USD 5,000",
  settlementCurrencies: ["USD", "RMB"],
  registration: "Verified",
  bank: "Verified",
  facility: "Pending",
  documents: [
    { name: "Business License.pdf", uploadedAt: "2026-04-12" },
    { name: "Factory Photos.zip",   uploadedAt: "2026-04-12" },
  ],
};

const KEY = "canta:supplier:profile:v1";

function load(): Profile {
  if (typeof window === "undefined") return DEFAULT;
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : DEFAULT; } catch { return DEFAULT; }
}

function tone(s: Profile["registration"]) {
  if (s === "Verified") return "bg-success/15 text-success border-success/30";
  if (s === "Pending") return "bg-amber-500/15 text-amber-700 border-amber-500/30";
  return "bg-muted text-muted-foreground";
}

function SupplierProfilePage() {
  const [p, setP] = useState<Profile>(DEFAULT);
  const [editOpen, setEditOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);

  useEffect(() => { setP(load()); }, []);
  function save(next: Profile) {
    setP(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
  }

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Complete profile information helps buyers trust your business." />
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary shrink-0" /> Supplier Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View, edit and manage your supplier identity, documents and verification status.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}><Edit3 className="h-4 w-4 mr-1.5" /> Edit profile</Button>
          <Button variant="outline" onClick={() => setCatOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Add category</Button>
          <Button variant="outline" onClick={() => setDocOpen(true)}><Upload className="h-4 w-4 mr-1.5" /> Upload document</Button>
          <Button asChild><Link to="/suppliers/kyb"><ShieldCheck className="h-4 w-4 mr-1.5" /> Request review</Link></Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <Card className="p-5 shadow-card space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Company</div>
            <div className="text-xl font-semibold">{p.companyName}</div>
            <div className="text-xs text-muted-foreground">{p.city}, {p.country}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Field k="Contact person" v={p.contactPerson} />
            <Field k="Email" v={p.email} />
            <Field k="Phone" v={p.phone} />
            <Field k="Minimum order size" v={p.minOrderSize} />
            <Field k="Settlement currencies" v={p.settlementCurrencies.join(", ")} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Product categories</div>
            <div className="flex flex-wrap gap-1.5">
              {p.productCategories.map((c) => (
                <Badge key={c} variant="outline" className="text-xs">
                  {c}
                  <button
                    className="ml-1 opacity-60 hover:opacity-100"
                    onClick={() => save({ ...p, productCategories: p.productCategories.filter((x) => x !== c) })}
                    aria-label={`Remove ${c}`}
                  ><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-card space-y-3">
          <div className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Verification & Trust</div>
          <Verify k="Business registration" v={p.registration} />
          <Verify k="Bank account" v={p.bank} />
          <Verify k="Factory / warehouse" v={p.facility} />
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-1">Trust badges</div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs"><Award className="h-3 w-3 mr-1" /> Canta Verified</Badge>
              <Badge variant="outline" className="text-xs">Trade-ready</Badge>
              <Badge variant="outline" className="text-xs">Escrow-ready</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Documents on file</div>
          <Button size="sm" variant="outline" onClick={() => setDocOpen(true)}><Upload className="h-4 w-4 mr-1.5" /> Upload</Button>
        </div>
        {p.documents.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">No documents on file.</div>
        ) : (
          <div className="space-y-2">
            {p.documents.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm border-b border-border/40 py-2">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground">Uploaded {d.uploadedAt}</div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-success/15 text-success border-success/30"><CheckCircle2 className="h-3 w-3 mr-1" /> On file</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <EditDialog open={editOpen} onClose={() => setEditOpen(false)} profile={p} onSave={(next) => { save(next); setEditOpen(false); toast.success("Supplier profile updated successfully."); }} />
      <AddCategoryDialog open={catOpen} onClose={() => setCatOpen(false)} onAdd={(v) => { save({ ...p, productCategories: [...p.productCategories, v] }); setCatOpen(false); toast.success(`Category added: ${v}`); }} />
      <UploadDocDialog open={docOpen} onClose={() => setDocOpen(false)} onUpload={(name) => { save({ ...p, documents: [{ name, uploadedAt: new Date().toISOString().slice(0, 10) }, ...p.documents] }); setDocOpen(false); toast.success(`${name} uploaded`); }} />
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

function Verify({ k, v }: { k: string; v: Profile["registration"] }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{k}</span>
      <Badge variant="outline" className={`text-[10px] ${tone(v)}`}>
        {v === "Verified" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />} {v}
      </Badge>
    </div>
  );
}

function EditDialog({ open, onClose, profile, onSave }: { open: boolean; onClose: () => void; profile: Profile; onSave: (p: Profile) => void }) {
  const [f, setF] = useState(profile);
  useEffect(() => { setF(profile); }, [profile, open]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Edit supplier profile</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><Label>Company name</Label><Input value={f.companyName} onChange={(e) => setF({ ...f, companyName: e.target.value })} /></div>
          <div><Label>Country</Label><Input value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} /></div>
          <div><Label>City</Label><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></div>
          <div><Label>Contact person</Label><Input value={f.contactPerson} onChange={(e) => setF({ ...f, contactPerson: e.target.value })} /></div>
          <div><Label>Email</Label><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><Label>Minimum order size</Label><Input value={f.minOrderSize} onChange={(e) => setF({ ...f, minOrderSize: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Settlement currencies (comma separated)</Label><Input value={f.settlementCurrencies.join(", ")} onChange={(e) => setF({ ...f, settlementCurrencies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(f)}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCategoryDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (v: string) => void }) {
  const [v, setV] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Add product category</DialogTitle></DialogHeader>
        <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="e.g. Footwear" />
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (!v.trim()) { toast.error("Enter a category"); return; } onAdd(v.trim()); setV(""); }}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadDocDialog({ open, onClose, onUpload }: { open: boolean; onClose: () => void; onUpload: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Upload document</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) setName(f.name); }} />
          {name && <div className="text-[11px] text-muted-foreground">{name}</div>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (!name) { toast.error("Choose a file"); return; } onUpload(name); setName(""); }}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
