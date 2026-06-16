# Canta UAT Fix Plan

This is a large remediation pass touching 6 workspaces plus global polish. To keep changes safe and reviewable, I'll group fixes by workspace and ship them in batches, reusing existing UI patterns (Cards, Dialogs, Tabs, sonner toasts, mock data in `src/lib/`). No backend changes — everything stays client-side mock data, matching the current app's pattern.

## Approach

- Reuse existing components (`Card`, `Dialog`, `Tabs`, `Badge`, `Button`, `Input`, `Select`, `Table`, sonner `toast`).
- Replace `WorkspacePlaceholder` "coming soon" stubs with working pages for the modules listed below.
- Add small client-side stores (similar to `partner-store.ts`) where state needs to persist across views within a session.
- Keep spelling/typography consistent with the rest of the app.

## Batch 1 — Importer Workspace
**Files:** `src/routes/importer.tsx`, new `src/components/importer/RequestEscrowDialog.tsx`, new `src/components/importer/ImporterCards.tsx`, new `src/components/importer/NewShipmentDialog.tsx`, `src/lib/importer-store.ts`

- **Request Escrow**: replace toast-only button with modal capturing trade file, supplier, invoice amt, escrow amt, currency, purpose, milestones, release condition, document upload. Submit → "Escrow request submitted for review." Add 8 escrow statuses.
- **Importer Cards** tab: create/freeze/unfreeze, link to trade file/shipment/supplier, limits, approval, receipts, spend per file.
- **Shipment form**: add VIN, AWB (optional), shipping line, type, ETA, origin, destination alongside container/BL/shipment#.

## Batch 2 — Freight Forwarder Workspace
**Files:** `src/routes/freight.tsx`, `src/routes/customers.tsx` (activate), `src/routes/freight-invoices.tsx` (activate), `src/routes/reports.tsx` (freight section), new `src/lib/freight-store.ts`, new components for Customers, Pipeline, Arriving, Invoices, Bulk WhatsApp, Assign Staff, Reports.

- **Customers**: full CRUD with all listed fields; "Add Importer Customer" button in Freight + Customers.
- **Shipment Pipeline**: editable kanban with status dropdown across 10 stages.
- **Arriving Shipments**: section with this-week / 14-day / delayed / ETA changes.
- **Freight Invoices**: real module — create, assign, link to shipment, due date, mark paid/unpaid/overdue, download, WhatsApp send.
- **Mark Paid/Unpaid** button wired with toast + status update.
- **Bulk WhatsApp Updates**: multi-select with templated messages.
- **Assign Shipments to Staff**: action on cards/detail.
- **Freight Reports**: KPIs + CSV/PDF export buttons.

## Batch 3 — Supplier / Exporter Workspace
**Files:** `src/routes/suppliers.tsx` or `verified-suppliers.tsx`, new `src/routes/supplier.profile.tsx`, `supplier.kyb.tsx`, `supplier.categories.tsx`, `supplier.invoices.tsx`, `supplier.escrow.tsx`

- **Supplier Profile**: viewable/editable even when exists.
- **KYB**: status page (6 states) + uploads.
- **Product Categories**: add/remove/primary, keywords, MOQ.
- **Invoice Module**: activated end-to-end.
- **Escrow Milestones**: view, upload evidence, request approval/release, disputes.

## Batch 4 — Global Merchant Workspace
**Files:** new `src/routes/merchant.profile.tsx`, `merchant.kyb.tsx`, `merchant.payers.tsx`, `merchant.reconciliation.tsx`, `merchant.settlements.tsx`, `merchant.staff-cards.tsx`

- **Merchant Profile + KYB** pages.
- **Payers** module activated with full fields.
- **Reconciliation** with KPIs.
- **Matched/Unmatched** tabs (All/Matched/Unmatched/Exceptions) + manual match, clarification, mark reviewed, export.
- **Settlement Approvals** tab with approve/reject and 6 statuses.
- **Merchant Staff Cards** for admissions/regional/marketing/travel/events/operations.

## Batch 5 — Global Spend Cards
**Files:** `src/routes/cards.tsx`

- Conditional **Freeze / Unfreeze** action based on status.
- Activity log: frozen by/date/reason + unfrozen by/date.
- Toast "Card unfrozen successfully."

## Batch 6 — Canta Internal Admin
**Files:** `src/routes/dashboard.tsx` or admin route(s), new `admin.customers.tsx`, `admin.disputes.tsx`, `admin.audit-logs.tsx`, `admin.settlements.tsx`, `admin.buyer-verifications.tsx`, fix existing flag/export buttons.

- **Customers tab** across all workspace types with risk + KYC/KYB status.
- **Flag High-Risk Transactions** modal (reason/category/notes/officer) → "Flagged for Review".
- **Disputes Open** → detail page with messages, evidence, actions.
- **Audit Logs viewer** (table + filters) — keep export as extra action.
- **Export Reports** — disconnect from supplier verification; add 7 report types.
- **Process Settlements** page with 5 statuses + actions.
- **Buyer Verification Requests** page with approve/reject/info/suspend.

## Batch 7 — Global Polish

- Sweep `rg` for misspellings: Ecrow, Reciept, Cutomer, Reconcillation, Expoter, Drated, Conersations, Availabe → fix in place.
- Replace remaining `WorkspacePlaceholder` "Coming soon" copy in tested modules with empty-state UI ("No records yet" + CTA).
- Audit inactive buttons: every button must open form / update status / download / route / toast / WhatsApp/email.

## Out of Scope

- No redesign, no theme changes, no new dependencies.
- No real backend — all state is mock + localStorage where persistence is needed.
- The 3 untested items (process settlements, buyer verification requests, merchant staff cards) get functional UIs but are still mock.

## Delivery Order

Batches 1 → 7 in sequence within a single response per batch where size allows, so the preview stays usable between batches. Want me to start with Batch 1 (Importer) and proceed straight through, or do you want to review each batch before I continue?