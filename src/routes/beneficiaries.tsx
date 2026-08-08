import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Search, BadgeCheck } from "lucide-react";
import { useActions } from "@/components/actions-context";
import { useState, useMemo, useSyncExternalStore } from "react";
import { ReadinessBar } from "@/components/ReadinessBar";
import {
  getBeneficiaries,
  subscribeBeneficiaries,
  setBeneficiaryStatus,
} from "@/lib/beneficiary-store";
import { toast } from "sonner";
import {
  PAYOUT_STATUS_TONE,
  canReceivePayout,
  payoutBlockReason,
  SECURITY_COPY,
} from "@/lib/payout-security";
import { requestStepUp } from "@/lib/step-up";

export const Route = createFileRoute("/beneficiaries")({
  head: () => ({ meta: [{ title: "Beneficiaries — Canta" }] }),
  component: Beneficiaries,
});

function Beneficiaries() {
  const { openSend, openAddBeneficiary } = useActions();
  const [q, setQ] = useState("");
  const beneficiaries = useSyncExternalStore(
    subscribeBeneficiaries,
    getBeneficiaries,
    getBeneficiaries,
  );
  const filtered = useMemo(
    () =>
      beneficiaries.filter((b) =>
        `${b.id} ${b.name} ${b.bank} ${b.country} ${b.ccy} ${b.status}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [q, beneficiaries],
  );
  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Verify beneficiary details before sending funds." />
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Beneficiaries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Saved recipients for fast, validated payments.
          </p>
        </div>
        <Button onClick={openAddBeneficiary} className="bg-primary">
          <Plus className="h-4 w-4 mr-1.5" /> Add Beneficiary
        </Button>
      </div>

      <Card className="p-3 shadow-card text-xs text-muted-foreground">
        Bulk Payout uses saved beneficiaries only. The beneficiary currency must match the source
        wallet currency.
      </Card>

      <Card className="p-4 shadow-card flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder="Search beneficiaries by name, bank, country, currency or status…"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="text-xs text-muted-foreground hover:text-foreground px-2"
          >
            Clear
          </button>
        )}
      </Card>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Saved beneficiaries
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground text-center py-10">
              No beneficiaries match "{q}".
            </div>
          )}
          {filtered.map((b) => (
            <Card key={b.id} className="p-5 shadow-card hover:shadow-elevated transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center font-semibold">
                    {b.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{b.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.country} · {b.bank}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary">{b.ccy}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {b.id}
                </Badge>
                <Badge className={`text-[10px] ${PAYOUT_STATUS_TONE[b.status]}`}>{b.status}</Badge>
                <span className="text-[10px] text-muted-foreground">
                  Last payout: {b.lastPayout ?? "None"}
                </span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground font-mono">{b.account}</div>
              {payoutBlockReason(b.status) && (
                <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-2 text-[11px] text-amber-900">
                  {payoutBlockReason(b.status)}
                </div>
              )}
              {b.status !== "Verified" && b.status !== "Pending Review" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={async () => {
                    const step = await requestStepUp({
                      title: "Security check required",
                      action: `Submit ${b.name} for verification`,
                    });
                    if (!step.ok) return;
                    setBeneficiaryStatus(b.id, "Pending Review");
                    toast.success(`${b.name} submitted to Canta Ops`, {
                      description: "Payouts stay blocked until Ops verifies the account.",
                    });
                  }}
                >
                  <BadgeCheck className="h-3.5 w-3.5 mr-1.5" /> Submit for verification
                </Button>
              )}
              <Button
                size="sm"
                disabled={!canReceivePayout(b.status)}
                onClick={() => openSend(b.name)}
                className="w-full mt-3 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" /> Convert &amp; Send
              </Button>

              <p className="text-[11px] text-muted-foreground mt-2">
                Convert funds and send to this beneficiary after review.
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
