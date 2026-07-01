import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Factory, Users, Receipt, Wallet, FileText, ShieldCheck,
  ArrowRight, CheckCircle2, Clock, Lock, Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";
import { ButtonGroup } from "@/components/ui/action-group";
import {
  SUPPLIER_TABS, REQUESTS, COMPLIANCE_DISCLAIMER,
  KPI, useVerified, verifiedStore, useFxQuotes,
} from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal")({
  head: () => ({ meta: [{ title: "Supplier Portal — Canta" }] }),
  component: SupplierPortalLayout,
});

function SupplierPortalLayout() {
  const verified = useVerified();
  const fxQuotes = useFxQuotes();
  const [invite, setInvite] = useState<null | "buyer" | "request">(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const totals = {
    pending: REQUESTS.filter((r) => r.status === "Awaiting Buyer Payment").length,
    ngnHeld: REQUESTS.filter((r) => ["NGN Received","Compliance Review","FX Processing"].includes(r.status))
      .reduce((s, r) => s + r.amountNgn, 0),
    rmbPaid: REQUESTS.filter((r) => r.status === "RMB Paid").reduce((s, r) => s + r.amountRmb, 0),
    buyers: new Set(REQUESTS.map((r) => r.buyer)).size,
  };
  const activeQuoteCount = fxQuotes.filter((q) =>
    q.status === "Quote Generated" || q.status === "Rate Locked" || q.status === "Sent to Buyer",
  ).length;

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Nigerian buyers can pay locally in NGN while suppliers receive RMB settlement through Canta."
      />

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Badge variant="outline" className="gap-1"><Factory className="h-3 w-3" /> Supplier Portal · Invite-only access</Badge>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Welcome, Li Wei</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Nigerian buyers can pay locally in NGN while suppliers receive RMB settlement through Canta. Suppliers only <strong>receive</strong> funds — no outbound payments from this portal.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge className="text-xs bg-primary/10 text-primary border-primary/30">Li Wei · Supplier Admin</Badge>
            <Badge variant="secondary" className="text-xs">Supplier Mode</Badge>
            <Badge variant="outline" className="text-xs">Guangzhou Tech Factory</Badge>
          </div>
        </div>
        <ButtonGroup label="Supplier portal actions" className="w-auto justify-start md:justify-end">
          <Button variant="outline" size="sm" onClick={() => setInvite("buyer")}>
            <Users className="h-4 w-4 mr-2" /> Add Nigerian buyer
          </Button>
          <Button size="sm" onClick={() => setInvite("request")}>
            <Receipt className="h-4 w-4 mr-2" /> New payment request
          </Button>
        </ButtonGroup>
      </header>

      {!verified && (
        <Card className="p-4 border-amber-300 bg-amber-50 text-amber-900 flex items-start gap-3">
          <Lock className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm flex-1">
            <div className="font-semibold">Complete supplier verification to receive RMB settlement.</div>
            <div className="text-xs mt-1">You can view invited payment requests and upload documents now. RMB payouts unlock after verification.</div>
          </div>
          <Button size="sm" variant="outline" onClick={() => { verifiedStore.set(true); toast.success("Verification simulated — RMB payouts enabled"); }}>
            Complete verification
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        <KPI label="Active FX Quotes" value={String(activeQuoteCount)} icon={Receipt} />
        <KPI label="Quotes Awaiting Buyer Payment" value={String(totals.pending)} icon={Clock} />
        <KPI label="NGN Received Awaiting Settlement" value={`₦${(totals.ngnHeld / 1_000_000).toFixed(1)}M`} icon={Wallet} />
        <KPI label="RMB Settlement Pending" value="¥42,300" icon={Landmark} />
        <KPI label="USD Settlement Pending" value="$0" icon={Landmark} />
        <KPI label="Settled This Month" value={`¥${totals.rmbPaid.toLocaleString()}`} icon={CheckCircle2} />
        <KPI label="Active Nigerian Buyers" value={String(totals.buyers)} icon={Users} />
        <KPI label="Payout Accounts Verified" value="1 of 2" icon={ShieldCheck} />
        <KPI label="Documents Required" value="2" icon={FileText} />
        <KPI label="Verification Status" value={verified ? "Verified" : "Pending"} icon={ShieldCheck} />
      </div>

      <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">
        {COMPLIANCE_DISCLAIMER}
      </Card>

      <nav aria-label="Supplier Portal sections" className="flex w-full min-w-0 flex-wrap items-stretch justify-start gap-3">
        {SUPPLIER_TABS.map((item) => {
          const active = item.to === "/supplier-portal"
            ? pathname === "/supplier-portal" || pathname === "/supplier-portal/"
            : pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`inline-flex min-h-11 max-w-full flex-none shrink-0 items-center justify-center whitespace-normal break-words rounded-lg border-2 px-4 py-2.5 text-center text-sm font-semibold leading-snug shadow-sm transition-all hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <section className="space-y-4">
        <Outlet />
      </section>

      <Dialog open={!!invite} onOpenChange={(o) => !o && setInvite(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{invite === "buyer" ? "Add a Nigerian buyer" : "New payment request"}</DialogTitle>
            <DialogDescription>
              {invite === "buyer"
                ? "Invite a Nigerian buyer to pay you through Canta. Buyer pays in NGN; you receive RMB settlement."
                : "Send a payment request linked to a Trade File. Buyer receives a Canta NGN payment link."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div><Label className="text-xs">Buyer company</Label><Input placeholder="e.g. Lagos Trade Holdings" /></div>
            <div><Label className="text-xs">Trade file</Label><Input placeholder="TF-2026-XXXX" /></div>
            {invite === "request" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Amount (RMB)</Label><Input type="number" placeholder="50000" /></div>
                  <div><Label className="text-xs">Goods</Label><Input placeholder="Bluetooth speakers x 500" /></div>
                </div>
                <div><Label className="text-xs">Notes for buyer</Label><Textarea placeholder="50% deposit, balance on BL" /></div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvite(null)}>Cancel</Button>
            <Button onClick={() => { setInvite(null); toast.success(invite === "buyer" ? "Buyer invitation sent" : "Payment request sent"); }}>
              {invite === "buyer" ? "Send invitation" : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-4 text-xs text-muted-foreground">
        <Link to="/welcome" className="inline-flex items-center gap-1 hover:underline">
          Switch workspace <ArrowRight className="h-3 w-3" />
        </Link>
      </Card>
    </div>
  );
}
