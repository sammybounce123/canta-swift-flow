// Demo clock: derive shipment ETA/arrival dates relative to "now" so demo data
// never contradicts itself (e.g. an "On Vessel" shipment appearing to have
// arrived weeks ago). Status invariants enforced:
//   Booked      → future ETA (10–30 days out)
//   At Origin   → future ETA (7–20 days out)
//   Loaded      → future ETA (5–15 days out)
//   On Vessel   → future ETA (3–12 days out)
//   Delayed     → future ETA (5–20 days out)
//   Arrived     → past arrival (0–3 days ago), same-day ETA
//   Customs     → past arrival (1–5 days ago)
//   Released    → past arrival (3–7 days ago)
//   Delivered   → past arrival (5–14 days ago)

export type DemoStatus =
  | "Booked" | "At Origin" | "Loaded" | "On Vessel"
  | "Arrived" | "Customs" | "Released" | "Delivered" | "Delayed";

// Fallback anchor: if the runtime clock is unavailable / stubbed to Unix epoch
// (as can happen in some prerender / edge-worker cold starts), use this fixed
// anchor so demo dates never resolve to 1969/1970. Update as the demo ages.
const DEMO_CLOCK_FALLBACK = new Date("2026-07-01T00:00:00Z");
const MIN_VALID_MS = new Date("2020-01-01T00:00:00Z").getTime();

function safeNow(): Date {
  const t = Date.now();
  if (!Number.isFinite(t) || t < MIN_VALID_MS) return new Date(DEMO_CLOCK_FALLBACK);
  const d = new Date(t);
  if (Number.isNaN(d.getTime()) || d.getUTCFullYear() < 2020) return new Date(DEMO_CLOCK_FALLBACK);
  return d;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function demoEtaFor(status: DemoStatus, seed = 0): string {
  const now = safeNow();
  // deterministic offset from seed so re-renders don't jump
  const jitter = (min: number, max: number) => min + (Math.abs(Math.sin(seed + status.length)) * (max - min));
  const offsetDays: Record<DemoStatus, number> = {
    Booked:     Math.round(jitter(10, 30)),
    "At Origin": Math.round(jitter(7, 20)),
    Loaded:     Math.round(jitter(5, 15)),
    "On Vessel": Math.round(jitter(3, 12)),
    Delayed:    Math.round(jitter(5, 20)),
    Arrived:    -Math.round(jitter(0, 3)),
    Customs:    -Math.round(jitter(1, 5)),
    Released:   -Math.round(jitter(3, 7)),
    Delivered:  -Math.round(jitter(5, 14)),
  };
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + offsetDays[status]);
  return iso(d);
}
