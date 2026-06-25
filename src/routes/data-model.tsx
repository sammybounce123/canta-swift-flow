import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Database, Search } from "lucide-react";

export const Route = createFileRoute("/data-model")({
  head: () => ({ meta: [{ title: "Data Model — Canta" }] }),
  component: DataModelPage,
});

type Entity = { name: string; purpose: string; keyFields: string[]; modules: string[]; relationships: string[]; statusFields?: string[]; audit?: boolean };

const ENTITIES: Entity[] = [
  { name: "organizations", purpose: "Tenant/business account on Canta", keyFields: ["id", "name", "country", "type", "kyb_status"], modules: ["All"], relationships: ["users", "workspaces"], statusFields: ["kyb_status"], audit: true },
  { name: "users", purpose: "Authenticated individuals", keyFields: ["id", "email", "phone", "org_id"], modules: ["All"], relationships: ["roles", "organizations"], audit: true },
  { name: "roles", purpose: "Named role definitions", keyFields: ["id", "name", "scope"], modules: ["Governance"], relationships: ["users", "permissions"] },
  { name: "permissions", purpose: "Atomic capability grants", keyFields: ["id", "code"], modules: ["Governance"], relationships: ["roles"] },
  { name: "workspaces", purpose: "Per-org workspace (Treasury, Importer, etc.)", keyFields: ["id", "type", "org_id"], modules: ["All"], relationships: ["organizations"] },
  { name: "feature_flags", purpose: "Per-org/per-workspace toggles", keyFields: ["key", "value", "scope"], modules: ["Settings"], relationships: ["organizations"] },
  { name: "wallets", purpose: "Multi-currency balances", keyFields: ["id", "org_id", "ccy", "balance"], modules: ["Treasury"], relationships: ["organizations", "transactions"], audit: true },
  { name: "transactions", purpose: "Single ledger of all money movement", keyFields: ["id", "type", "amount", "ccy", "status"], modules: ["Treasury", "Collections", "Partner"], relationships: ["wallets", "beneficiaries"], statusFields: ["status"], audit: true },
  { name: "beneficiaries", purpose: "Saved global recipients", keyFields: ["id", "name", "ccy", "bank_details"], modules: ["Treasury"], relationships: ["transactions"], statusFields: ["verification_status"], audit: true },
  { name: "approvals", purpose: "Maker–checker queue", keyFields: ["id", "entity_ref", "status", "approver"], modules: ["Governance"], relationships: ["transactions"], statusFields: ["status"], audit: true },
  { name: "trade_files", purpose: "Importer trade workspace", keyFields: ["id", "supplier_id", "incoterm", "status"], modules: ["Importer"], relationships: ["shipments", "suppliers", "documents"], statusFields: ["status"], audit: true },
  { name: "shipments", purpose: "Container/cargo tracking", keyFields: ["id", "container_no", "carrier", "eta"], modules: ["Importer", "Freight"], relationships: ["trade_files"], statusFields: ["status"], audit: true },
  { name: "suppliers", purpose: "Importer's supplier book", keyFields: ["id", "name", "country", "kyb_status"], modules: ["Importer"], relationships: ["trade_files"], statusFields: ["kyb_status"] },
  { name: "buyers", purpose: "Supplier's buyer book", keyFields: ["id", "name", "country"], modules: ["Supplier"], relationships: ["invoices"] },
  { name: "verified_suppliers", purpose: "Canta-verified supplier directory", keyFields: ["id", "supplier_id", "verified_at"], modules: ["Trade Network"], relationships: ["suppliers"], statusFields: ["verification_status"] },
  { name: "verified_buyers", purpose: "Canta-verified buyer directory", keyFields: ["id", "buyer_id", "verified_at"], modules: ["Trade Network"], relationships: ["buyers"], statusFields: ["verification_status"] },
  { name: "invoices", purpose: "Issued invoices to payers", keyFields: ["id", "payer_id", "amount", "ccy"], modules: ["Collections", "Supplier"], relationships: ["payment_links", "payers"], statusFields: ["status"], audit: true },
  { name: "payment_links", purpose: "Shareable links to fund an invoice", keyFields: ["id", "invoice_id", "url", "status"], modules: ["Collections", "Partner Property"], relationships: ["invoices", "partner_fx_quotes"], statusFields: ["status"], audit: true },
  { name: "payers", purpose: "Anyone funding an invoice/link", keyFields: ["id", "name", "country", "kyc_level"], modules: ["Collections"], relationships: ["invoices"], statusFields: ["kyc_level"] },
  { name: "reconciliation_records", purpose: "Funds-in matched to invoices", keyFields: ["id", "amount", "matched", "diff"], modules: ["Collections"], relationships: ["invoices", "transactions"], statusFields: ["status"] },
  { name: "settlement_batches", purpose: "Outbound settlement batches", keyFields: ["id", "ccy", "amount", "expected_at"], modules: ["Collections", "Supplier"], relationships: ["transactions"], statusFields: ["status"], audit: true },
  { name: "freight_customers", purpose: "Forwarder's customer book", keyFields: ["id", "name", "contact"], modules: ["Freight"], relationships: ["freight_invoices", "shipments"] },
  { name: "freight_invoices", purpose: "Port expenses & freight charges", keyFields: ["id", "customer_id", "amount"], modules: ["Freight"], relationships: ["shipments"], statusFields: ["status"] },
  { name: "partner_leads", purpose: "Property referral leads", keyFields: ["id", "client", "marketer_id"], modules: ["Partner Property"], relationships: ["partner_cases"], statusFields: ["status"] },
  { name: "partner_cases", purpose: "Active property payment cases", keyFields: ["id", "ref", "client", "amount_gbp"], modules: ["Partner Property"], relationships: ["partner_fx_quotes", "partner_payouts", "documents"], statusFields: ["status"], audit: true },
  { name: "partner_marketers", purpose: "B&C marketer attribution", keyFields: ["id", "name", "manager_id"], modules: ["Partner Property"], relationships: ["partner_cases", "partner_commissions"] },
  { name: "partner_fx_quotes", purpose: "Time-limited FX quotes", keyFields: ["id", "case_id", "rate", "expires_at"], modules: ["Partner Property"], relationships: ["partner_payment_links"], statusFields: ["status"], audit: true },
  { name: "partner_payment_links", purpose: "Client-facing payment links", keyFields: ["id", "quote_id", "url", "status"], modules: ["Partner Property"], relationships: ["partner_cases"], statusFields: ["status"], audit: true },
  { name: "partner_payouts", purpose: "Solicitor outbound payouts", keyFields: ["id", "case_id", "amount_gbp", "ref"], modules: ["Partner Property"], relationships: ["partner_solicitors"], statusFields: ["status"], audit: true },
  { name: "partner_solicitors", purpose: "Solicitor beneficiaries", keyFields: ["id", "firm", "iban", "swift"], modules: ["Partner Property"], relationships: ["partner_payouts"], statusFields: ["verification_status"], audit: true },
  { name: "partner_commissions", purpose: "Optional commission tracking", keyFields: ["id", "case_id", "marketer_id", "rate"], modules: ["Partner Property"], relationships: ["partner_marketers"], statusFields: ["status"], audit: true },
  { name: "documents", purpose: "Files attached across modules", keyFields: ["id", "type", "url", "linked_ref"], modules: ["All"], relationships: ["trade_files", "partner_cases", "invoices"], statusFields: ["status"], audit: true },
  { name: "verification_records", purpose: "KYC/KYB/document verification outcomes", keyFields: ["id", "subject_ref", "outcome"], modules: ["Verification Center"], relationships: ["organizations", "partner_cases"], statusFields: ["outcome"], audit: true },
  { name: "audit_logs", purpose: "Immutable event log", keyFields: ["id", "actor", "action", "entity", "at"], modules: ["All"], relationships: ["organizations"], audit: true },
  { name: "integrations", purpose: "Connected external providers", keyFields: ["id", "provider", "env", "status"], modules: ["Integrations"], relationships: ["webhook_logs"], statusFields: ["status"], audit: true },
  { name: "webhook_logs", purpose: "Inbound/outbound webhook delivery", keyFields: ["id", "integration_id", "status", "payload"], modules: ["Integrations"], relationships: ["integrations"], statusFields: ["status"], audit: true },
  { name: "insurance_quotes", purpose: "Embedded insurance hooks", keyFields: ["id", "linked_ref", "partner", "amount"], modules: ["Insurance", "Importer", "Freight", "Partner Property"], relationships: ["trade_files", "shipments", "partner_cases"], statusFields: ["quote_status", "policy_status"] },
  { name: "support_tickets", purpose: "Customer & partner tickets", keyFields: ["id", "ref", "customer", "status"], modules: ["Support"], relationships: ["organizations"], statusFields: ["status"], audit: true },
];

function DataModelPage() {
  const [q, setQ] = useState("");
  const filtered = ENTITIES.filter((e) => !q || `${e.name} ${e.purpose} ${e.modules.join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Data model reference</h1>
          <p className="text-sm text-muted-foreground mt-1">Core backend entities — used by product & engineering to plan the real persistence layer.</p>
        </div>
        <div className="relative w-80 max-w-full">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Search entities…" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((e) => (
          <Card key={e.name} className="p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="font-mono text-sm font-semibold">{e.name}</div>
              {e.audit && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">audited</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{e.purpose}</p>
            <div className="mt-3 space-y-2 text-xs">
              <Row k="Key fields" v={e.keyFields.join(", ")} mono />
              <Row k="Modules" v={e.modules.join(", ")} />
              <Row k="Relationships" v={e.relationships.join(", ")} mono />
              {e.statusFields && <Row k="Status fields" v={e.statusFields.join(", ")} mono />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className={`mt-0.5 ${mono ? "font-mono text-[11px]" : ""}`}>{v}</div>
    </div>
  );
}
