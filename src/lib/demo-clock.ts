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

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function demoEtaFor(status: DemoStatus, seed = 0): string {
  const now = new Date();
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
  d.setDate(d.getDate() + offsetDays[status]);
  return iso(d);
}
