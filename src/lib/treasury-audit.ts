// Lightweight shared audit-trail store used across ops/admin surfaces
// (compliance flags, disputes, verification actions, etc). Pure
// client-side/localStorage — no backend. Not treasury-specific in scope,
// but kept under the `treasury-` prefix per project file-naming rules.

export type AuditResult = "Success" | "Pending" | "Failed";

export type AuditEntry = {
  id: string;
  ts: string;
  actor: string;
  workspace: string;
  action: string;
  entity: string;
  result: AuditResult;
  detail?: string;
};

const KEY = "canta:audit:log:v1";

function nowStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function getAuditEntries(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

export function addAuditEntry(entry: Omit<AuditEntry, "id" | "ts">): AuditEntry {
  const full: AuditEntry = {
    id: `AUD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    ts: nowStamp(),
    ...entry,
  };
  if (typeof window !== "undefined") {
    const list = [full, ...getAuditEntries()].slice(0, 500);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* noop */
    }
    window.dispatchEvent(new Event("canta-audit-change"));
  }
  return full;
}

export function subscribeAudit(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("canta-audit-change", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("canta-audit-change", cb);
    window.removeEventListener("storage", cb);
  };
}
