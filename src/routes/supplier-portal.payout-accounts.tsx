import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Landmark } from "lucide-react";
import { toast } from "sonner";
import { PayoutAccountCard } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/payout-accounts")({
  head: () => ({ meta: [{ title: "Payout Accounts — Supplier Portal — Canta" }] }),
  component: PayoutAccountsPanel,
});

function PayoutAccountsPanel() {
  return (
    <div className="space-y-3">
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-semibold">Supplier payout accounts</div>
            <div className="text-xs text-muted-foreground">
              Add RMB and USD accounts to <strong>receive</strong> settlement from Canta. These accounts are receive-only — suppliers cannot send funds out of Canta.
            </div>
          </div>
          <ButtonGroup label="Payout account actions">
            <Button size="sm" onClick={() => toast.success("Add RMB payout account")}><Landmark className="h-4 w-4 mr-2" /> Add RMB account</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Add USD payout account")}><Landmark className="h-4 w-4 mr-2" /> Add USD account</Button>
          </ButtonGroup>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <PayoutAccountCard
          currency="RMB"
          status="Verified"
          rows={[
            ["Beneficiary", "Guangzhou Tech Factory Co., Ltd"],
            ["Bank", "ICBC — Guangzhou Baiyun Branch"],
            ["Account number", "6222 **** **** 4821"],
            ["SWIFT", "ICBKCNBJGDG"],
            ["CNAPS", "102581000026"],
            ["Beneficiary address", "88 Baiyun Rd, Guangzhou, China"],
            ["Contact", "Li Wei · +86 138 0000 1234"],
          ]}
        />
        <PayoutAccountCard
          currency="USD"
          status="Under Review"
          rows={[
            ["Beneficiary", "Guangzhou Tech Factory Co., Ltd"],
            ["Bank", "Bank of China — Guangdong Branch"],
            ["Account number", "**** **** 9012"],
            ["SWIFT", "BKCHCNBJ400"],
            ["Bank branch", "Guangdong, China"],
            ["Beneficiary address", "88 Baiyun Rd, Guangzhou, China"],
            ["Contact", "Li Wei · liwei@gztech.cn"],
          ]}
        />
      </div>

      <Card className="p-3 text-xs text-muted-foreground">
        Account statuses: Not Submitted · Under Review · Verified · Rejected · Update Required. Supplier cannot receive settlement into an unverified payout account.
      </Card>
    </div>
  );
}
