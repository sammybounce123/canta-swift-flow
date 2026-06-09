import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, AlertTriangle, BadgeCheck, Ban, Search, Factory, UserCheck,
  FileWarning, Activity, CheckCircle2, XCircle, Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  SUPPLIERS, BUYERS, VERIFICATION_REQUESTS,
  SUPPLIER_CHECKS, BUYER_CHECKS, STATUS_TONE,
} from "@/lib/trade-network";

export const Route = createFileRoute("/verification-center")({
  head: () => ({ meta: [{ title: "Verification Center · Canta Trade Network" }] }),
  component: VerificationCenterPage,
});

function VerificationCenterPage() {
  const [tab, setTab] = useState("supplier-requests");

  const supplierReqs = VERIFICATION_REQUESTS.filter((v) => v.kind === "supplier");
  const buyerReqs = VERIFICATION_REQUESTS.filter((v) => v.kind === "buyer");

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3 w-3" /> Canta Internal · Trust & Safety</Badge>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Verification Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Moderate suppliers and buyers in the Canta Trade Network. Approve verifications, monitor risk, and suspend bad actors.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Pending verifications" value={`${VERIFICATION_REQUESTS.length}`} icon={Activity} tone="text-primary" />
        <KpiCard label="Verified suppliers" value={`${SUPPLIERS.filter(s=>s.status!=="Unverified"&&s.status!=="Suspended").length}`} icon={Factory} tone="text-success" />
        <KpiCard label="Verified buyers" value={`${BUYERS.filter(b=>b.status!=="Unverified"&&b.status!=="Suspended").length}`} icon={UserCheck} tone="text-accent" />
        <KpiCard label="High-risk flags" value="2" icon={AlertTriangle} tone="text-destructive" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="supplier-requests">Supplier Requests</TabsTrigger>
          <TabsTrigger value="buyer-requests">Buyer Requests</TabsTrigger>
          <TabsTrigger value="suppliers">Verified Suppliers</TabsTrigger>
          <TabsTrigger value="buyers">Verified Buyers</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="risk">Risk Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="supplier-requests" className="mt-4 space-y-3">
          {supplierReqs.map((r) => (
            <RequestCard key={r.id} req={r} checks={SUPPLIER_CHECKS} />
          ))}
        </TabsContent>

        <TabsContent value="buyer-requests" className="mt-4 space-y-3">
          {buyerReqs.map((r) => (
            <RequestCard key={r.id} req={r} checks={BUYER_CHECKS} />
          ))}
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4">
          <DirectoryTable
            rows={SUPPLIERS.map((s) => ({
              id: s.id, name: s.company, country: `${s.city}, ${s.country}`,
              status: s.status, meta: `${s.completedTx} tx · ${s.disputes} disputes`,
            }))}
          />
        </TabsContent>

        <TabsContent value="buyers" className="mt-4">
          <DirectoryTable
            rows={BUYERS.map((b) => ({
              id: b.id, name: b.name, country: `${b.city}, ${b.country}`,
              status: b.status, meta: `Pay ${b.paymentScore} · ${b.disputes} disputes`,
            }))}
          />
        </TabsContent>

        <TabsContent value="suspended" className="mt-4">
          <Card className="p-6 text-center text-sm text-muted-foreground">
            <Ban className="h-6 w-6 mx-auto mb-2 text-destructive" />
            No suspended profiles right now.
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="mt-4 space-y-3">
          <DisputeCard id="DSP-301" parties="Lagos Global Imports ⇄ Dubai Auto Parts FZE" reason="Late shipment, partial refund requested" amount="$18,400" status="Open" />
          <DisputeCard id="DSP-302" parties="Nairobi Textiles ⇄ Bursa Steel & Iron" reason="Quality mismatch on sample" amount="$6,250" status="Under review" />
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <Card className="p-4">
            <div className="text-sm font-semibold mb-3 flex items-center gap-2"><FileWarning className="h-4 w-4 text-warning" /> Risk monitoring queue</div>
            <RiskRow name="Dakar Imports SARL" reason="Sanctions hit · 2 PEP matches" risk="High" />
            <RiskRow name="Ankara Cosmetics" reason="Adverse media mention" risk="Medium" />
            <RiskRow name="Yiwu Smart Goods Co." reason="New entity, low transaction history" risk="Low" />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Activity; tone: string }) {
  return (
    <Card className="p-3 sm:p-4 min-w-0 overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</div>
        <Icon className={`h-4 w-4 shrink-0 ${tone}`} />
      </div>
      <div className="text-xl font-semibold mt-2 truncate">{value}</div>
    </Card>
  );
}

