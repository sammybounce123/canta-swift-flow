import { useSyncExternalStore, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert } from "lucide-react";
import { stepUpStore, type StepUpMethod } from "@/lib/step-up";
import { SECURITY_COPY } from "@/lib/payout-security";

const METHODS: StepUpMethod[] = ["One-time code", "Admin PIN", "Demo confirm"];

export function StepUpDialog() {
  const pending = useSyncExternalStore(stepUpStore.subscribe, stepUpStore.get, () => null);
  const [method, setMethod] = useState<StepUpMethod>("Demo confirm");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (pending) {
      setMethod("Demo confirm");
      setValue("");
      setReason("");
    }
  }, [pending]);

  if (!pending) return null;
  const { request } = pending;
  const needsValue = method !== "Demo confirm";
  const blocked =
    (needsValue && value.trim().length < 4) || (request.requireReason && !reason.trim());

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) stepUpStore.resolve({ ok: false });
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" /> Security check required
          </DialogTitle>
          <DialogDescription>{SECURITY_COPY.stepUp}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md border bg-muted/30 p-3 text-xs">
            <span className="font-medium">Action:</span> {request.action}
          </div>
          <div className="flex flex-wrap gap-2">
            {METHODS.map((m) => (
              <Button
                key={m}
                type="button"
                size="sm"
                variant={method === m ? "default" : "outline"}
                onClick={() => setMethod(m)}
              >
                {m === "One-time code"
                  ? "Enter one-time code"
                  : m === "Admin PIN"
                    ? "Confirm with admin PIN"
                    : "Demo confirm"}
              </Button>
            ))}
          </div>
          {needsValue && (
            <div>
              <Label className="text-xs">
                {method === "One-time code" ? "One-time code" : "Admin PIN"}
              </Label>
              <Input
                className="mt-1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={method === "One-time code" ? "123456" : "••••"}
                aria-label={method === "One-time code" ? "One-time code" : "Admin PIN"}
              />
            </div>
          )}
          {request.requireReason && (
            <div>
              <Label className="text-xs">Reason for viewing</Label>
              <Input
                className="mt-1"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Payout verification for INV-2041"
                aria-label="Reason for viewing"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => stepUpStore.resolve({ ok: false })}>
            Cancel
          </Button>
          <Button
            disabled={blocked}
            onClick={() => stepUpStore.resolve({ ok: true, method, ...(reason ? { reason } : {}) })}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
