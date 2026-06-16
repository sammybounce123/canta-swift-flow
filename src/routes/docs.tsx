import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BookOpen } from "lucide-react";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "Documentation — Canta" }] }),
  component: Docs,
});

const SECTIONS: { h: string; body: string[] }[] = [
  {
    h: "Workspaces",
    body: [
      "Users pick a workspace on first sign-in. The sidebar, dashboard and default landing route are driven by the selected profile.",
      "Available profiles: Enterprise / Corporate Treasury (/treasury), Importer Portal (/importer), Freight Forwarder (/freight), Global Collections / Merchant (/dashboard), Supplier / Exporter (/suppliers), Global Spend & Cards (/cards), and Partner Property — Baron & Cabot (/partner).",
      "Switch workspace any time from the workspace switcher in the top bar.",
    ],
  },
  {
    h: "Money Movement",
    body: [
      "Wallets (/wallets): multi-currency wallets for NGN, USD, EUR, GBP, ZAR, AED, CNY and INR. Top up via Bank Transfer (recommended) or USDT (TRC20/ERC20). Card funding is intentionally disabled.",
      "Send Payment: choose a saved beneficiary or add a new one inline. Required: amount, reference, narration/purpose, and an optional supporting document. A 3-step fund-flow visualiser plays (debit → corridor → credit) before landing on Transactions.",
      "FX Conversion (/fx): quote → lock → Confirm Conversion → Beneficiary step → 3-stage live tracker (NGN Funded → On its way → Beneficiary received). Records an FX Conversion transaction on completion.",
      "Bulk Payments: CSV import or inline rows. On Submit Batch every row becomes an Outgoing transaction so finance can reconcile immediately.",
      "Schedule Conversion: trigger on target rate, specific date, or recurring weekly.",
      "Transactions (/transactions): the single source of truth. Every successful Funding, FX Conversion, Outgoing or Bulk row lands here in real time, with filter, search, CSV export and receipt download.",
    ],
  },
  {
    h: "Beneficiaries (/beneficiaries)",
    body: [
      "Saved global recipients with country-aware fields: ACH routing for USD, IBAN + BIC for EUR, sort code for GBP, NUBAN + BVN for NGN, and SWIFT/BIC for other corridors.",
      "Add new beneficiary is also available inline from the Send Payment dialog.",
    ],
  },
  {
    h: "Approvals & Reconciliation",
    body: [
      "/approvals: maker–checker queue for outgoing payments above policy thresholds. Statuses: Pending Approval, Approved, Rejected, Processing, Settled, Failed.",
      "/reconciliation: Settlement Approvals tab shows settlements with amount, currency, destination account, payer/invoice batch, status, requested by, and approve/reject buttons. Manual match and clarification-email actions included.",
    ],
  },
  {
    h: "Cards (/cards)",
    body: [
      "Staff cards available in the Global Merchant and Global Spend & Cards workspaces.",
      "Card types: Admissions team, Regional staff, Marketing, Travel, Events, and Operations.",
    ],
  },
  {
    h: "Importer Workspace",
    body: [
      "/importer overview, /shipments inbound tracking, /my-suppliers approved supplier list, /documents (BoL, invoices, packing lists), /landed-cost calculator, and /trade-desk + /trade-desk/$fileId trade file workspace.",
    ],
  },
  {
    h: "Freight Workspace",
    body: [
      "/freight operations board, /freight-invoices port expenses & invoicing, /customers forwarder customer book.",
    ],
  },
  {
    h: "Supplier / Exporter Workspace",
    body: [
      "/suppliers: view and edit supplier profile even after creation, KYB status, product categories.",
      "Invoice creation & sending is live. Escrow module is included (no longer 'coming soon'). Verified suppliers directory at /verified-suppliers.",
    ],
  },
  {
    h: "Global Merchant Workspace",
    body: [
      "Dashboard, Transactions tab, Payers, Payment Links, Reconciliation, Settlement Approvals, Reports, Cards.",
    ],
  },
  {
    h: "Partner Property (Baron & Cabot)",
    body: [
      "/partner dashboard, /partner/cases + /partner/cases/$caseId with FX quote generator, document checklist and escrow status.",
      "/partner/fx-quotes live ledger with expiry timer. /partner/payouts solicitor payout history. /partner/payment-links client-facing links.",
      "Plus /partner/marketers, /partner/solicitors, /partner/team, /partner/leads, /partner/new-referral, /partner/reports, /partner/settings, /partner/documents.",
      "Public payer experience at /pay/$linkId.",
    ],
  },
  {
    h: "Verification, AI & Comms",
    body: [
      "/verification-center: centralised KYB/KYC/document verification across all workspaces.",
      "/ai-insights cashflow & FX exposure insights, /ai-growth outbound assistant, /whatsapp customer comms workspace.",
    ],
  },
  {
    h: "Settings & Org",
    body: [
      "/settings user & workspace, /organization org-wide settings, /team invite members (Admin, Treasury, Finance, Compliance, Viewer), /integrations accounting / payout partner / stablecoin / webhooks, /reports management reports, /treasury corporate treasury home.",
    ],
  },
  {
    h: "Public / Tracking",
    body: [
      "/track and /track/$id public tracking link for any payment. /pay/$linkId public payer experience. /welcome, /onboarding and / for auth & onboarding.",
    ],
  },
  {
    h: "Design & UX Conventions",
    body: [
      "Semantic design tokens in src/styles.css — never hardcoded color utilities in components.",
      "Live updates use useSyncExternalStore against in-module stores (src/lib/tx-store.ts, src/lib/partner-store.ts) so changes propagate instantly across screens.",
      "All money-movement flows show a fund-flow visualiser before landing on the transactions screen so the user can see the money move.",
    ],
  },
];

function Docs() {
  const downloadMd = () => {
    const md = SECTIONS.map((s) => `## ${s.h}\n\n${s.body.map((p) => `- ${p}`).join("\n")}`).join("\n\n");
    const full = `# Canta — Product Documentation\n\n${md}\n`;
    const blob = new Blob([full], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "canta-documentation.md";
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Documentation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every workspace, module and flow shipping in Canta today.
          </p>
        </div>
        <Button variant="outline" onClick={downloadMd}>
          <Download className="h-4 w-4 mr-1.5" /> Download .md
        </Button>
      </div>

      <Card className="p-6 shadow-card space-y-6">
        <div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Canta is an enterprise cross-border payments, FX and trade platform for
            corporates, importers, freight forwarders, suppliers, global merchants and
            partner property firms.
          </p>
        </div>
        {SECTIONS.map((s) => (
          <section key={s.h} className="space-y-2">
            <h2 className="text-base font-semibold">{s.h}</h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              {s.body.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </section>
        ))}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground">
          Last updated: 2026-06-16
        </div>
      </Card>
    </div>
  );
}
