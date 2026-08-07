# Canta Expansion v3 — Implementation Plan

Scope is large but additive. No existing routes or flows removed. Below is the phased build.

## Phase 1 — Partner Property hardening (`/pay/$linkId`, partner-store, solicitors)

**`src/lib/partner-store.ts`**

- Extend `Case` with funding statuses: `Awaiting Client Funding | Funding Received | Funding Review | Amount Mismatch | Name Mismatch | Payment Reference Missing | Ready for FX Conversion`.
- Extend `Quote` with `linkId` 1:1 binding; quote expiry voids link.
- Extend `Solicitor` with statuses (`Draft | Pending Verification | Verified | More Info Required | Rejected | Suspended`), masked bank details, `pinned`, `lastVerifiedAt`.
- BVN stored only as status enum (`Pending | Submitted | Verified | Failed`) for B&C view; raw value kept in client-only verification record.
- Document audit log: `{ id, caseId, docType, action, actor, role, at, consent }`.
- Helpers: `recordFunding(caseId, { amount, payerName, reference })` auto-classifies mismatch.

**`src/routes/pay.$linkId.tsx`**

- Replace existing 4-step flow with checklist gate. Funding step is locked behind a visible incomplete checklist component listing every requirement (BVN, DOB, name confirm, source of funds, purpose, 5 consents, quote valid, docs confirmed). Each item shows ✓ / pending.
- Quote-expired and link-completed states render dedicated cards.
- "I have made the payment" collects amount/payer name/reference → `recordFunding` → routes to status screen showing mismatch reason if any.

**`src/routes/partner.cases.$caseId.tsx`**

- Show BVN status badge only (never the number).
- Show funding status timeline.
- Block "Convert FX" button unless status === `Ready for FX Conversion`.

**`src/routes/partner.solicitors.tsx`**

- Mask account numbers (last 4 only). "Reveal" gated to Partner Admin / Finance Viewer roles.
- "Edit bank details" forces status → `Pending Verification` and writes audit entry.
- Pin toggle independent of verification.

**`src/routes/partner.documents.tsx`**

- B&C upload picker for the 9 document types.
- Audit table with all 7 action types.

## Phase 2 — Commissions (optional)

- `src/lib/partner-store.ts`: add `Commission` type + status enum, `commissionsEnabled` flag in partner settings.
- `src/routes/partner.commissions.tsx`: table with filters, status pills, CSV + PDF export. Marketer role sees own attribution only.
- `src/routes/partner.settings.tsx`: add toggle "Enable commission tracking".
- `src/lib/profile.ts`: conditional sidebar entry (read from settings flag).

## Phase 3 — Guided Collection templates

- New route `src/routes/collections.new.tsx` (or in-place modal on `/collections`) with template picker (Tuition / Medical / Property / Travel / E-commerce / Professional Services / Supplier Invoice).
- Each template = its own form schema (fields listed in brief) → on submit creates mock invoice + payment link + payer + reconciliation ref + settlement batch entry (reuse `tx-store` patterns).
- File: `src/lib/collection-templates.ts` holds template definitions.

## Phase 4 — Embedded insurance hooks

- `src/lib/insurance-store.ts`: `InsuranceQuote` type + status enum, `addInsuranceHook()`.
- `src/components/InsuranceHookCard.tsx`: reusable card with "Request quote" CTA → mock status flow.
- Inject into: Trade File detail (`trade-desk.$fileId`), Freight shipment view, Travel card creation, Partner case detail.

## Phase 5 — Integrations rebuild

- `src/lib/integrations-catalog.ts`: 14 categories × providers from brief.
- Rewrite `src/routes/integrations.tsx` with category tabs, provider cards showing all required fields (env, status, last sync, webhook count, failures, fallback, retry/logs/configure/toggle actions). All actions stubbed to toast/modal.

## Phase 6 — Data model reference page

- `src/routes/data-model.tsx`: static reference table of 40+ entities with purpose / key fields / linked modules / relationships / status fields / audit. Searchable.

## Phase 7 — Support tickets

- `src/lib/support-store.ts`: ticket type, status, issue type, messages.
- `src/routes/support.tsx`: workspace-aware list + detail drawer; new-ticket modal. Seeded mock data.
- Sidebar entry added to all workspaces (Phase 8).

## Phase 8 — Workspace navigation alignment

- `src/lib/profile.ts`: rewrite each workspace's sidebar to exactly match the brief, preserving existing routes. Add Support everywhere required. Conditional Commissions for Partner. Settlement Approvals for Global Merchant already present.

## Phase 9 — Documentation refresh

- `src/routes/docs.tsx`: add sections for verification gating, B&C consent flow, quote expiry rules, solicitor controls, commissions, templates, insurance hooks, integrations catalog, data model, support.

## Out of scope

- Real KYC/insurance/payment provider integrations.
- Actual backend tables — `/data-model` is reference only.
- Editing existing FX, transactions, beneficiary, wallets, bulk pay, AI Doc Extraction, Audit Logs flows.

## Risk / notes

- `pay.$linkId.tsx` is a significant rewrite — kept inside one file, with the existing visual language and Stepper reused as a checklist.
- All new state is in-memory stores following existing `tx-store` / `partner-store` patterns; no Cloud/Supabase changes.
- New routes auto-register through file-based routing; `routeTree.gen.ts` is regenerated by the dev server.

Estimated 18–22 new/edited files.
