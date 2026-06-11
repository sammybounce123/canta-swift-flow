import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { PARTNER_ORG } from "@/lib/partner";

export const Route = createFileRoute("/partner/settings")({
  head: () => ({ meta: [{ title: "Settings — Baron & Cabot" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><SettingsIcon className="h-5 w-5 text-primary" /> Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Workspace, permissions, branding and notifications for {PARTNER_ORG.name}.</p>
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
        <Toggle label="Marketers can view other marketers' clients" defaultChecked={false} />
        <Toggle label="Marketers can view solicitor bank details" defaultChecked={false} />
        <Toggle label="Require admin approval to edit solicitor bank details" defaultChecked />
        <Toggle label="Hide client BVN from partner users" defaultChecked />
        <Toggle label="Allow marketers to send payment links directly to clients" defaultChecked />
      </Card>

      <Card className="p-6 shadow-card space-y-4">
        <div className="text-sm font-semibold">Branding</div>
        <Row label="Payment page header" value="Canta × Baron & Cabot Property Payment" />
        <Row label="Display referring partner" value="Baron & Cabot" />
        <Badge variant="outline" className="text-[10px]">Premium property-focused branding applied</Badge>
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <div className="text-sm">{label}</div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
