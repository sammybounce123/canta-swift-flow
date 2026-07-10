/**
 * Demo Supplier Persona seeding.
 *
 * The investor demo ships with a pre-verified supplier persona ("Li Wei —
 * Guangzhou Tech Factory") so the /supplier-portal dashboard opens directly.
 * The real KYB gate in AppShell (`canta:kyb:supplier_dashboard === "done"`)
 * is still enforced — this helper simply pre-populates the demo persona's
 * approval flags, mirroring what a genuinely verified supplier would have.
 *
 * A new / unverified supplier who has not been seeded through this helper
 * still hits `/kyb-onboarding?workspace=supplier_dashboard`.
 */
export const DEMO_SUPPLIER_PERSONA_KEY = "canta:persona";
export const DEMO_SUPPLIER_PERSONA_VALUE = "supplier_demo";

export function seedDemoSupplierPersona(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("canta:active_workspace", "supplier_dashboard");
    window.localStorage.setItem("canta:mode", "Supplier");
    window.localStorage.setItem("canta:kyb:supplier_dashboard", "done");
    window.localStorage.setItem("canta:payout:supplier_dashboard", "verified");
    window.localStorage.setItem(DEMO_SUPPLIER_PERSONA_KEY, DEMO_SUPPLIER_PERSONA_VALUE);
    window.dispatchEvent(new Event("canta:mode-change"));
  } catch {
    /* localStorage disabled — no-op */
  }
}

export function isDemoSupplierPersona(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEMO_SUPPLIER_PERSONA_KEY) === DEMO_SUPPLIER_PERSONA_VALUE;
  } catch {
    return false;
  }
}
