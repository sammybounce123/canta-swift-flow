import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, ShieldCheck, Percent } from "lucide-react";
import { PARTNER_ORG } from "@/lib/partner";
import { getSettings, setSetting, subscribeExtras, type PartnerSettings } from "@/lib/partner-extras";

export const Route = createFileRoute("/partner/settings")({
  head: () => ({ meta: [{ title: "Settings — Kingsbridge Property Partners" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [, force] = useState(0);
  useEffect(() => subscribeExtras(() => force((n) => n + 1)), []);
  const s = getSettings();
  const bind = (k: keyof PartnerSettings) => ({ checked: !!s[k], onCheckedChange: (v: boolean) => setSetting(k, v) });

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><SettingsIcon className="h-5 w-5 text-primary" /> Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Workspace, permissions, branding and commission policy for {PARTNER_ORG.name}.</p>
      </div>

      <Card className="p-6 shadow-card space-y-4">
        <div className="text-sm font-semibold">Organization</div>
        <Row label="Partner organization" value={PARTNER_ORG.name} />
        <Row label="Partner type" value={PARTNER_ORG.type} />
        <Row label="Country" value={PARTNER_ORG.country} />
        <Row label="Workspace ID" value={PARTNER_ORG.id} mono />
      </Card>

      <Card className="p-6 shadow-card space-y-4">
        <div className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Permissions &amp; visibility</div>
        <Toggle label="Hide client BVN from partner users" {...bind("hideBVNFromPartner")} />
        <Toggle label="Require admin approval to edit solicitor bank details" {...bind("requireAdminApprovalForBankEdit")} />
      </Card>

      <Card className="p-6 shadow-card space-y-4">
        <div className="text-sm font-semibold flex items-center gap-2"><Percent className="h-4 w-4 text-primary" /> Commissions</div>
        <Toggle label="Enable commission tracking (adds Commissions to the sidebar)" {...bind("commissionsEnabled")} />
        <Toggle label="Marketers can view their own attributed commission" {...bind("marketerSeesOwnCommission")} />
      </Card>

      <Card className="p-6 shadow-card space-y-4">
        <div className="text-sm font-semibold">Branding</div>
        <Row label="Payment page header" value="Canta × Kingsbridge Property Partners Property Payment" />
        <Row label="Display referring partner" value="Kingsbridge Property Partners" />
        <Badge variant="outline" className="text-[10px]">Premium property-focused branding applied</Badge>
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return <div className="flex justify-between items-center gap-4"><div className="text-xs text-muted-foreground">{label}</div><div className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</div></div>;
}
function Toggle({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return <div className="flex justify-between items-center gap-4"><div className="text-sm">{label}</div><Switch checked={checked} onCheckedChange={onCheckedChange} /></div>;
}
