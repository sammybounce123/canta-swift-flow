import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { autoConvertStore, useAutoConvert } from "@/lib/supplier-simple";
import { langStore, useSupplierLang, useT } from "@/lib/supplier-lang";

export const Route = createFileRoute("/supplier-portal/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Supplier Portal — Canta" },
      { name: "description", content: "Language, automatic convert default, notifications and settlement currency for your supplier account." },
    ],
  }),
  component: SupplierSettings,
});

function SupplierSettings() {
  const lang = useSupplierLang();
  const autoConvert = useAutoConvert();
  const t = useT();
  const [channels, setChannels] = useState({ whatsapp: true, email: true, wechat: false });

  return (
    <div className="space-y-3">
      <Card className="space-y-3 p-4">
        <div className="text-sm font-semibold">Language preference</div>
        <div className="inline-flex rounded-lg border p-0.5">
          <Button size="sm" variant={lang === "en" ? "default" : "ghost"} className="h-8 px-3 text-xs" onClick={() => langStore.set("en")}>English</Button>
          <Button size="sm" variant={lang === "zh" ? "default" : "ghost"} className="h-8 px-3 text-xs" onClick={() => langStore.set("zh")}>中文</Button>
        </div>
      </Card>

      <Card className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">{t("autoConvert")} — default</div>
            <p className="text-xs text-muted-foreground">{t("autoConvertDesc")}</p>
          </div>
          <Switch checked={autoConvert} aria-label="Automatic Convert default" onCheckedChange={(v) => { autoConvertStore.set(v); toast.success(v ? "Default set to ON" : "Default set to OFF"); }} />
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <div className="text-sm font-semibold">Notification channels</div>
        {([["whatsapp", "WhatsApp"], ["email", "Email"], ["wechat", "WeChat copy message"]] as const).map(([k, label]) => (
          <div key={k} className="flex items-center justify-between text-sm">
            <span>{label}</span>
            <Switch checked={channels[k]} aria-label={label} onCheckedChange={(v) => setChannels((c) => ({ ...c, [k]: v }))} />
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => toast.success("Notification preferences saved")}>Save preferences</Button>
      </Card>

      <Card className="space-y-2 p-4">
        <div className="text-sm font-semibold">Settlement currency</div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge>RMB (default)</Badge>
          <Badge variant="outline">USD — optional, enable with support</Badge>
        </div>
        <p className="text-xs text-muted-foreground">Settlement is only ever paid to your verified bank account. You cannot send funds out of Canta.</p>
        <Button size="sm" variant="outline" asChild><Link to="/supplier-portal/rmb-bank-account">Manage bank accounts</Link></Button>
      </Card>

      <Card className="space-y-2 p-4">
        <div className="text-sm font-semibold">Security</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.info("Password change link sent to your email")}>Change password</Button>
          <Button size="sm" variant="outline" disabled>Two-factor authentication (coming soon)</Button>
        </div>
      </Card>

      <Card className="space-y-2 p-4">
        <div className="text-sm font-semibold">Business profile</div>
        <div className="text-sm">Guangzhou Tech Factory Co., Ltd · Li Wei · Guangzhou, China</div>
        <div className="text-xs text-muted-foreground">Business licence 91440101MA9XK2R37D · Consumer electronics</div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline" asChild><Link to="/supplier-portal/profile">View full profile</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to="/supplier-portal/verification">{t("verification")}</Link></Button>
        </div>
      </Card>
    </div>
  );
}
