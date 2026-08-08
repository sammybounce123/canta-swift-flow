// Promise-based step-up authentication for sensitive payout actions.
// The dialog itself lives in components/security/StepUpDialog.tsx and is
// mounted once at the app root.

export type StepUpMethod = "One-time code" | "Admin PIN" | "Demo confirm";

export type StepUpRequest = {
  title: string;
  /** What the user is about to do, e.g. "Add payout account". */
  action: string;
  /** Ask for a reason (required for reveal-type actions). */
  requireReason?: boolean;
};

export type StepUpResult = {
  ok: boolean;
  method?: StepUpMethod;
  reason?: string;
};

type Pending = {
  request: StepUpRequest;
  resolve: (r: StepUpResult) => void;
};

let pending: Pending | null = null;
const subs = new Set<() => void>();
const notify = () => subs.forEach((f) => f());

export const stepUpStore = {
  get: () => pending,
  subscribe: (f: () => void) => {
    subs.add(f);
    return () => subs.delete(f);
  },
  resolve: (result: StepUpResult) => {
    const p = pending;
    pending = null;
    notify();
    p?.resolve(result);
  },
};

/** Opens the "Security check required" modal and resolves with the outcome. */
export function requestStepUp(request: StepUpRequest): Promise<StepUpResult> {
  if (typeof window === "undefined") return Promise.resolve({ ok: false });
  return new Promise<StepUpResult>((resolve) => {
    pending = { request, resolve };
    notify();
  });
}
