import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, Users } from "lucide-react";


export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "Documentation — Canta" }] }),
  component: Docs,
});

const SECTIONS: { h: string; body: string[] }[] = [
  {
    h: "Workspaces",
    body: [
      "Users pick a workspace on first sign-in. The sidebar, dashboard and default landing route are driven by the selected profile.",
      "Available profiles: Enterprise / Corporate Treasury (/treasury), Importer Portal (/importer), Freight Forwarder (/freight), Global Collections / Merchant (/collections), Supplier / Exporter — foreign suppliers in China, UAE, Turkey, India, Europe and other corridors selling to African buyers (/suppliers), Global Spend & Cards (/cards), and Partner Property — Baron & Cabot (/partner). The generic /dashboard route auto-redirects to each workspace's landing page.",
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
    h: "Verified directory logic",
    body: [
      "Importers see Verified Suppliers (/verified-suppliers) — Canta-vetted foreign suppliers in China, UAE, Turkey, India, Europe and other corridors selling to African buyers. From a supplier profile importers can request a quote, save to My Suppliers, request supplier verification before payment, request escrow on a trade file, or start a trade file directly.",
      "Suppliers / Exporters see Verified Buyers (/verified-buyers) — Canta-vetted African importer/buyer accounts. From a buyer profile suppliers can send a quote, create an invoice, request proof of funds, and offer escrow terms.",
      "Verified Buyers is mainly supplier-facing. Verified Suppliers is mainly importer-facing. Neither directory is shown as the primary discovery module to the wrong side of the trade.",
    ],
  },
  {
    h: "Cards (/cards, /treasury/cards, /importer/cards, /freight/cards)",
    body: [
      "Card purpose wizard (5 steps): purpose (Business / Travel / Trade / Student / Online Ads / Team / Personal / Shipment-Project) → user (Me / Staff / Student / Family / Team / Department) → linked entity (Project, Trade File, Shipment, Supplier, Property Case, Freight Route, Department, Customer, Wallet) → controls (daily / monthly / total / single-transaction limits, approval threshold, receipt rules, allowed/blocked categories) → review & issue.",
      "Every card supports: freeze / unfreeze, top up from linked wallet, view transactions, upload receipts, export spend reports, and view spend by user / category / project / linked entity.",
      "Workspace-aware: Treasury cards default to corporate categories; Importer cards default to Trade/Shipment links; Freight cards default to Route/Customer links; Global Spend covers everything else.",
    ],
  },
  {
    h: "Importer Workspace",
    body: [
      "Lands at /importer. Sidebar: Importer Dashboard, Trade Desk, Shipments, Verified Suppliers, My Suppliers, Documents, Landed Cost, Importer Cards, Payments, WhatsApp Updates, Reports, Support, Settings.",
      "Importer actions: request quote from verified supplier, request supplier verification before payment, save verified supplier to My Suppliers, start trade file from a supplier profile, request escrow on a trade file, request landed cost estimate, link shipments and documents to a trade file, create importer cards linked to a trade file or shipment, send WhatsApp updates and invite freight forwarders to a trade file.",
    ],
  },
  {
    h: "Freight Workspace",
    body: [
      "Lands at /freight. Operations board, /freight-invoices (Draft, Sent, Paid, Unpaid, Partially Paid, Overdue, Cancelled), /customers customer book, /freight/cards, goods-in-transit insurance panel.",
      "Freight actions: add importer customer, create shipment, update shipment status, assign shipment to staff (assignee, role, due date, note, status), create a customer tracking link, send single or bulk WhatsApp updates from 10+ templates (container loaded, vessel sailed, arrived at port, clearing started, cleared customs, out for delivery, delivered, delay notice, missing document reminder, payment reminder), create freight invoices and mark Paid / Unpaid / Overdue, download invoices, and offer goods-in-transit insurance.",
    ],
  },
  {
    h: "Supplier / Exporter Workspace",
    body: [
      "For foreign and global suppliers/exporters selling to African buyers — especially suppliers in China, UAE, Turkey, India, Europe and other trade corridors. Lands at /suppliers.",
      "Sidebar: Supplier Dashboard, Verified Buyers, Buyers, Invoices, Escrow, Settlements, Documents, Reports, Support, Settings.",
      "Supplier actions: browse Verified African buyers, view a buyer's Buyer Reliability Score, send a quote to a verified buyer, create and send an invoice, request proof of funds, offer escrow terms, and manage African buyer relationships.",
    ],
  },
  {
    h: "Global Collections / Merchant Workspace",
    body: [
      "Lands at /collections (not the generic /dashboard). Dashboard, Transactions tab, Payers, Payment Links, Reconciliation, Settlement Approvals, Reports, and Global Spend Cards.",
      "Guided collection templates at /collections/new — each template creates an invoice + payment link + payer record + reconciliation reference + settlement batch entry.",
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
    h: "AI assistance (WhatsApp + workspaces)",
    body: [
      "/whatsapp Import Desk: every conversation is summarised by Canta AI — customer name, phone, request type, shipment/BL/container/invoice numbers, linked payment case, linked trade file, missing documents, urgency, suggested next action, suggested reply and assigned Canta staff member.",
      "From an AI summary, Canta staff can: create a draft Trade File, create a draft Partner Payment Case, create a support ticket, request a missing document, send the suggested reply, escalate to compliance, or assign to a Canta staff member.",
      "Status labels on AI-managed conversations: New, Needs Reply, Missing Document, Ready for Trade File, Ready for Payment Case, Escalated, Resolved.",
      "AI is always an assistant to Canta staff — every action requires staff confirmation. Other AI surfaces: /ai-insights cashflow & FX exposure, /ai-growth outbound assistant, /ai-document-extraction OCR.",
    ],
  },
  {
    h: "Verification & Compliance",
    body: [
      "/verification-center centralised KYB/KYC/document verification across all workspaces.",
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
    h: "Partner Property — Client payment link gating (/pay/$linkId)",
    body: [
      "Funding instructions are LOCKED behind a visible incomplete checklist. The client must complete: BVN (entered by the client only), DOB, full-name confirmation, source of funds, payment purpose, 5 consents (purpose, Canta to process, use of B&C-shared KYC, terms, privacy), the FX quote must still be valid, and required documents confirmed.",
      "Baron & Cabot users can never enter BVN on behalf of the client and never see the full BVN — only BVN Pending / Submitted / Verified / Failed.",
      "On funding the client confirms amount, payer name and reference. Mismatches automatically classify the case as Funding Review with sub-status Amount Mismatch, Name Mismatch, or Payment Reference Missing. A clean match transitions to Ready for FX Conversion.",
    ],
  },
  {
    h: "FX quote & payment-link rules",
    body: [
      "Each payment link is tied to exactly one FX quote. Quote expiry voids the link. Expired links show 'Quote expired. Please request a new quote.' Generating a new FX quote recalculates the NGN payable amount.",
      "Completed links cannot be reused. Post-payout, the link is permanently retired.",
    ],
  },
  {
    h: "B&C document consent and audit trail (/partner/documents)",
    body: [
      "Baron & Cabot can upload documents already collected from the client: international passport, national ID, driver's licence, proof of address, proof of funds, property/solicitor payment instructions, source-of-funds doc, and other supporting docs.",
      "On the /pay link the client sees 'Documents already provided by Baron & Cabot', can view the list, upload missing files, and consent to Canta using the shared documents.",
      "The audit trail records every event: uploaded by B&C / uploaded by client / viewed by client / consent completed / missing-document requested / approved / rejected — each entry stamped with document type, actor, role, time, linked case and consent status.",
    ],
  },
  {
    h: "Solicitor beneficiary controls (/partner/solicitors)",
    body: [
      "All solicitor bank details are masked by default. Only Partner Admin and Finance Viewer roles can reveal them.",
      "Editing bank details forces the solicitor back to Pending Verification and writes an audit entry. Payouts cannot proceed to unverified solicitors.",
      "Statuses: Draft, Pending Verification, Verified, More Info Required, Rejected, Suspended. Solicitors can be pinned as preferred but still must be verified before payout.",
    ],
  },
  {
    h: "Commissions module (/partner/commissions)",
    body: [
      "Optional — controlled by Settings → 'Enable commission tracking'. Hidden from the sidebar when disabled.",
      "Tracks partner org, marketer, client case, payout amount, rate, estimated/approved/paid commission, status and payment date. Statuses: Estimated, Pending Approval, Approved, Paid, Withheld, Cancelled.",
      "Partner Admin sees everything; marketers see only their own attributed commission when their permission flag is enabled. CSV + PDF export supported.",
    ],
  },
  {
    h: "Guided Global Collections templates (/collections/new)",
    body: [
      "Templates: Tuition, Medical, Property, Travel, E-commerce Order, Professional Services, Supplier Invoice — each with its own dedicated field schema.",
      "On submit a template creates: invoice + payment link + payer record + reconciliation reference + settlement batch entry.",
    ],
  },
  {
    h: "Embedded insurance hooks",
    body: [
      "Optional placeholders ready to wire to AXA Mansard, Leadway, Old Mutual or AIICO. Surfaces on Importer Trade Files (cargo / goods-in-transit), Freight workspace (goods-in-transit / freight liability), Travel cards (travel insurance), and Partner Property cases (property payment protection).",
      "Each hook stores customer, linked entity, insured amount, risk type, partner, quote status and policy status.",
    ],
  },
  {
    h: "External API partner configuration (/integrations)",
    body: [
      "Payment Collection: Paystack, Flutterwave, Monnify, Stripe, Checkout.com.",
      "FX / Settlement / Payout: Wise Platform, Currencycloud, Airwallex, Nium, dLocal, Thunes.",
      "Shipment Tracking Aggregator: project44, Shipsgo, Searates, MarineTraffic.",
      "Direct Shipping Lines: Maersk Spot API, MSC, CMA CGM, Hapag-Lloyd, Cosco Shipping.",
      "Card Issuing: Marqeta, Stripe Issuing, Lithic, Bridgecard, Sudo Africa.",
      "KYC / KYB: Smile ID, Onfido, Sumsub, Veriff, Dojah, Trulioo.",
      "Sanctions / PEP / AML: ComplyAdvantage, Refinitiv World-Check, Dow Jones Risk & Compliance.",
      "WhatsApp / Messaging: Twilio WhatsApp Business API, 360dialog, Meta Cloud API, Africa's Talking, Termii.",
      "OCR / Document Extraction: Google Document AI, AWS Textract, Azure Form Recognizer, Mindee, Rossum.",
      "AI / Automation: Lovable AI Gateway (Gemini, GPT, Claude via gateway), OpenAI, Anthropic.",
      "Maps / Address Verification: Google Maps Platform, Mapbox, Loqate, what3words.",
      "CRM / Support: HubSpot, Salesforce, Zendesk, Intercom, Freshdesk.",
      "Accounting / ERP: QuickBooks Online, Xero, Sage, Oracle NetSuite, Microsoft Dynamics 365.",
      "Webhooks: outbound signed webhooks for every workspace event.",
      "Each provider card shows env (Test/Live), connection status, last sync, last webhook received, failed webhook count, error reason, fallback provider, and Retry / View Logs / Configure / Enable-Disable controls.",
    ],
  },

  {
    h: "Backend readiness data model (/data-model)",
    body: [
      "Internal reference page covering 40+ core entities: organizations, users, roles, permissions, workspaces, feature_flags, wallets, transactions, beneficiaries, approvals, trade_files, shipments, suppliers, buyers, verified_suppliers, verified_buyers, invoices, payment_links, payers, reconciliation_records, settlement_batches, cards, card_transactions, freight_customers, freight_invoices, partner_leads, partner_cases, partner_marketers, partner_fx_quotes, partner_payment_links, partner_payouts, partner_solicitors, partner_commissions, documents, verification_records, audit_logs, integrations, webhook_logs, insurance_quotes, support_tickets.",
      "Each entry documents purpose, key fields, modules, relationships, status fields and audit requirements.",
    ],
  },
  {
    h: "Support tickets (/support)",
    body: [
      "Workspace-aware ticketing. Statuses: Open, Waiting on Customer, Waiting on Canta, Escalated, Resolved, Closed.",
      "Issue types: Payment, Funding mismatch, KYC/KYB, Shipment, Card, Partner case, Payout, Technical, General enquiry.",
      "Tickets link to a case / trade file / payment / shipment and capture priority, assigned user, messages and attachments.",
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
