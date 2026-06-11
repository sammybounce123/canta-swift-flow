# Baron & Cabot — FX Quote & Client Payment Link Flow

## Scope
Expand the existing Partner Property Payments workspace with a full partner-initiated payment journey: case → KYC upload → FX quote → secure client payment link → lightweight client verification (BVN, consent) → funding instruction → FX conversion → solicitor payout → receipt → optional Canta activation. Plus audit trail, role-based KPIs, and updated sidebar.

All data is mocked client-side (localStorage + in-memory) — no backend changes. UI only, consistent with existing premium property-focused styling.

## Data model changes (`src/lib/partner.ts`)
- Extend `CaseStatus` to the full 23-status list (Draft → Completed, Failed/Returned, Cancelled, Expired Quote, BVN states, etc.) and update `statusTone`.
- Add types: `FxQuote`, `PaymentLink`, `ClientVerification`, `CaseDocument`, `FundingRecord`, `ActivityLogEntry`, `ClientActivation`.
- Extend `PaymentCase` with: `paymentPurpose`, `paymentDeadline`, `createdBy`, `clientSource`, `documents[]`, `quotes[]`, `activeQuoteId`, `paymentLink`, `verification`, `funding`, `payout`, `activation`, `activity[]`.
- Add helpers: `createCase`, `addDocument`, `generateQuote(caseId, validity)`, `expireQuote`, `generatePaymentLink`, `submitClientVerification`, `recordFunding`, `markPaidToSolicitor`, `appendActivity`, `inviteClientToCanta`.
- Persist mutations to `localStorage` (`canta:partner:cases`) so the flow survives reloads; hydrate from seed on first load.

## Routes (new + updated)
New:
- `src/routes/partner.fx-quotes.tsx` — list of all quotes with status, expiry countdown, regenerate.
- `src/routes/partner.payment-links.tsx` — list of links with copy/send/expire actions.
- `src/routes/partner.team.tsx` — team roster (uses MARKETERS).
- `src/routes/partner.settings.tsx` — workspace + permission toggles (presentation).
- `src/routes/pay.$linkId.tsx` — **public** client-facing branded payment page with 4 steps: Review → Verification (BVN, DOB, consent) → Documents/Confirm → Funding instruction → Receipt + Canta activation CTA.

Updated:
- `src/routes/partner.cases.$caseId.tsx` — add tabs: Overview, Documents, FX Quote, Payment Link, Verification, Funding, Payout, Activity. Buttons: Upload KYC, Generate FX Quote (validity selector), Generate Payment Link, Copy/Send Link, Mark Funding Received, Mark Paid to Solicitor, Upload Receipt, Invite to Canta. Hide full BVN (show status only).
- `src/routes/partner.new-referral.tsx` — extend form with new fields (purpose, deadline, document uploads, proof of funds, notes); auto-tag partner/source/createdBy.
- `src/routes/partner.index.tsx` — refresh KPI cards for admin and marketer per spec.
- `src/routes/partner.payouts.tsx` — add payout-status filters (Pending, Processing, Paid, Failed, Returned, Receipt Uploaded).
- `src/routes/partner.solicitors.tsx` — flag bank-detail edits as requiring re-verification.
- `src/lib/profile.ts` — update `partner_property` sidebar to the new 13-item list.

## Client payment page (`/pay/$linkId`)
Public route (no auth gate). Renders:
1. Branded header "Canta × Baron & Cabot Property Payment", quote countdown.
2. Review card: client, property, solicitor firm, GBP→NGN, fee, expiry.
3. Verification step: BVN (masked input), DOB, name confirm, source-of-funds, 4 consent checkboxes, explicit "Baron & Cabot will not enter this for you" notice.
4. Documents step: list partner-uploaded docs, allow client to add missing, confirm consent.
5. Funding instruction (only after verification complete & quote valid): dedicated Canta account, amount, reference, expiry timer, warnings.
6. Success/Receipt step + "Activate full Canta account" CTA.

If quote expired, show "Quote expired — please contact Baron & Cabot for a new quote" and block funding.

## RBAC & privacy
- Reuse `usePartnerRole` + `visibleCases` / `visibleLeads`.
- Add `canSeeBVN` (always false for partner roles — only show status).
- Marketer KPIs filter by `assignedMarketerId === user.id`.
- Solicitor bank details gated by `canSeeSolicitorBankDetails`.

## Audit trail
Every mutation appends `ActivityLogEntry { action, timestamp, userId, role, fromStatus?, toStatus?, notes? }` via `appendActivity`. Activity tab renders timeline with role badges.

## Out of scope
- Real BVN verification, real FX rates, real banking rails, real payment webhooks — all simulated.
- Backend persistence (Lovable Cloud) — keep client-side mock per existing pattern.
- Reports page deep redesign beyond KPI parity.

## Technical notes
- Single source of truth in `src/lib/partner.ts` with a tiny pub/sub (`window.dispatchEvent('partner-data-change')`) so list views refresh after mutations.
- New `useCaseStore(caseId)` hook in `src/hooks/usePartnerCases.ts` returns live case + helpers.
- Countdown timers via `setInterval` 1s ticking local component state.
- No new packages required.
