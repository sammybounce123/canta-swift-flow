# Canta Expansion Plan

This is a large, multi-module addition. Nothing existing will be removed. I'll layer it in across ~6 phases so each is independently usable, then wire sidebars at the end.

## Phase 1 — Trade Network foundation
- Extend `src/lib/trade-network.ts`: add `BUYERS` dataset, `COUNTRIES_BUYER`, `Buyer` type with all required fields (payment reliability score, completed tx, avg order range USD, preferred corridors, escrow readiness, dispute history, last active).
- New route `src/routes/verified-buyers.tsx` — directory + filter + profile sheet with actions: Send Quote, Create Invoice, Invite to Trade File, Request Proof of Funds, Offer Escrow Terms, Message via Canta. (File already partially exists — extend with the missing fields.)
- New route `src/routes/trade-network.tsx` — landing hub explaining "Canta Trade Network" with cards linking to Verified Suppliers, Verified Buyers, Quote Requests, Supplier Invoices, Escrow Requests, Trade Files, Payment Status, Settlement Status. Role-aware: importer view vs supplier view.
- Deepen `src/routes/verified-suppliers.tsx`: add trade references + response time SLA + factory/warehouse verification status fields to the sheet (most are present, fill the gaps).

## Phase 2 — Workspace cards
Reuse `src/components/CardsPanel.tsx` pattern. New routes:
- `src/routes/importer.cards.tsx` — procurement / inspection / samples / trade-expenses card types, linkable to trade file / shipment / supplier / cost center, with limits, approvals, receipts, freeze, spend-by views.
- `src/routes/freight.cards.tsx` — port / route / clearing / warehouse / operations / travel cards, spend by route/staff/shipment.
- `src/routes/treasury.cards.tsx` — staff / department / travel / procurement / project / ad-spend, with department/project spend views + CSV export.

Each uses a shared `<WorkspaceCards>` component in `src/components/WorkspaceCards.tsx` (configurable card types, link-to entities, spend dimensions) to avoid triplication.

## Phase 3 — Partner Property deepening
- Update `src/routes/pay.$linkId.tsx` to a 6-step wizard:
  1. Review details (partner badge, GBP/NGN, expiry countdown)
  2. Verification (BVN, DOB, name confirm, source of funds, purpose) — BVN masked after submission
  3. Documents & consent (show partner-shared docs, upload missing, consent + T&Cs + privacy)
  4. Funding instruction (gated on BVN + consent + valid quote)
  5. Track status (Awaiting Funding → … → Receipt Uploaded)
  6. Activate Canta account CTA
- Update `src/lib/partner-store.ts` to record BVN status (`Pending|Submitted|Verified|Failed`) without exposing full BVN, marketer attribution on every entity, and reassignment log.
- New route `src/routes/partner.marketer-performance.tsx` — per-marketer KPI dashboard (leads, cases, quotes, links, verifications, funding, payouts, GBP volume, conversion, AOV).
- Add reassignment action on `partner.cases.$caseId.tsx` (admin-only) writing to activity log.

## Phase 4 — Verification Center, Integrations, AI Extraction, Audit Logs
- Expand `src/routes/verification-center.tsx` with tabbed queues: Pending KYC, Pending KYB, Buyer Verif, Supplier Verif, Solicitor Verif, Partner Client Verif, High Risk, Suspended. Add sanctions/PEP/adverse-media/risk-score columns and BVN/consent status pills.
- Expand `src/routes/integrations.tsx`: 13 categories with cards showing live/test, status, last sync, last webhook, fail count, error, affected entities, fallback, retry + view-logs buttons.
- New route `src/routes/ai-document-extraction.tsx` — upload zone, document type picker, extracted-fields preview, actions: create draft Trade File / Payment Case / attach / request missing / WhatsApp follow-up / flag compliance.
- New route `src/routes/audit-logs.tsx` — table with all listed event types, filters (date/user/org/workspace/module/action/status), CSV + PDF export buttons.

## Phase 5 — Role-based nav
Update `src/lib/profile.ts` sidebar config per workspace per the spec:
- Enterprise +Company Cards
- Importer +Verified Suppliers, My Suppliers, Importer Cards
- Freight +Freight Cards
- Supplier +Verified Buyers, Escrow, Settlements (Buyers/Invoices/Documents already)
- Global Merchant: add Settlement Approvals
- Partner: add Marketers performance link
Add top-level "Trade Network" entry for Importer + Supplier workspaces.

## Phase 6 — Empty states & button audit
- Add a small `<EmptyState>` component in `src/components/EmptyState.tsx` with title + body + primary CTA, and slot it into every new module's empty cases plus existing modules with placeholder gaps.
- Sweep dead buttons in new modules — every action triggers a toast, modal, route, or status mutation.

## Technical notes
- All datasets mock-only (no Lovable Cloud needed). Each `add*` mutation updates an in-memory store with a subscribe hook so transactions/audit-log entries appear live.
- Card flows reuse existing `tx-store` pattern for spend events.
- BVN is stored only as `{ status, lastFour }`; partner views read status pill, never the raw value.
- Public `/pay/$linkId` continues to work for existing demo links; the new wizard wraps the existing transition logic.
- New routes auto-register via Tanstack file-based routing; no manual `routeTree.gen.ts` edits.

## Out of scope (intentionally not touched)
- Existing FX, transactions, beneficiary, wallets, bulk pay flows (already working per prior turns).
- Auth, Cloud, real KYC providers — all simulated.

If anything here should be re-scoped (e.g. ship Phases 1+2 first, defer 4), say which phases and I'll execute in order.
