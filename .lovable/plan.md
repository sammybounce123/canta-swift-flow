# Canta Forensic Improvements Plan

Scope is large but additive — no pages/modules are removed. Work is grouped into 8 focused passes that ship sequentially so the app stays buildable between steps.

---

## 1. Onboarding Pass

**Goal:** A proper "What best describes you?" page after Get Started with large workspace cards.

- Rebuild `src/routes/welcome.tsx` into a full-bleed onboarding screen with 7 large cards (Enterprise, Importer, Freight Forwarder, Supplier, University/Global Merchant, Card User, Canta Internal Staff).
- Each card shows: **who it's for**, **what they can do** (3 bullets), **primary CTA**, **route destination chip**.
- Extend `src/lib/profile.ts` `UserProfile` to persist:
  `account_type`, `workspace_type`, `customer_segment`, `primary_use_case`, `organization_id`, `role`, `permissions[]`.
- "Get Started" CTA on `/` already routes to `/welcome` — verify and tighten copy.

---

## 2. Workspace-Based Sidebar Pass

**Goal:** Each workspace sees only its own modules; the seven required menu lists below are enforced exactly.

Refactor `src/components/AppShell.tsx` so sidebar items are produced by `getSidebarForWorkspace(workspace, flags)` defined in `src/lib/profile.ts`. Per-workspace lists:

- **Importer:** Dashboard, Trade Desk, Shipments, Verified Suppliers, My Suppliers, Documents, Landed Cost, Payments, Importer Cards, WhatsApp Updates, Team, Settings.
- **Freight Forwarder:** Dashboard, Freight Workspace, Customers, Shipments, Documents, Freight Invoices, WhatsApp Updates, Freight Cards, Reports, Team, Settings.
- **Supplier:** Dashboard, Supplier Dashboard, Verified Buyers, Buyers, Invoices, Escrow, Settlements, Documents, Reports, Team, Settings.
- **University / Global Merchant:** Dashboard, Global Collections, Payment Links, Invoices, Payers, Settlements, Reconciliation, Reports, Staff Cards, Compliance Pack, Team, Settings.
- **Enterprise:** Dashboard, Enterprise Treasury, Wallets, FX Conversion, Beneficiaries, Transactions, Approvals, Company Cards, Compliance Pack, Reports, Team, Settings.
- **Canta Internal Staff:** Admin Dashboard, AI Growth, WhatsApp Desk, Trade Desk, Shipments, Freight Workspace, Supplier Dashboard, Global Collections, Global Spend Cards, Compliance Pack, Integrations, Approvals, Team, Settings.
- **Card User:** Dashboard, Global Spend Cards, Transactions, Settings (keep existing minimal set).

Sidebar still respects `ModeProvider` for the demo mode switcher and feature flags.

Add lightweight stub routes where missing (`/payments`, `/landed-cost`, `/payment-links`, `/payers`, `/reconciliation`, `/reports`, `/escrow`, `/invoices`, `/customers`, `/freight-invoices`, `/documents`, `/my-suppliers`, `/buyers`) so navigation never 404s. Each stub uses `AppShell` and a "Coming soon — module placeholder" card with section overview.

---

## 3. Trade File Detail Pass

**Goal:** Trade File rows are clickable and open a tabbed detail page.

- `src/routes/trade-desk.$fileId.tsx` already exists; expand it to a polished tabbed detail with: Overview, Shipment Timeline, Supplier, Freight Forwarder, Documents, Payments, Escrow, Landed Cost, WhatsApp History, Activity Log, Compliance.
- Overview header surfaces: importer, supplier, freight forwarder, route, goods category, invoice amount, FX rate, payment status, shipment status, ETA, next action, risk level, missing documents count, landed cost summary, escrow status.
- Wire `trade-desk.index.tsx` rows with `<Link to="/trade-desk/$fileId" params>` (no `<a href>`).

---

## 4. Canta Trade Network Pass

**Goal:** Polish existing directories and Verification Center against the requirements list.

- `src/routes/verified-suppliers.tsx`: ensure cards expose factory/address verification, bank verification, completed tx, dispute history, response time, escrow eligibility, **Request Quote** and **Start Trade File** buttons.
- `src/routes/verified-buyers.tsx`: ensure cards expose payment reliability score, completed tx, avg order size range, escrow history, dispute record, **Send Quote** and **Create Invoice** buttons.
- `src/routes/verification-center.tsx`: review queue tabs for supplier requests, buyer requests, business docs, bank verification, trade references, sanctions/PEP/adverse media, disputes, suspension.

---

## 5. Importer Portal Depth Pass

**Goal:** Landed cost and profit prominent on each shipment.

- Update `src/routes/importer.tsx` and `src/routes/shipments.tsx` shipment cards to show: estimated landed cost, expected selling price, expected profit, missing cost items, clearing estimate, "prepare clearing by" date, risk warning.
- Hero copy: *"Know your real cost before your goods arrive."*

---

## 6. Freight Workspace Actions Pass

**Goal:** Operational action toolbar.

- In `src/routes/freight.tsx` add an actions row + per-shipment menu with: Send bulk update, Create invoice, Mark document received, Assign to staff, Add clearing note, Create tracking link, Request payment, Escalate delay. Hook to `toast` for now.

---

## 7. Cards Embedded in Workspaces Pass

**Goal:** Cards surface inside each workspace, linked to that workspace's entities.

- New `src/components/WorkspaceCardsPanel.tsx` with variants: `company`, `importer`, `freight`, `staff` showing card sets linked to (respectively) departments+cost centers, trade files+shipments+suppliers+staff+cost centers, routes+branches+port expenses+shipments+staff, departments+admissions+regional offices+travel.
- Embed the panel in `treasury.tsx` (company), `importer.tsx` (importer), `freight.tsx` (freight), `collections.tsx` (staff).

---

## 8. Team Hierarchy + Integrations Pass

- `src/routes/team.tsx`: add Organization → Branches → Departments → Teams → Users tree, Roles & Permissions matrix, Cost Centers, Approval Workflows sections. Admin actions: invite, assign dept/branch/cost center, assign role, set permissions, deactivate, view activity, create approval workflow (modal stubs + toasts).
- `src/routes/integrations.tsx`: each integration card now shows product module using it, live/test mode badge, last sync time, error reason, affected shipments/payments count, fallback provider, retry button.

---

## Technical Notes

- All new routes are TanStack file-based and registered via `routeTree.gen.ts` edits matching existing manual pattern.
- Sidebar derives from `MODE_TO_WORKSPACE[mode]` so demo mode switching still works.
- No business logic / backend changes — all data is mock from `src/lib/*`.
- Tailwind + existing shadcn primitives only; no new deps.
- Reuse design tokens already in `src/styles.css`; no hard-coded colors.

## Out of Scope

- No deletions of existing routes/components.
- No auth/RLS work (Cloud not required for this pass).
- No real WhatsApp/FX/escrow integration — UI + mock data only.