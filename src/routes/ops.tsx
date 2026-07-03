import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Receipt,
  LifeBuoy,
  MessageCircle,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/ops")({
  head: () => ({
    meta: [
      { title: "Ops Console — Canta" },
      { name: "description", content: "Internal operations overview across verification, payments, support, WhatsApp, and compliance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OpsConsole,
});

type Metric = {
  label: string;
  value: string;
  hint: string;
  tone: "default" | "warn" | "danger" | "ok";
  icon: React.ComponentType<{ className?: string }>;
  to: string;
};

const METRICS: Metric[] = [
  { label: "Pending KYB / verification reviews", value: "14", hint: "Awaiting compliance action", tone: "warn", icon: ShieldCheck, to: "/verification-center" },
  { label: "Recent payment requests (24h)", value: "38", hint: "Across all workspaces", tone: "default", icon: Receipt, to: "/treasury" },
  { label: "Open support tickets", value: "9", hint: "Cross-workspace queue", tone: "default", icon: LifeBuoy, to: "/support" },
  { label: "WhatsApp shipment / BL checks", value: "22", hint: "Awaiting operator reply", tone: "default", icon: MessageCircle, to: "/whatsapp" },
  { label: "Compliance review queue", value: "6", hint: "Manual review needed", tone: "warn", icon: ShieldAlert, to: "/compliance" },
  { label: "Failed or flagged payments", value: "3", hint: "Requires operator triage", tone: "danger", icon: AlertTriangle, to: "/treasury" },
];

const QUICK_LINKS: { to: string; label: string; desc: string }[] = [
  { to: "/verification", label: "Verification", desc: "KYB / KYC status" },
  { to: "/support", label: "Support", desc: "Ticket queue" },
  { to: "/whatsapp", label: "WhatsApp", desc: "Shipment & BL checks" },
  { to: "/treasury", label: "Treasury", desc: "Settlement monitoring" },
  { to: "/reports", label: "Reports", desc: "Cross-workspace insights" },
];

const RECENT_ACTIVITY = [
  { at: "2m ago", kind: "Verification", text: "Kano Distributors submitted updated CAC docs", to: "/verification-center" },
  { at: "14m ago", kind: "Payment", text: "PR-3080 flagged for compliance review", to: "/compliance" },
  { at: "38m ago", kind: "Support", text: "Ticket #4821 escalated — Enterprise Treasury", to: "/support" },
  { at: "1h ago", kind: "WhatsApp", text: "BL verification requested for TF-2026-0214", to: "/whatsapp" },
  { at: "3h ago", kind: "Payment", text: "PR-3055 failed at settlement rail — retry queued", to: "/treasury" },
];

function toneClasses(t: Metric["tone"]) {
  switch (t) {
    case "warn": return "border-amber-500/40 bg-amber-500/5";
    case "danger": return "border-destructive/40 bg-destructive/5";
    case "ok": return "border-emerald-500/40 bg-emerald-500/5";
    default: return "";
  }
}

function OpsConsole() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold">Ops Console</h1>
            <Badge variant="outline" className="ml-1">Internal</Badge>
            <Badge variant="secondary">Demo data</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Monitor verification, payments, support, WhatsApp shipment checks, and compliance activity.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/reports"><BarChart3 className="h-4 w-4 mr-1.5" /> Open reports</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS.map((m) => (
          <Card key={m.label} className={`p-4 ${toneClasses(m.tone)}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{m.label}</div>
                <div className="text-2xl font-semibold mt-1">{m.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.hint}</div>
              </div>
              <m.icon className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>
            <div className="mt-3">
              <Button asChild variant="ghost" size="sm" className="h-8 px-2 -ml-2">
                <Link to={m.to}>Open <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent operational activity</h2>
            <Badge variant="outline" className="text-xs">Mock feed</Badge>
          </div>
          <ul className="divide-y divide-border">
            {RECENT_ACTIVITY.map((r, i) => (
              <li key={i} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{r.at} · {r.kind}</div>
                  <div className="text-sm truncate">{r.text}</div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to={r.to}>View</Link>
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Quick links</h2>
          <div className="space-y-2">
            {QUICK_LINKS.map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">{q.label}</div>
                  <div className="text-xs text-muted-foreground">{q.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Ops Console is an internal Canta view. Supplier RMB wallet balances and importer Trade File details are only referenced here at an operational level and remain owned by their respective workspaces.
      </p>
    </div>
  );
}
