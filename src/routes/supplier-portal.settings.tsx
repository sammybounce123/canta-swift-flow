import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Building2, ShieldCheck, Landmark, Bell, Globe } from "lucide-react";
import { toast } from "sonner";
import { DetailRow, COMPLIANCE_DISCLAIMER } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/settings")({
  head: () => ({ meta: [{ title: "Supplier Settings — Supplier Portal — Canta" }] }),
  component: SupplierSettings,
});

function SupplierSettings() {
  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="text-sm font-semibold">Supplier settings — Guangzhou Tech Factory</div>
        <div className="text-xs text-muted-foreground">These settings apply only to your supplier workspace. Owner: Li Wei.</div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4" /> Company profile</div>
        <div className="grid gap-2 md:grid-cols-2">
          <DetailRow label="Company" value="Guangzhou Tech Factory Co., Ltd" />
          <DetailRow label="Owner" value="Li Wei" />
          <DetailRow label="Country" value="China" />
          <DetailRow label="Business licence" value="440101-000-XXXXXX" />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Verification &amp; KYC / KYB</div>
        <div className="text-xs text-muted-foreground">Upload business licence, tax certificate, export licence, and bank statement. Verification is required before settlement.</div>
        <ButtonGroup label="Verification actions">
          <Button size="sm" asChild><Link to="/supplier-portal/verification"><ShieldCheck className="h-4 w-4 mr-2" /> Open verification center</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to="/supplier-portal/documents">Upload documents</Link></Button>
        </ButtonGroup>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2"><Landmark className="h-4 w-4" /> RMB payout account</div>
        <div className="text-xs text-muted-foreground">Receive-only. Suppliers cannot send funds out of Canta.</div>
        <ButtonGroup label="Payout actions">
          <Button size="sm" variant="outline" asChild><Link to="/supplier-portal/payout-accounts">Manage payout accounts</Link></Button>
        </ButtonGroup>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</div>
        <div className="grid gap-2 md:grid-cols-2">
          <DetailRow label="NGN payment received" value="Email + WhatsApp" />
          <DetailRow label="RMB payout initiated" value="Email" />
          <DetailRow label="Compliance action needed" value="Email + WhatsApp" />
          <DetailRow label="FX quote expiry" value="WhatsApp" />
        </div>
        <ButtonGroup label="Notification actions">
          <Button size="sm" variant="outline" onClick={() => toast.success("Notification preferences saved")}>Save preferences</Button>
        </ButtonGroup>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2"><Globe className="h-4 w-4" /> Language &amp; region</div>
        <div className="grid gap-2 md:grid-cols-2">
          <DetailRow label="Interface language" value="English / 中文" />
          <DetailRow label="Timezone" value="Asia/Shanghai (GMT+8)" />
          <DetailRow label="Settlement currency" value="RMB (fixed)" />
          <DetailRow label="Buyer pays in" value="NGN (fixed)" />
        </div>
      </Card>

      <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">{COMPLIANCE_DISCLAIMER}</Card>
    </div>
  );
}
