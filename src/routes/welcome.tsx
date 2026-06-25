import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Ship, Truck, Globe, Factory, CreditCard, Home,
  ArrowRight, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { SEGMENTS, saveProfile, type WorkspaceType } from "@/lib/profile";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome to Canta — Choose your workspace" }] }),
  component: WelcomePage,
});

const ICONS: Partial<Record<WorkspaceType, typeof Building2>> = {
  enterprise_treasury: Building2, importer_portal: Ship, freight_workspace: Truck,
  global_collections: Globe, supplier_dashboard: Factory,
  global_spend_cards: CreditCard, partner_property: Home,
};
const TONES: Partial<Record<WorkspaceType, string>> = {
  enterprise_treasury: "bg-primary/10 text-primary",
  importer_portal: "bg-accent/15 text-accent",
  freight_workspace: "bg-warning/15 text-warning",
  global_collections: "bg-success/10 text-success",
  supplier_dashboard: "bg-amber-500/15 text-amber-700",
  global_spend_cards: "bg-destructive/10 text-destructive",
  partner_property: "bg-primary/10 text-primary",
};
const WHO_FOR: Partial<Record<WorkspaceType, string>> = {
  enterprise_treasury: "Multinationals, corporates, traders and large SMEs",
  importer_portal: "Importers buying from China, UAE, Turkey, India",
  freight_workspace: "Verified clearing agents bidding for importer jobs",
  partner_property: "Property partners like Baron & Cabot referring clients",
};
const DO_BULLETS: Partial<Record<WorkspaceType, string[]>> = {
  enterprise_treasury: ["FX & multi-currency balances", "Bulk payouts & approvals", "Beneficiaries & treasury reports"],
  importer_portal: ["Send BL & track shipments", "Organize goods & documents", "Compare clearing agents & pay"],
  freight_workspace: ["See importer quote requests", "Submit & manage bids", "Run accepted clearing jobs"],
  partner_property: ["Refer property clients", "Track FX & solicitor payouts", "Download payout receipts"],
};
const CTA: Partial<Record<WorkspaceType, string>> = {
  enterprise_treasury: "Enter Treasury",
  importer_portal: "Enter Importer Trade Desk",
  freight_workspace: "Enter Clearing Agent Portal",
  partner_property: "Enter Partner Mode",
};

const VISIBLE: WorkspaceType[] = ["importer_portal", "freight_workspace", "enterprise_treasury", "partner_property"];


function WelcomePage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<WorkspaceType | null>(null);

  const choose = (id: WorkspaceType) => {
    const segment = SEGMENTS.find((s) => s.id === id)!;
    saveProfile(segment);
    toast.success(`Workspace set: ${segment.shortLabel}`, { description: "Let's complete a quick onboarding." });
    setTimeout(() => navigate({ to: "/onboarding" }), 350);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary grid place-items-center text-primary-foreground text-sm font-bold">C</div>
            <span className="font-semibold">Canta</span>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">Choose workspace</Badge>
          </Link>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Already onboarded? <Link to="/dashboard" className="text-primary font-medium">Continue to app</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3">Step 1 · Tell us about you</Badge>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Choose your workspace</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
            Canta is a focused trade and treasury platform. Pick the workspace that matches how you'll use it.

            You can switch later from your account menu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SEGMENTS.map((s) => {
            const Icon = ICONS[s.id] ?? Building2;
            const hot = hovered === s.id;
            return (
              <button
                key={s.id}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => choose(s.id)}
                className={`text-left p-6 rounded-2xl border bg-card transition-all hover:shadow-card hover:-translate-y-0.5 ${
                  hot ? "border-accent shadow-card" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-2xl grid place-items-center ${TONES[s.id]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {hot && <CheckCircle2 className="h-4 w-4 text-accent" />}
                </div>

                <div className="mt-5 text-lg font-semibold tracking-tight">{s.label}</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">Who it's for</div>
                <div className="text-xs text-foreground/80 mt-0.5">{WHO_FOR[s.id]}</div>

                <div className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">What you can do</div>
                <ul className="mt-1 space-y-1">
                  {(DO_BULLETS[s.id] ?? []).map((b) => (
                    <li key={b} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-accent mt-0.5 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">Routes to {s.shortLabel}</Badge>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                    {CTA[s.id]} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          Need full enterprise verification? <Link to="/onboarding" className="text-primary font-medium">Start KYB onboarding</Link>
        </div>
      </div>
    </div>
  );
}
