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
  Search, MapPin, ShieldCheck, FileText, Banknote, BadgeCheck, AlertTriangle,
  MessageSquare, FilePlus, Lock, TrendingUp, Globe, Send, UserPlus, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { BUYERS, COUNTRIES_BUYER, CATEGORIES, VERIFICATION_LEVELS, STATUS_TONE, type Buyer } from "@/lib/trade-network";

export const Route = createFileRoute("/verified-buyers")({
  head: () => ({ meta: [{ title: "Verified Buyers · Canta Trade Network" }] }),
  component: VerifiedBuyersPage,
});

function VerifiedBuyersPage() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("All");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [selected, setSelected] = useState<Buyer | null>(null);

  const list = useMemo(() => BUYERS.filter((b) => {
    if (!b.discoverable) return false;
    if (country !== "All" && b.country !== country) return false;
    if (category !== "All" && !b.interests.includes(category)) return false;
    if (level !== "All" && b.status !== level) return false;
    if (q && !`${b.name} ${b.city} ${b.country}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, country, category, level]);

  return (
    <div className="space-y-6">
      <header>
        <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3 w-3" /> Canta Trade Network</Badge>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Verified African Buyers</h1>
        <p className="text-sm text-muted-foreground mt-1">Only buyers who opted in to discovery are shown. Reach out through Canta — full contact info is shared once both parties accept a trade request.</p>
      </header>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, city, country" className="pl-9" />
          </div>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>{COUNTRIES_BUYER.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Interest" /></SelectTrigger>
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
        <div className="text-xs text-muted-foreground mt-3">{list.length} buyers</div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((b) => (
          <button key={b.id} onClick={() => setSelected(b)} className="text-left">
            <Card className="p-4 hover:shadow-card hover:-translate-y-0.5 transition h-full">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{b.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {b.city}, {b.country}
                  </div>
                </div>
                <Badge className={STATUS_TONE[b.status]}>{b.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {b.interests.slice(0,3).map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                <div><div className="text-muted-foreground">Pay score</div><div className="font-semibold">{b.paymentScore}</div></div>
                <div><div className="text-muted-foreground">Done</div><div className="font-semibold">{b.completedTx}</div></div>
                <div><div className="text-muted-foreground">Escrow</div><div className="font-semibold">{b.escrowHistory}</div></div>
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-2">
                <Wallet className="h-3 w-3" /> ${b.avgOrderUsd[0].toLocaleString()}–${b.avgOrderUsd[1].toLocaleString()}
              </div>
            </Card>
          </button>
        ))}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <SheetTitle className="text-xl">{selected.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {selected.city}, {selected.country}
                    </SheetDescription>
                  </div>
                  <Badge className={STATUS_TONE[selected.status]}>{selected.status}</Badge>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <section>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Trust badges</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.badges.map((b) => (
                      <Badge key={b} variant="outline" className="gap-1 text-[11px]">
                        <ShieldCheck className="h-3 w-3 text-success" /> {b}
                      </Badge>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-3">
                  <StatBox label="Trade history" value={`${selected.tradeHistory} deals`} icon={TrendingUp} />
                  <StatBox label="Payment score" value={`${selected.paymentScore}/100`} icon={BadgeCheck} />
                  <StatBox label="Completed tx" value={String(selected.completedTx)} icon={FileText} />
                  <StatBox label="Avg order" value={`$${selected.avgOrderUsd[0].toLocaleString()}–${selected.avgOrderUsd[1].toLocaleString()}`} icon={Banknote} />
                  <StatBox label="Escrow history" value={String(selected.escrowHistory)} icon={ShieldCheck} />
                  <StatBox label="Disputes" value={String(selected.disputes)} icon={AlertTriangle} />
                </section>

                <section>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Globe className="h-3 w-3" /> Preferred corridors</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.corridors.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
                  </div>
                </section>

                <section className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground flex gap-2">
                  <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                  Buyer's contact details and registration documents are released only after the buyer accepts your quote or trade invitation.
                </section>

                <section className="grid grid-cols-2 gap-2">
                  <ActionBtn label="Send Quotation" icon={Send} onClick={() => toast.success("Quotation sent")} primary />
                  <ActionBtn label="Create Invoice" icon={FilePlus} onClick={() => toast.success("Invoice drafted")} primary />
                  <ActionBtn label="Invite to Trade File" icon={UserPlus} onClick={() => toast.success("Trade file invitation sent")} />
                  <ActionBtn label="Request Proof of Funds" icon={Wallet} onClick={() => toast.success("Request sent to buyer")} />
                  <ActionBtn label="Offer Escrow Terms" icon={ShieldCheck} onClick={() => toast.success("Escrow offer queued")} />
                  <ActionBtn label="Message via Canta" icon={MessageSquare} onClick={() => toast.success("Message thread opened")} />
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StatBox({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileText }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}

function ActionBtn({ label, icon: Icon, onClick, primary }: { label: string; icon: typeof FileText; onClick: () => void; primary?: boolean }) {
  return (
    <Button variant={primary ? "default" : "outline"} size="sm" onClick={onClick} className="justify-start">
      <Icon className="h-4 w-4 mr-2" /> {label}
    </Button>
  );
}
