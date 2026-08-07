import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Settings as SettingsIcon, Building2, Bell, Lock, Wallet, Ship } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import { CANTA_WHATSAPP_BOT_NUMBER } from "@/lib/whatsapp";
import {
  useImporter, setAlert, setPref, setBusiness, setNotifySetting, CURRENCIES,
} from "@/lib/importer-store";

export const Route = createFileRoute("/importer/settings")({
  head: () => ({
    meta: [
      { title: "Importer Settings — Canta" },
      { name: "description", content: "Business profile, notification preferences, security, payment defaults and WhatsApp shipment tracking settings." },
      { property: "og:title", content: "Importer Settings — Canta" },
      { property: "og:description", content: "Business profile, notification preferences, security, payment defaults and WhatsApp shipment tracking settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ImporterSettingsPage,
});

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-border/60 last:border-0">
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ImporterSettingsPage() {
  const s = useImporter();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ReadinessBar status="Demo Preview" cue="Settings are saved to this demo device only." />

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" /> Importer Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your business profile, alerts, security and payment defaults.
        </p>
      </header>

      <Card className="p-4 sm:p-5 shadow-card space-y-3">
        <h2 className="font-semibold text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Business profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Business name</Label>
            <Input value={s.business.name} onChange={(e) => setBusiness({ name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Contact person</Label>
            <Input value={s.business.contact} onChange={(e) => setBusiness({ contact: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={s.business.email} onChange={(e) => setBusiness({ email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={s.business.phone} onChange={(e) => setBusiness({ phone: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Business address</Label>
            <Input value={s.business.address} onChange={(e) => setBusiness({ address: e.target.value })} />
          </div>
        </div>
        <Button size="sm" onClick={() => toast.success("Business profile saved")}>Save profile</Button>
      </Card>

      <Card className="p-4 sm:p-5 shadow-card">
        <h2 className="font-semibold text-sm flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notification preferences</h2>
        <div className="mt-2">
          <Row label="Payment updates" hint="Quote ready, funded, compliance review, supplier paid.">
            <Switch checked={s.alerts.paymentUpdates} onCheckedChange={(v) => setAlert("paymentUpdates", v)} />
          </Row>
          <Row label="FX quote expiry alerts" hint="Warn you before an accepted rate expires.">
            <Switch checked={s.alerts.fxExpiry} onCheckedChange={(v) => setAlert("fxExpiry", v)} />
          </Row>
          <Row label="Shipment updates" hint="In transit, arriving soon, arrived.">
            <Switch checked={s.alerts.shipmentUpdates} onCheckedChange={(v) => setAlert("shipmentUpdates", v)} />
          </Row>
          <Row label="Receipt available alerts" hint="Tell me when a payment receipt is ready to download.">
            <Switch checked={s.alerts.receiptAvailable} onCheckedChange={(v) => setAlert("receiptAvailable", v)} />
          </Row>
          <Row label="WhatsApp notifications">
            <Switch checked={s.notifySettings.whatsapp} onCheckedChange={(v) => setNotifySetting("whatsapp", v)} />
          </Row>
          <Row label="Email notifications">
            <Switch checked={s.notifySettings.email} onCheckedChange={(v) => setNotifySetting("email", v)} />
          </Row>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 shadow-card">
        <h2 className="font-semibold text-sm flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Security</h2>
        <div className="mt-2">
          <Row label="Password" hint="Use a strong password you do not reuse elsewhere.">
            <Button size="sm" variant="outline" onClick={() => toast.info("Password change is not available in this demo")}>Change password</Button>
          </Row>
          <Row label="Two-factor authentication (2FA)" hint="Adds a second step when you sign in.">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">Not active</Badge>
              <Button size="sm" variant="outline" onClick={() => toast.info("2FA setup is not available in this demo")}>Set up</Button>
            </div>
          </Row>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 shadow-card">
        <h2 className="font-semibold text-sm flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Default payment preferences</h2>
        <div className="mt-2">
          <Row label="Default funding currency" hint="Currency you usually top up your balance with.">
            <Select value={s.prefs.fundingCurrency} onValueChange={(v) => setPref("fundingCurrency", v as "NGN" | "USDT")}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Default supplier settlement currency" hint="Currency your supplier usually receives.">
            <Select value={s.prefs.settlementCurrency} onValueChange={(v) => setPref("settlementCurrency", v)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Row>
          <Row label="Save supplier bank details by default" hint="Keep new supplier accounts for future payments.">
            <Switch checked={s.prefs.saveSupplierByDefault} onCheckedChange={(v) => setPref("saveSupplierByDefault", v)} />
          </Row>
          <Row label="USDT funding warnings" hint="Show the wrong-network warning before every USDT deposit.">
            <Switch checked={s.prefs.usdtWarnings} onCheckedChange={(v) => setPref("usdtWarnings", v)} />
          </Row>
          <Row label="Email funding receipts" hint="Send a receipt by email each time a wallet is credited.">
            <Switch checked={s.prefs.emailFundingReceipts} onCheckedChange={(v) => setPref("emailFundingReceipts", v)} />
          </Row>
          <Row label="WhatsApp payment notifications" hint="Payment and payout updates on WhatsApp.">
            <Switch checked={s.prefs.whatsappPaymentNotifications} onCheckedChange={(v) => setPref("whatsappPaymentNotifications", v)} />
          </Row>

        </div>
      </Card>

      <Card className="p-4 sm:p-5 shadow-card">
        <h2 className="font-semibold text-sm flex items-center gap-2"><Ship className="h-4 w-4 text-primary" /> WhatsApp shipment tracking</h2>
        {!CANTA_WHATSAPP_BOT_NUMBER && (
          <p className="mt-2 text-xs rounded-md border border-border bg-muted/40 px-3 py-2 text-muted-foreground">
            WhatsApp bot number not configured in demo.
          </p>
        )}
        <div className="mt-2">
          <Row label="Enable shipment updates on WhatsApp" hint="Get movement updates for your shipments.">
            <Switch checked={s.alerts.shipmentUpdates} onCheckedChange={(v) => setAlert("shipmentUpdates", v)} />
          </Row>
          <Row label="Default BL / container tracking notifications" hint="Automatically track every BL or container you upload.">
            <Switch checked={s.alerts.blTracking} onCheckedChange={(v) => setAlert("blTracking", v)} />
          </Row>
        </div>
      </Card>
    </div>
  );
}
