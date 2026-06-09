import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Key, Building2, Activity, Copy, Workflow, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Canta" }] }),
  component: Settings,
});

function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Company profile, security and integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">Company Details</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Field label="Legal name" value="Niger Delta Exploration Ltd" />
            <Field label="Registration No." value="RC 1284502" />
            <Field label="Industry" value="Oil & Gas — Upstream" />
            <Field label="Country" value="Nigeria" />
            <Field label="Tax ID (TIN)" value="01927384-0001" />
            <Field label="Primary contact" value="adaeze@ndexploration.ng" />
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">KYC / KYB Status</div>
          </div>
          <div className="space-y-3">
            {[
              { l: "Business verification", s: "Verified" },
              { l: "Beneficial owners", s: "Verified" },
              { l: "Source of funds", s: "Verified" },
              { l: "Enhanced due diligence", s: "Pending" },
            ].map((k) => (
              <div key={k.l} className="flex items-center justify-between text-sm">
                <span>{k.l}</span>
                <Badge className={k.s === "Verified" ? "bg-success/15 text-success border-success/30 hover:bg-success/15" : "bg-warning/20 text-warning-foreground border-warning/40 hover:bg-warning/20"}>{k.s}</Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-5">Request review</Button>
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">API Keys</div>
          </div>
          <Button size="sm" variant="outline">Generate new key</Button>
        </div>
        <div className="space-y-2">
          {[
            { env: "Live", key: "ck_live_••••••••••••••••a921", created: "Mar 12, 2026" },
            { env: "Test", key: "ck_test_••••••••••••••••5f02", created: "Jan 04, 2026" },
          ].map((k) => (
            <div key={k.key} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border">
              <Badge className={k.env === "Live" ? "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/15" : "bg-secondary"}>{k.env}</Badge>
              <code className="text-xs font-mono flex-1">{k.key}</code>
              <span className="text-xs text-muted-foreground">Created {k.created}</span>
              <button className="p-1.5 rounded hover:bg-secondary"><Copy className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">Security</div>
          </div>
          <div className="space-y-4">
            <Row label="Two-factor authentication" desc="Required for all admin actions" enabled />
            <Row label="Session timeout" desc="Auto sign-out after 15 minutes of inactivity" enabled />
            <Row label="Approval flows" desc="Required for transactions over $50,000" enabled />
            <Row label="IP allowlist" desc="Restrict access to trusted networks" />
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">Recent Activity</div>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              { a: "Signed in", t: "2 minutes ago", who: "Adaeze O. · Lagos, NG" },
              { a: "Approved $487,300 to Schlumberger", t: "1 hour ago", who: "Kunle A." },
              { a: "Generated Live API key", t: "Yesterday", who: "Adaeze O." },
              { a: "Updated permissions for Finance role", t: "2 days ago", who: "Adaeze O." },
            ].map((e) => (
              <li key={e.a} className="flex items-start gap-3 pb-3 border-b border-border last:border-none">
                <span className="h-2 w-2 rounded-full bg-accent mt-1.5" />
                <div className="flex-1">
                  <div className="font-medium">{e.a}</div>
                  <div className="text-xs text-muted-foreground">{e.who}</div>
                </div>
                <span className="text-xs text-muted-foreground">{e.t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium mt-1">{value}</div>
    </div>
  );
}

function Row({ label, desc, enabled }: { label: string; desc: string; enabled?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <span className={`shrink-0 h-5 w-9 rounded-full px-0.5 inline-flex items-center transition ${enabled ? "bg-accent justify-end" : "bg-secondary justify-start"}`}>
        <span className="h-4 w-4 rounded-full bg-white shadow" />
      </span>
    </div>
  );
}
