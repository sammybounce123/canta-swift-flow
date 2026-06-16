import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Users, BookOpen } from "lucide-react";

export const Route = createFileRoute("/user-stories")({
  head: () => ({
    meta: [
      { title: "User Stories — Canta" },
      { name: "description", content: "Persona-driven user stories for every Canta workspace, kept in sync with /docs." },
    ],
  }),
  component: UserStories,
});

type Story = { as: string; want: string; so: string };
type Group = { persona: string; route: string; tagline: string; stories: Story[] };

const GROUPS: Group[] = [
  {
    persona: "Enterprise / Corporate Treasury",
    route: "/treasury",
    tagline: "Multi-entity treasury team running wallets, FX, payouts and reconciliation.",
    stories: [
      { as: "a treasury manager", want: "to top up multi-currency wallets via bank transfer or USDT and never via card", so: "I keep funding compliant and avoid card-funding risk" },
      { as: "a treasury manager", want: "to lock an FX quote, confirm conversion, and watch the 3-stage tracker (NGN funded → on its way → beneficiary received)", so: "I always know where each conversion is" },
      { as: "a treasury manager", want: "to submit bulk payments by CSV and have every row land as an Outgoing transaction immediately", so: "finance can reconcile in real time" },
      { as: "a CFO", want: "every successful funding, FX, outgoing and bulk row to land in /transactions in real time with filter, search, CSV export and receipts", so: "I have one source of truth" },
      { as: "a treasury approver", want: "outgoing payments above policy to enter a maker–checker queue with Pending / Approved / Rejected / Processing / Settled / Failed statuses", so: "controls are enforced" },
    ],
  },
  {
    persona: "Importer Portal",
    route: "/importer",
    tagline: "African importer buying from foreign suppliers and managing trade end-to-end.",
    stories: [
      { as: "an importer", want: "to browse Verified Suppliers in China, UAE, Turkey, India and Europe", so: "I only deal with Canta-vetted foreign suppliers" },
      { as: "an importer", want: "to request a quote from a verified supplier", so: "I can compare offers without leaving Canta" },
      { as: "an importer", want: "to request supplier verification before I send any payment", so: "I do not pay an unverified supplier" },
      { as: "an importer", want: "to save a verified supplier to My Suppliers", so: "I can reuse them on future trade files" },
      { as: "an importer", want: "to start a trade file directly from a supplier profile", so: "the supplier is pre-linked to the trade" },
      { as: "an importer", want: "to request escrow on a trade file", so: "funds release only when shipment conditions are met" },
      { as: "an importer", want: "to request a landed cost estimate, link shipments and link documents to a trade file", so: "everything for a trade lives in one place" },
      { as: "an importer", want: "to create an importer card linked to a trade file or shipment", so: "spend is attributed and capped per trade" },
      { as: "an importer", want: "to invite a freight forwarder to a trade file and send WhatsApp updates", so: "all parties stay in sync" },
    ],
  },
  {
    persona: "Freight Forwarder",
    route: "/freight",
    tagline: "Freight ops team running shipments, invoices and customer comms.",
    stories: [
      { as: "a freight forwarder", want: "to add an importer customer and create shipments for them", so: "I can onboard new accounts quickly" },
      { as: "a freight forwarder", want: "to assign a shipment to staff with role, due date, note and status", so: "ownership is explicit" },
      { as: "a freight forwarder", want: "to create a customer tracking link", so: "importers can monitor a shipment without logging in" },
      { as: "a freight forwarder", want: "to send a WhatsApp shipment update from templates (container loaded, vessel sailed, arrived at port, clearing started, cleared customs, out for delivery, delivered, delay notice, missing document reminder, payment reminder)", so: "updates are consistent and fast" },
      { as: "a freight forwarder", want: "to send a bulk WhatsApp customer update", so: "I can broadcast a delay or port advisory in one action" },
      { as: "a freight forwarder", want: "to create freight invoices and mark them Paid, Unpaid, Partially Paid, Overdue or Cancelled", so: "AR is always accurate" },
      { as: "a freight forwarder", want: "to view outstanding invoices and download invoice PDFs", so: "collections are simple" },
      { as: "a freight forwarder", want: "to offer goods-in-transit insurance from quote → offer → bind → decline", so: "cargo risk is covered" },
    ],
  },
  {
    persona: "Global Collections / Merchant",
    route: "/collections",
    tagline: "Schools, hospitals, property firms, travel agencies, e-commerce, professional services and B2B merchants collecting from global payers. Default landing is /collections.",
    stories: [
      { as: "a global merchant", want: "to land on /collections by default (not the generic dashboard)", so: "my collections workspace opens directly" },
      { as: "a global merchant", want: "to pick a guided template (Tuition, Medical, Property, Travel, E-commerce Order, Professional Services, Supplier Invoice) at /collections/new", so: "I capture the right fields for my use case" },
      { as: "a global merchant", want: "each template submission to create an invoice + payment link + payer record + reconciliation reference + settlement batch entry", so: "downstream finance work is automatic" },
      { as: "a global merchant", want: "to manage Payers, Payment Links, Reconciliation, Settlement Approvals, Reports and Global Spend Cards in one workspace", so: "I run the whole collections cycle in Canta" },
    ],
  },
  {
    persona: "Supplier / Exporter",
    route: "/suppliers",
    tagline: "Foreign and global suppliers (China, UAE, Turkey, India, Europe and other corridors) selling to African buyers.",
    stories: [
      { as: "a foreign supplier", want: "to land on /suppliers with a sidebar of Supplier Dashboard, Verified Buyers, Buyers, Invoices, Escrow, Settlements, Documents, Reports, Support, Settings", so: "my workspace matches how I sell to Africa" },
      { as: "a foreign supplier", want: "to browse Verified African buyers with a Buyer Reliability Score", so: "I prioritise creditworthy buyers" },
      { as: "a foreign supplier", want: "to send a quote to a verified buyer", so: "deals start from a vetted lead" },
      { as: "a foreign supplier", want: "to create and send an invoice to a verified buyer", so: "I get paid through Canta" },
      { as: "a foreign supplier", want: "to request proof of funds from a buyer before shipping", so: "I de-risk large orders" },
      { as: "a foreign supplier", want: "to offer escrow terms on a trade", so: "the buyer is comfortable and I am protected" },
      { as: "a foreign supplier", want: "Verified Suppliers to NOT be my primary discovery module", so: "my workspace stays buyer-focused" },
    ],
  },
  {
    persona: "Global Spend & Cards",
    route: "/cards",
    tagline: "Cards across /cards, /treasury/cards, /importer/cards and /freight/cards.",
    stories: [
      { as: "a card admin", want: "a 5-step card purpose wizard (purpose → user → linked entity → controls → review)", so: "every card is issued with intent" },
      { as: "a card admin", want: "to link cards to a Project, Trade File, Shipment, Supplier, Property Case, Freight Route, Department, Customer or Wallet", so: "spend is attributed to the right entity" },
      { as: "a card admin", want: "to set daily, monthly, total and single-transaction limits, an approval threshold, receipt rules and allowed/blocked categories", so: "policy is enforced at issuance" },
      { as: "a card admin", want: "to freeze / unfreeze, top up, view transactions, upload receipts, export spend reports and view spend by user / category / project / linked entity", so: "I have full control and visibility" },
    ],
  },
  {
    persona: "Partner Property — Baron & Cabot",
    route: "/partner",
    tagline: "B&C marketers, admins, finance and compliance routing African property buyers through Canta to UK solicitors.",
    stories: [
      { as: "a B&C marketer", want: "to create a referral that generates a payment link", so: "my client can pay safely through Canta" },
      { as: "a B&C client", want: "to complete BVN entry, DOB, full-name confirmation, source of funds, payment purpose and 5 named consents before any funding instructions are shown", so: "I am only funding once compliance is satisfied" },
      { as: "a B&C client", want: "the FX quote to still be valid and required documents to be confirmed before funding instructions appear", so: "I never fund against an expired quote" },
      { as: "Canta compliance", want: "B&C users to never enter BVN on behalf of the client and to never see the raw or masked BVN — only BVN Pending / Submitted / Verified / Failed", so: "client PII stays protected" },
      { as: "a B&C marketer", want: "to see every quote, payment link, funding and payout attributed to me in /partner/marketers and /partner/commissions", so: "my book of business is transparent" },
      { as: "Canta finance", want: "expired payment links to show 'Quote expired — request a new quote.' and to refuse payment", so: "we never settle on a stale rate" },
      { as: "Canta finance", want: "funding amount, payer name and reference mismatches to classify the case as Funding Review (Amount Mismatch / Name Mismatch / Payment Reference Missing)", so: "exceptions are caught before payout" },
    ],
  },
  {
    persona: "AI Assistance",
    route: "/whatsapp",
    tagline: "Canta AI assists Canta staff. It never acts autonomously.",
    stories: [
      { as: "a Canta trade officer", want: "AI to summarise every WhatsApp conversation (customer name, phone, request type, shipment/BL/container/invoice numbers, linked payment case, linked trade file, missing documents, urgency, suggested next action, suggested reply, assigned staff)", so: "I act with full context in seconds" },
      { as: "a Canta trade officer", want: "AI to extract the next action and a suggested reply", so: "I move conversations forward without retyping" },
      { as: "a Canta trade officer", want: "AI to be able to create a draft Trade File, draft Partner Payment Case, or support ticket — pending my confirmation", so: "I get a head start, never an autonomous decision" },
      { as: "a Canta trade officer", want: "conversation statuses of New, Needs Reply, Missing Document, Ready for Trade File, Ready for Payment Case, Escalated, Resolved", so: "the inbox always reflects real workflow state" },
      { as: "a CFO", want: "/ai-insights cashflow and FX exposure and /ai-document-extraction OCR across the platform", so: "AI augments treasury and ops decisions" },
    ],
  },
  {
    persona: "Integrations",
    route: "/integrations",
    tagline: "Real provider examples per category. Each card shows env, connection, last sync, last/failed webhooks, fallback and controls.",
    stories: [
      { as: "an admin", want: "Payment Collection options including Paystack, Flutterwave, Monnify, Stripe and Checkout.com", so: "I collect via local rails" },
      { as: "an admin", want: "FX / Settlement / Payout options including Wise Platform, Currencycloud, Airwallex, Nium, dLocal and Thunes", so: "global payout is plug-and-play" },
      { as: "an admin", want: "Shipment Tracking via project44, Shipsgo, Searates and MarineTraffic", so: "I aggregate carrier data" },
      { as: "an admin", want: "Direct Shipping Line integrations for Maersk Spot, MSC, CMA CGM, Hapag-Lloyd and Cosco", so: "I book and track at source" },
      { as: "an admin", want: "Card Issuing via Marqeta, Stripe Issuing, Lithic, Bridgecard or Sudo Africa", so: "I pick the right issuer per region" },
      { as: "an admin", want: "KYC/KYB via Smile ID, Onfido, Sumsub, Veriff, Dojah or Trulioo", so: "I verify customers globally" },
      { as: "an admin", want: "AML/PEP via ComplyAdvantage, Refinitiv World-Check or Dow Jones Risk & Compliance", so: "sanctions screening is institutional grade" },
      { as: "an admin", want: "WhatsApp via Twilio, 360dialog, Meta Cloud API, Africa's Talking or Termii", so: "messaging is reliable per corridor" },
      { as: "an admin", want: "OCR via Google Document AI, AWS Textract, Azure Form Recognizer, Mindee or Rossum", so: "documents extract automatically" },
      { as: "an admin", want: "AI via Lovable AI Gateway (Gemini, GPT, Claude), OpenAI and Anthropic", so: "the right model for the task" },
      { as: "an admin", want: "Maps via Google Maps Platform, Mapbox, Loqate or what3words", so: "addresses are verified" },
      { as: "an admin", want: "CRM/Support via HubSpot, Salesforce, Zendesk, Intercom or Freshdesk and Accounting via QuickBooks, Xero, Sage, NetSuite or Dynamics 365", so: "Canta sits inside our existing stack" },
    ],
  },
];

