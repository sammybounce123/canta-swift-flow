import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  formatFx,
  formatNgn,
  passComplianceAndConvert,
  simulateProviderConfirmation,
  usePartnerPayments,
} from "@/lib/partner-payments";
import {
  decideFlag,
  getKyc,
  lockCase,
  opsAcceptIdentity,
  useKycState,
} from "@/lib/partner-kyc";
import { formatIsoDateTime } from "@/lib/hydration-time";

const OPS_USER = "Canta Ops (demo)";

/**
 * Ops-side review of partner client payment cases: consent, identity outcome,
 * compliance flags and settlement. Partner staff cannot perform these actions.
 */
export function PartnerComplianceQueue() {
  const { cases } = usePartnerPayments();
  useKycState();

  const rows = cases
    .map((c) => ({ kase: c, kyc: getKyc(c.id, c.linkId) }))
    .filter(
      ({ kase, kyc }) =>
        kyc.consent ||
        kyc.identity ||
        kyc.payment ||
        kase.ngnReceived ||
        kase.status === "Compliance Review",
    );

  return (
    <Card className="p-5 shadow-card space-y-3">
      <div>
        <h2 className="font-medium text-sm">Partner compliance & settlement queue</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Client consent and identity are captured on the secure payment link. Ops approves flags,
          converts NGN and confirms the solicitor payout.
        </p>
      </div>

      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground">No partner cases awaiting review.</p>
      )}

      <div className="space-y-3">
        {rows.map(({ kase, kyc }) => {
          const openFlags = kyc.flags.filter(
            (f) => f.state === "Open" || f.state === "Escalated",
          );
          return (
            <div key={kase.id} className="rounded-lg border p-3 space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{kase.id}</span>
                <span className="text-muted-foreground text-xs">{kase.clientName}</span>
                <Badge variant="outline" className="text-[10px]">
                  {kase.status}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {kyc.linkStatus}
                </Badge>
                {kyc.locked && (
                  <Badge variant="outline" className="text-[10px] text-destructive">
                    Locked
                  </Badge>
                )}
                <span className="ml-auto text-xs tabular-nums">
                  {formatNgn(kase.quote.ngnTotal)} →{" "}
                  {formatFx(kase.quote.payoutAmount, kase.payoutCurrency)}
                </span>
              </div>

              <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                <span>
                  Consent:{" "}
                  {kyc.consent
                    ? `${formatIsoDateTime(kyc.consent.timestamp)} · ${kyc.consent.consentTextVersion}`
                    : "Not given"}
                </span>
                <span>
                  Identity:{" "}
                  {kyc.identity
                    ? `${kyc.identity.status} · ${kyc.identity.method} ${kyc.identity.maskedRef} · selfie ${kyc.identity.selfieResult}`
                    : "Not submitted"}
                </span>
                <span>
                  Payment:{" "}
                  {kyc.payment
                    ? `${formatNgn(kyc.payment.amountNgn)} · ${kyc.payment.variance}`
                    : "Not received"}
                </span>
                <span>Case account: {kyc.account?.accountNumber ?? "Not generated"}</span>
              </div>

              {openFlags.length > 0 && (
                <div className="space-y-1.5">
                  {openFlags.map((f) => (
                    <div
                      key={f.id}
                      className="flex flex-wrap items-center gap-2 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900"
                    >
                      <span className="font-medium">{f.trigger}</span>
                      {f.note && <span>{f.note}</span>}
                      <div className="ml-auto flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            decideFlag(kase.id, f.id, "Approved", OPS_USER);
                            toast.success("Flag approved");
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            decideFlag(kase.id, f.id, "More Info Required", OPS_USER);
                            toast.info("More information requested");
                          }}
                        >
                          More info
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            decideFlag(kase.id, f.id, "Rejected", OPS_USER);
                            lockCase(kase.id, true);
                            toast.error("Flag rejected — case locked");
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {kyc.identity && kyc.identity.status !== "Identity Verified" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      opsAcceptIdentity(kase.id, OPS_USER);
                      toast.success("Identity accepted after review");
                    }}
                  >
                    Accept identity
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const r = passComplianceAndConvert(kase.id);
                    if (r.ok) toast.success("Converted — solicitor payout pending");
                    else toast.error(r.error ?? "Conversion blocked");
                  }}
                >
                  Pass compliance & convert
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const r = simulateProviderConfirmation(kase.id);
                    if (r.ok) toast.success("Solicitor paid — receipt available");
                    else toast.error(r.error ?? "Not ready for confirmation");
                  }}
                >
                  Confirm provider payout — demo only
                </Button>
                {kyc.locked && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      lockCase(kase.id, false);
                      toast.success("Case unlocked");
                    }}
                  >
                    Unlock case
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
