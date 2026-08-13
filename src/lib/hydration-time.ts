// Hydration-safe time helpers.
//
// Rendering `Date.now()` / `new Date()` / `toLocaleTimeString()` directly in
// JSX makes the SSR output differ from the first client render, which React
// reports as a hydration mismatch. Every countdown/relative-time display must
// use `useNow()` (null until hydrated) and format stored ISO strings with the
// deterministic helpers below.

import { useEffect, useState } from "react";
import { useHydrated } from "@tanstack/react-router";

/**
 * Returns `null` on the server and during the first client render, then a
 * ticking timestamp once hydration is complete.
 */
export function useNow(intervalMs = 1000): number | null {
  const hydrated = useHydrated();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [hydrated, intervalMs]);

  return now;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");

/** Deterministic UTC date, e.g. "14 Aug 2026". Safe in SSR + hydration. */
export function formatIsoDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Deterministic UTC time, e.g. "18:42 UTC". */
export function formatIsoTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

/** Deterministic UTC date + time, e.g. "14 Aug 2026, 18:42 UTC". */
export function formatIsoDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${formatIsoDate(iso)}, ${formatIsoTime(iso)}`;
}

/** Countdown parts from a stored ISO expiry; `null` before hydration. */
export function countdownTo(iso: string, now: number | null) {
  if (now === null) return null;
  const remaining = Math.max(0, new Date(iso).getTime() - now);
  return {
    remaining,
    minutes: Math.floor(remaining / 60000),
    seconds: Math.floor((remaining % 60000) / 1000),
    expired: remaining === 0,
  };
}