function UserStories() {
  const downloadMd = () => {
    const md = GROUPS.map((g) =>
      `## ${g.persona}\n_${g.tagline}_\nDefault route: \`${g.route}\`\n\n` +
      g.stories.map((s) => `- **As ${s.as}**, I want ${s.want} **so that** ${s.so}.`).join("\n")
    ).join("\n\n");
    const full = `# Canta — User Stories\n\n${md}\n`;
    const blob = new Blob([full], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "canta-user-stories.md";
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> User Stories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Persona-driven stories for every Canta workspace — kept in sync with the product documentation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/docs"><BookOpen className="h-4 w-4 mr-1.5" /> Documentation</Link>
          </Button>
          <Button variant="outline" onClick={downloadMd}>
            <Download className="h-4 w-4 mr-1.5" /> Download .md
          </Button>
        </div>
      </div>

      {GROUPS.map((g) => (
        <Card key={g.persona} className="p-6 shadow-card space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">{g.persona}</h2>
            <Badge variant="outline" className="font-mono text-[10px]">{g.route}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{g.tagline}</p>
          <ul className="space-y-2 text-sm">
            {g.stories.map((s, i) => (
              <li key={i} className="leading-snug">
                <span className="text-muted-foreground">As</span>{" "}
                <span className="font-medium">{s.as}</span>
                <span className="text-muted-foreground">, I want</span>{" "}
                {s.want}{" "}
                <span className="text-muted-foreground">so that</span>{" "}
                <span className="italic">{s.so}.</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <div className="text-xs text-muted-foreground">Last updated: 2026-06-16</div>
    </div>
  );
}
