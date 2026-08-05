import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Factory, ShieldCheck, CheckCircle2, AlertCircle, FileText, Wallet, LifeBuoy, FlaskConical,
} from "lucide-react";

export const Route = createFileRoute("/supplier-portal/profile")({
  head: () => ({
    meta: [
      { title: "Supplier Profile — Supplier Portal — Canta" },
      { name: "description", content: "Company details, verification status and payout account summary for your Canta supplier account." },
    ],
  }),
  component: SupplierPortalProfile,
});

const COMPANY = {
  name: "Guangzhou Tech Factory Co., Ltd",
  owner: "Li Wei",
  country: "China",
  city: "Guangzhou, Guangdong",
  licence: "91440101MA9XK2R37D",
  category: "Consumer electronics · Bluetooth audio · Small appliances",
  email: "liwei@gztechfactory.cn",
  phone: "+86 20 8888 2211",
};

const DOCS = [
  { name: "Business licence (营业执照)", status: "On file" as const },
  { name: "Legal representative ID", status: "On file" as const },
  { name: "Bank account confirmation letter", status: "On file" as const },
  { name: "Factory address proof", status: "Required" as const },
];

function SupplierPortalProfile() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge variant="outline" className="gap-1"><Factory className="h-3 w-3" /> Supplier Profile · 供应商资料</Badge>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{COMPANY.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Receive-only supplier account. Your Nigerian buyers pay in NGN to Canta&apos;s collection account; Canta settles you in RMB
            to your verified payout account. You cannot send funds out of Canta from this portal.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] inline-flex items-center gap-1">
          <FlaskConical className="h-3 w-3" /> Demo data
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-4 p-5">
          <div className="text-sm font-semibold">Company details · 公司信息</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field k="Company" v={COMPANY.name} />
            <Field k="Owner / legal representative" v={COMPANY.owner} />
            <Field k="Country" v={COMPANY.country} />
            <Field k="City" v={COMPANY.city} />
            <Field k="Business licence number" v={COMPANY.licence} />
            <Field k="Supplier category / goods" v={COMPANY.category} />
            <Field k="Contact email" v={COMPANY.email} />
            <Field k="Contact phone" v={COMPANY.phone} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" /> Verification status
            </div>
            <Row k="Business registration" ok />
            <Row k="Legal representative ID" ok />
            <Row k="Payout account" ok />
            <Row k="Factory address proof" ok={false} />
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link to="/supplier-portal/verification">Open verification</Link>
            </Button>
          </Card>

          <Card className="space-y-2 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wallet className="h-4 w-4 text-primary" /> Payout account summary
            </div>
            <div className="text-sm">ICBC ****4821 · RMB · Guangzhou</div>
            <div className="text-xs text-muted-foreground">
              Settlement is only ever paid to a verified payout account in your company name.
            </div>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link to="/supplier-portal/payout-accounts">Manage payout accounts</Link>
            </Button>
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-primary" /> Documents required
        </div>
        <div className="space-y-2">
          {DOCS.map((d) => (
            <div key={d.name} className="flex items-center justify-between border-b border-border/40 py-2 text-sm last:border-0">
              <span>{d.name}</span>
              <Badge variant="outline" className={d.status === "On file" ? "text-[10px] text-primary" : "text-[10px] text-muted-foreground"}>
                {d.status === "On file" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
                {d.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-2 text-sm">
          <LifeBuoy className="h-4 w-4 text-primary" /> Need help with your profile or verification?
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/supplier-portal/support">Contact supplier support</Link>
        </Button>
      </Card>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="text-sm font-medium">{v}</div>
    </div>
  );
}

function Row({ k, ok }: { k: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{k}</span>
      <Badge variant="outline" className={ok ? "text-[10px] text-primary" : "text-[10px] text-muted-foreground"}>
        {ok ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
        {ok ? "Verified" : "Incomplete"}
      </Badge>
    </div>
  );
}