function RequestCard({ req, checks }: { req: typeof VERIFICATION_REQUESTS[number]; checks: string[] }) {
  const pct = (req.checksPassed / req.checksTotal) * 100;
  const riskTone = req.risk === "High" ? "bg-destructive/10 text-destructive" : req.risk === "Medium" ? "bg-warning/15 text-warning" : "bg-success/10 text-success";
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold">{req.name}</div>
          <div className="text-xs text-muted-foreground">{req.country} · submitted {req.submittedAt} · {req.id}</div>
        </div>
        <Badge className={riskTone}>{req.risk} risk</Badge>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">{req.checksPassed}/{req.checksTotal} checks passed</span>
          <span className="font-medium">{Math.round(pct)}%</span>
        </div>
        <Progress value={pct} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {checks.slice(0, req.checksPassed).map((c) => (
          <Badge key={c} variant="outline" className="text-[10px] gap-1"><CheckCircle2 className="h-3 w-3 text-success" />{c}</Badge>
        ))}
        {checks.slice(req.checksPassed).map((c) => (
          <Badge key={c} variant="outline" className="text-[10px] gap-1 opacity-60"><XCircle className="h-3 w-3" />{c}</Badge>
        ))}
      </div>
      <div className="mt-4 flex gap-2 flex-wrap">
        <Button size="sm" onClick={() => toast.success(`${req.name} approved`)}><BadgeCheck className="h-4 w-4 mr-2" />Approve</Button>
        <Button size="sm" variant="outline" onClick={() => toast("Requested more info")}>Request more info</Button>
        <Button size="sm" variant="outline" onClick={() => toast.error("Profile suspended")}>Suspend</Button>
      </div>
    </Card>
  );
}

function DirectoryTable({ rows }: { rows: { id: string; name: string; country: string; status: any; meta: string }[] }) {
  return (
    <Card>
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input className="flex-1 bg-transparent text-sm focus:outline-none" placeholder="Search directory…" />
      </div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="p-3 flex items-center gap-3 hover:bg-secondary/40">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{r.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{r.country} · {r.meta}</div>
            </div>
            <Badge className={STATUS_TONE[r.status as keyof typeof STATUS_TONE]}>{r.status}</Badge>
            <Button size="sm" variant="ghost" onClick={() => toast(`Opened ${r.id}`)}><Eye className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DisputeCard({ id, parties, reason, amount, status }: { id: string; parties: string; reason: string; amount: string; status: string }) {
  return (
    <Card className="p-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate">{parties}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{id} · {reason}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold">{amount}</div>
        <Badge variant="outline" className="text-[10px] mt-1">{status}</Badge>
      </div>
    </Card>
  );
}

function RiskRow({ name, reason, risk }: { name: string; reason: string; risk: "Low" | "Medium" | "High" }) {
  const tone = risk === "High" ? "text-destructive" : risk === "Medium" ? "text-warning" : "text-success";
  return (
    <div className="py-2.5 border-b border-border last:border-0 flex items-center gap-3">
      <AlertTriangle className={`h-4 w-4 shrink-0 ${tone}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-[11px] text-muted-foreground truncate">{reason}</div>
      </div>
      <Badge variant="outline" className="text-[10px]">{risk}</Badge>
    </div>
  );
}
