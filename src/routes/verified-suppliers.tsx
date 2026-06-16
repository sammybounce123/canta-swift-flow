import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, MapPin, ShieldCheck, Star, Clock, FileText, Banknote, Factory,
  BadgeCheck, AlertTriangle, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { ImporterActions } from "@/components/ImporterActions";
import {
  SUPPLIERS, COUNTRIES_SUPPLIER, CATEGORIES, VERIFICATION_LEVELS, STATUS_TONE,
  type Supplier,
} from "@/lib/trade-network";

export const Route = createFileRoute("/verified-suppliers")({
  head: () => ({ meta: [{ title: "Verified Suppliers · Canta Trade Network" }] }),
  component: VerifiedSuppliersPage,
});

function VerifiedSuppliersPage() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("All");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState<string>("All");
  const [escrowOnly, setEscrowOnly] = useState(false);
  const [selected, setSelected] = useState<Supplier | null>(null);

  const list = useMemo(() => SUPPLIERS.filter((s) => {
    if (!s.discoverable) return false;
    if (country !== "All" && s.country !== country) return false;
    if (category !== "All" && !s.categories.includes(category)) return false;
    if (level !== "All" && s.status !== level) return false;
    if (escrowOnly && !s.escrowEligible) return false;
    if (q && !`${s.company} ${s.city} ${s.country}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, country, category, level, escrowOnly]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3 w-3" /> Canta Trade Network</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Verified Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-1">Discover screened suppliers across China, Turkey, UAE, India and more. Contact details are revealed only after both parties accept a trade request.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Verification request sent to Canta")}>
            <BadgeCheck className="h-4 w-4 mr-2" /> Ask Canta to verify a supplier
          </Button>
        </div>
      </header>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by company, city, country" className="pl-9" />
          </div>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>{COUNTRIES_SUPPLIER.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger><SelectValue placeholder="Verification" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All levels</SelectItem>
              {VERIFICATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={escrowOnly} onChange={(e) => setEscrowOnly(e.target.checked)} />
            <span>Escrow eligible only</span>
          </label>
          <span className="text-muted-foreground">{list.length} suppliers</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((s) => (
          <button key={s.id} onClick={() => setSelected(s)} className="text-left">
            <Card className="p-4 hover:shadow-card hover:-translate-y-0.5 transition h-full">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{s.company}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {s.city}, {s.country}
                  </div>
                </div>
                <Badge className={STATUS_TONE[s.status]}>{s.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {s.categories.slice(0,3).map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                <div><div className="text-muted-foreground">Rating</div><div className="font-semibold flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{s.rating}</div></div>
                <div><div className="text-muted-foreground">Done</div><div className="font-semibold">{s.completedTx}</div></div>
                <div><div className="text-muted-foreground">Reply</div><div className="font-semibold">{s.responseTimeHrs}h</div></div>
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-2">
                <Banknote className="h-3 w-3" /> Min ${s.minOrderUsd.toLocaleString()} · {s.currencies.join(", ")}
              </div>
            </Card>
          </button>
        ))}
      </div>

      <SupplierSheet supplier={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function SupplierSheet({ supplier, onClose }: { supplier: Supplier | null; onClose: () => void }) {
  const open = !!supplier;
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {supplier && (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle className="text-xl">{supplier.company}</SheetTitle>
                  <SheetDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {supplier.city}, {supplier.country}
                  </SheetDescription>
                </div>
                <Badge className={STATUS_TONE[supplier.status]}>{supplier.status}</Badge>
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <section>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Trust badges</div>
                <div className="flex flex-wrap gap-1.5">
                  {supplier.badges.map((b) => (
                    <Badge key={b} variant="outline" className="gap-1 text-[11px]">
                      <ShieldCheck className="h-3 w-3 text-success" /> {b}
                    </Badge>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Business reg." value={supplier.registration} icon={FileText} />
                <Stat label="Factory address" value={supplier.addressVerified ? "Verified" : "Not verified"} icon={Factory} />
                <Stat label="Bank account" value={supplier.bankVerified ? "Verified" : "Not verified"} icon={Banknote} />
                <Stat label="Canta transactions" value={String(supplier.completedTx)} icon={BadgeCheck} />
                <Stat label="Response time" value={`${supplier.responseTimeHrs}h avg`} icon={Clock} />
                <Stat label="Disputes" value={String(supplier.disputes)} icon={AlertTriangle} />
                <Stat label="Documents on file" value={String(supplier.documents)} icon={FileText} />
                <Stat label="Min order" value={`$${supplier.minOrderUsd.toLocaleString()}`} icon={Banknote} />
              </section>

              <section>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Categories & settlement</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {supplier.categories.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Settlement: {supplier.currencies.join(", ")} · Escrow {supplier.escrowEligible ? "eligible" : "not eligible"}
                </div>
              </section>

              <section className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground flex gap-2">
                <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                Full contact details, bank info and documents are released only after both parties accept a trade request.
              </section>

              <section className="grid grid-cols-2 gap-2">
                <Action label="Request Quote" icon={MessageSquare} onClick={() => toast.success("Quote request sent")} primary />
                <Action label="Start Trade File" icon={FilePlus} onClick={() => toast.success("Trade file created")} primary />
                <Action label="Request Escrow" icon={ShieldCheck} onClick={() => toast.success("Escrow requested")} />
                <Action label="Save Supplier" icon={Bookmark} onClick={() => toast.success("Supplier saved")} />
                <Action label="Ask Canta to verify" icon={BadgeCheck} onClick={() => toast.success("Verification requested")} />
                <Action label="Send Invoice to Canta" icon={FileText} onClick={() => toast.success("Invoice forwarded to Canta")} />
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileText }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}

function Action({ label, icon: Icon, onClick, primary }: { label: string; icon: typeof FileText; onClick: () => void; primary?: boolean }) {
  return (
    <Button variant={primary ? "default" : "outline"} size="sm" onClick={onClick} className="justify-start">
      <Icon className="h-4 w-4 mr-2" /> {label}
    </Button>
  );
}
