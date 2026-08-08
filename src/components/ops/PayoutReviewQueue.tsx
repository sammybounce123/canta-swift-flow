import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldAlert, FileText, Eye } from "lucide-react";
import {
  usePayoutReviewQueue,
  usePayoutAudit,
  payoutReviewQueue,
  maskAccountNumber,
  PAYOUT_STATUS_TONE,
  logPayoutEvent,
  type ReviewItem,
} from "@/lib/payout-security";
import { requestStepUp } from "@/lib/step-up";

export function PayoutReviewQueue() {
  const queue = usePayoutReviewQueue();
  const audit = usePayoutAudit();
  const pending = queue.filter(
    (q) => q.status === "Pending Review" || q.status === "Submitted" || q.status === "More Info Required",
  );

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-semibold">Payout account review queue</h2>
          <Badge variant="outline">{pending.length} awaiting review</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Every payout account across Supplier, Importer, Partner and Treasury must be approved here
          before it can receive money. Account numbers are masked; revealing one is audited.
        </p>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {queue.map((item) => (
          <ReviewCard key={item.id} item={item} />
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4" /> Payout account audit trail
        </div>
        <div className="mt-3 max-h-72 overflow-auto text-xs">
          <table className="w-full">
            <thead className="text-muted-foreground">
              <tr className="text-left">
                <th className="py-1 pr-3">When</th>
                <th className="py-1 pr-3">Actor</th>
                <th className="py-1 pr-3">Action</th>
                <th className="py-1 pr-3">Entity</th>
                <th className="py-1 pr-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {audit.slice(0, 40).map((e) => (
                <tr key={e.id} className="border-t align-top">
                  <td className="py-1 pr-3 whitespace-nowrap">{e.at?.slice(0, 16) ?? "—"}</td>
                  <td className="py-1 pr-3">{e.actor}</td>
                  <td className="py-1 pr-3">{e.action}</td>
                  <td className="py-1 pr-3">{e.entity}</td>
                  <td className="py-1 pr-3 text-muted-foreground">{e.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ReviewCard({ item }: { item: ReviewItem }) {
  const [reason, setReason] = useState("");
  const [revealed, setRevealed] = useState(false);

  const reveal = async () => {
    if (revealed) return setRevealed(false);
    const step = await requestStepUp({
      title: "Security check required",
      action: `Reveal account number for ${item.accountHolder}`,
      requireReason: true,
    });
    if (!step.ok) return;
    setRevealed(true);
    logPayoutEvent({
      action: "Bank account details revealed",
      workspace: "Ops",
      entity: `${item.id} · ${item.accountHolder}`,
      actor: "Canta Ops",
      role: "Ops reviewer",
      reason: step.reason ?? "Not provided",
    });
  };

  const decide = async (
    status: "Verified" | "Rejected" | "More Info Required" | "Disabled",
    needsReason: boolean,
  ) => {
    if (needsReason && !reason.trim()) {
      toast.error("A reason is required for this decision.");
      return;
    }
    const step = await requestStepUp({
      title: "Security check required",
      action: `${status} · ${item.accountHolder}`,
    });
    if (!step.ok) return;
    payoutReviewQueue.setStatus(item.id, status, reason.trim() || undefined);
    setReason("");
    toast.success(`${item.id} marked ${status}`);
  };

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{item.accountHolder}</div>
          <div className="text-xs text-muted-foreground">
            {item.business} · {item.bank} · {item.currency}
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            {revealed ? item.accountNumber : maskAccountNumber(item.accountNumber)}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge className={PAYOUT_STATUS_TONE[item.status]}>{item.status}</Badge>
          <Badge variant="outline" className="text-[10px]">
            {item.workspace}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
        <div>Submitted by: {item.submittedBy}</div>
        <div>Submitted: {item.submittedAt}</div>
        <div>Name match: {item.nameMatch}</div>
        <div>Previous changes: {item.previousChanges}</div>
        <div className="col-span-2">
          Documents: {item.documents.length ? item.documents.join(", ") : "None uploaded"}
        </div>
        <div className="col-span-2">Linked to: {item.linkedRef}</div>
      </div>

      {item.riskFlags.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-2 text-[11px] text-amber-900">
          Risk flags: {item.riskFlags.join(" · ")}
        </div>
      )}
      {item.note && (
        <div className="rounded-md border bg-muted/40 p-2 text-[11px] text-muted-foreground">
          Reviewer note: {item.note}
        </div>
      )}

      <Input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason / note (required to reject or request info)"
        className="h-8 text-xs"
        aria-label={`Review reason for ${item.id}`}
      />

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => void decide("Verified", false)}>
          Approve
        </Button>
        <Button size="sm" variant="outline" onClick={() => void decide("More Info Required", true)}>
          Request more info
        </Button>
        <Button size="sm" variant="outline" onClick={() => void decide("Rejected", true)}>
          Reject
        </Button>
        <Button size="sm" variant="outline" onClick={() => void decide("Disabled", true)}>
          Disable
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void reveal()}>
          <Eye className="h-3.5 w-3.5 mr-1.5" /> {revealed ? "Hide" : "Reveal"} account number
        </Button>
      </div>
    </Card>
  );
}
