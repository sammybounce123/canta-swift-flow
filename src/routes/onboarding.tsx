import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2, Ship, Truck, Globe, Factory, CreditCard, Home,
  ArrowRight, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { SEGMENTS, saveProfile, type WorkspaceType } from "@/lib/profile";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Workspace Onboarding — Canta" },
      { name: "description", content: "Choose your Canta workspace — Treasury, Importer, Freight, Collections, Supplier, Cards, or Property Partner." },
    ],
  }),
  component: OnboardingPicker,
});

const ICONS: Partial<Record<WorkspaceType, typeof Building2>> = {
  enterprise_treasury: Building2,
  importer_portal: Ship,
  freight_workspace: Truck,
  global_collections: Globe,
  supplier_dashboard: Factory,
  global_spend_cards: CreditCard,
  partner_property: Home,
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
  freight_workspace: "Freight forwarders, clearing agents, logistics operators",
  supplier_dashboard: "Foreign suppliers & exporters selling to African buyers",
  global_collections: "Universities, hospitals, airlines, travel, e-commerce",
  global_spend_cards: "Individuals & small businesses spending globally",
  partner_property: "Property partners like Baron & Cabot referring clients",
};
const DO_BULLETS: Partial<Record<WorkspaceType, string[]>> = {
  enterprise_treasury: ["FX & multi-currency wallets", "Approvals & beneficiaries", "Company cards & compliance"],
  importer_portal: ["Track shipments & landed cost", "Manage suppliers & documents", "Pay in any currency"],
  freight_workspace: ["Run shipment pipeline", "Invoice customers & collect", "WhatsApp updates at scale"],
  supplier_dashboard: ["Invoice African buyers", "Confirm funds via escrow", "Receive global settlement"],
  global_collections: ["Collect locally via links", "Reconcile and settle globally", "Manage staff cards"],
  global_spend_cards: ["Create purpose-built cards", "Travel, students, ads", "Track every transaction"],
  partner_property: ["Refer property clients", "Track FX & solicitor payouts", "Download payout receipts"],
};

const ROUTE_FOR: Partial<Record<WorkspaceType, string>> = {
  enterprise_treasury: "/treasury",
  importer_portal: "/importer",
  freight_workspace: "/freight",
  global_collections: "/collections",
  supplier_dashboard: "/suppliers",
  global_spend_cards: "/cards",
  partner_property: "/partner",
};

function OnboardingPicker() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<WorkspaceType | null>(null);

  const choose = (id: WorkspaceType) => {
    const segment = SEGMENTS.find((s) => s.id === id)!;
    saveProfile(segment);
    toast.success("Workspace selected successfully.", { description: segment.shortLabel });
    setTimeout(() => navigate({ to: ROUTE_FOR[id] as never }), 350);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary grid place-items-center text-primary-foreground text-sm font-bold">C</div>
            <span className="font-semibold">Canta</span>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">Choose your workspace</Badge>
          </Link>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Already onboarded? <Link to="/dashboard" className="text-primary font-medium">Continue to app</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3">Step 1 · Tell us about you</Badge>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">What best describes you?</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
            We'll set up the right workspace, navigation, roles, and tools for how you use Canta.
            You can switch later from the workspace menu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SEGMENTS.map((s) => {
            const Icon = ICONS[s.id];
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
                  {DO_BULLETS[s.id].map((b) => (
                    <li key={b} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-accent mt-0.5 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">Routes to {ROUTE_FOR[s.id]}</Badge>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                    Enter workspace <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          Need help choosing? <a href="mailto:onboarding@canta.app" className="text-primary font-medium">Talk to onboarding</a>
          <span className="mx-2">·</span>
          <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Skip for now</Link></Button>
        </div>
      </div>
    </div>
  );
}
