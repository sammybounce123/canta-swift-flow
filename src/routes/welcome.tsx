import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, Ship, Factory, Home, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SEGMENTS, saveProfile, type WorkspaceType } from "@/lib/profile";
import { seedDemoSupplierPersona } from "@/lib/demo-supplier";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome to Canta — Choose your workspace" }] }),
  component: WelcomePage,
});

const ICONS: Partial<Record<WorkspaceType, typeof Building2>> = {
  enterprise_treasury: Building2,
  importer_portal: Ship,
  supplier_dashboard: Factory,
  partner_property: Home,
};
const TONES: Partial<Record<WorkspaceType, string>> = {
  enterprise_treasury: "bg-primary/10 text-primary",
  importer_portal: "bg-accent/15 text-accent",
  supplier_dashboard: "bg-amber-500/15 text-amber-700",
  partner_property: "bg-primary/10 text-primary",
};
const WHO_FOR: Partial<Record<WorkspaceType, string>> = {
  enterprise_treasury: "Multinationals, corporates, traders and large SMEs",
  importer_portal: "Importers buying from China, UAE, Turkey, India",
  supplier_dashboard:
    "Chinese suppliers receiving RMB settlement after Nigerian buyers pay NGN locally through Canta",
  partner_property: "Property partners like Kingsbridge Property Partners referring clients",
};
const DO_BULLETS: Partial<Record<WorkspaceType, string[]>> = {
  enterprise_treasury: [
    "FX & multi-currency balances",
    "Bulk payouts & approvals",
    "Beneficiaries & treasury reports",
  ],
  importer_portal: [
    "Send BL & track shipments",
    "Organize goods & documents",
    "Compare landed cost & pay suppliers",
  ],
  supplier_dashboard: [
    "Nigerian buyers can pay locally in NGN while suppliers receive RMB settlement through Canta",
    "Upload invoices & documents",
    "Track RMB settlement receipts",
  ],
  partner_property: [
    "Refer property clients",
    "Track FX & solicitor payouts",
    "Download payout receipts",
  ],
};
const CTA: Partial<Record<WorkspaceType, string>> = {
  enterprise_treasury: "Enter Treasury",
  importer_portal: "Enter Importer Mode",
  supplier_dashboard: "Enter Supplier Portal",
  partner_property: "Enter Partner Mode",
};

const VISIBLE: WorkspaceType[] = [
  "importer_portal",
  "supplier_dashboard",
  "enterprise_treasury",
  "partner_property",
];

function WelcomePage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<WorkspaceType | null>(null);

  const choose = (id: WorkspaceType) => {
    const segment = SEGMENTS.find((s) => s.id === id)!;
    saveProfile(segment);
    // Investor-demo persona: the Supplier workspace ships pre-verified so
    // the /supplier-portal dashboard opens directly. Genuine unverified
    // suppliers arrive with no seeded flags and still hit KYB below.
    if (id === "supplier_dashboard") {
      seedDemoSupplierPersona();
    }
    toast.success(`Let's set up ${segment.shortLabel}`);
    setTimeout(() => navigate({ to: "/kyb-onboarding", search: { workspace: id } as never }), 250);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <div className="h-7 w-7 shrink-0 rounded-md bg-primary grid place-items-center text-primary-foreground text-sm font-bold">
              C
            </div>
            <span className="truncate font-semibold">Canta</span>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
              Choose workspace
            </Badge>
          </Link>
          <div className="shrink-0 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Already onboarded? </span>
            <Link to="/dashboard" className="text-primary font-medium">
              Continue to app
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 text-center sm:mb-10">
          <Badge variant="outline" className="mb-3">
            Step 1 · Tell us about you
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            Choose your workspace
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Canta is a focused trade and treasury platform. Pick the workspace that matches how
            you'll use it. You can switch later from your account menu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {VISIBLE.map((id) => SEGMENTS.find((segment) => segment.id === id)!).map((s) => {
            const Icon = ICONS[s.id] ?? Building2;
            const hot = hovered === s.id;
            return (
              <button
                key={s.id}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => choose(s.id)}
                className={`flex h-full min-w-0 flex-col rounded-2xl border bg-card p-5 text-left transition-all hover:shadow-card hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6 ${
                  hot ? "border-accent shadow-card" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`h-11 w-11 shrink-0 rounded-2xl grid place-items-center sm:h-12 sm:w-12 ${TONES[s.id]}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  {hot && <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />}
                </div>

                <div className="mt-4 text-base font-semibold tracking-tight sm:mt-5 sm:text-lg">
                  {s.label}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Who it's for
                </div>
                <div className="mt-0.5 text-xs text-foreground/80">{WHO_FOR[s.id]}</div>

                <div className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  What you can do
                </div>
                <ul className="mt-1 space-y-1">
                  {(DO_BULLETS[s.id] ?? []).map((b) => (
                    <li key={b} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                      <span className="min-w-0">{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5">
                  <Badge variant="outline" className="max-w-full truncate text-[10px]">
                    Routes to {s.shortLabel}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                    {CTA[s.id]} <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground sm:mt-10">
          Need full enterprise verification?{" "}
          <Link to="/onboarding" className="text-primary font-medium">
            Start KYB onboarding
          </Link>
        </div>
      </div>
    </div>
  );
}
