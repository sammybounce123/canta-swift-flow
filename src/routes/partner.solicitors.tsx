import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, Download, Edit3, ShieldCheck, History, Users } from "lucide-react";
import { toast } from "sonner";
import { SOLICITORS, formatGBP } from "@/lib/partner";

export const Route = createFileRoute("/partner/solicitors")({
  head: () => ({ meta: [{ title: "Solicitors — Baron & Cabot" }] }),
  component: Solicitors,
});

function Solicitors() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Solicitor directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Saved solicitor beneficiaries linked to your Baron &amp; Cabot referrals.</p>
        </div>
        <Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> Add solicitor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOLICITORS.map((s) => (
          <Card key={s.id} className="p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold">{s.firm}</div>
                  {s.preferred && <Badge variant="outline" className="text-[10px] bg-warning/15 text-warning border-warning/30"><Star className="h-3 w-3 mr-1" /> Preferred</Badge>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.contact} · {s.country}</div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${
                s.verified === "Verified" ? "bg-success/15 text-success border-success/30"
                  : s.verified === "Pending" ? "bg-warning/15 text-warning border-warning/30"
                  : "bg-destructive/15 text-destructive border-destructive/30"
              }`}>
                <ShieldCheck className="h-3 w-3 mr-1" /> {s.verified}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <Info label="Email" value={s.email} />
              <Info label="Phone" value={s.phone} />
              <Info label="Bank" value={s.bank} />
              <Info label="Currency" value={s.currency} />
              <Info label="Account name" value={s.accountName} />
              <Info label="Account number" value={s.accountNumberMasked} />
              <Info label="Sort code" value={s.sortCode ?? "—"} />
              <Info label="SWIFT / BIC" value={s.swift} />
              <Info label="IBAN" value={s.iban ?? "—"} />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Clients</div>
                <div className="text-base font-semibold tabular-nums">{s.linkedClients}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total payouts</div>
                <div className="text-base font-semibold tabular-nums">{formatGBP(s.totalPayouts)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last payout</div>
                <div className="text-base font-semibold tabular-nums">{s.lastPayout}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => toast("Opening solicitor profile…")}>View</Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("Edits require re-verification")}><Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success(s.preferred ? "Removed preferred" : "Marked as preferred")}><Star className="h-3.5 w-3.5 mr-1.5" /> {s.preferred ? "Unpin" : "Preferred"}</Button>
              <Button size="sm" variant="ghost"><Users className="h-3.5 w-3.5 mr-1.5" /> Clients</Button>
              <Button size="sm" variant="ghost"><History className="h-3.5 w-3.5 mr-1.5" /> Payouts</Button>
              <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5 mr-1.5" /> Confirmation</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}
