import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { listHooks, createHook, advanceHook, subscribeInsurance, INSURANCE_PARTNERS, type InsuranceRiskType } from "@/lib/insurance-store";

type Props = {
  title: string;
  description: string;
  customer: string;
  linkedId: string;
  linkedKind: "trade-file" | "shipment" | "card" | "payment-case";
  insuredAmount: number;
  ccy: string;
  riskType: InsuranceRiskType;
};

export function InsuranceHookCard(props: Props) {
  const [, force] = useState(0);
  useEffect(() => subscribeInsurance(() => force((n) => n + 1)), []);
  const hooks = listHooks(props.linkedId);
  const active = hooks[0];

  const request = () => {
    const h = createHook({
      customer: props.customer,
      linkedId: props.linkedId,
      linkedKind: props.linkedKind,
      insuredAmount: props.insuredAmount,
      ccy: props.ccy,
      riskType: props.riskType,
      partner: INSURANCE_PARTNERS[0],
    });
    toast.success(`Insurance quote requested from ${h.partner}`);
    setTimeout(() => { advanceHook(h.id, { quoteStatus: "Quote Received" }); toast.info("Quote received — review terms"); }, 1500);
  };

  return (
    <Card className="p-4 shadow-card border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary grid place-items-center">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm font-semibold">{props.title}</div>
            <Badge variant="outline" className="text-[10px]"><Sparkles className="h-3 w-3 mr-1" /> Embedded</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{props.description}</p>
          {active ? (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30">{active.quoteStatus}</Badge>
              <span className="text-muted-foreground">via {active.partner}</span>
              {active.quoteStatus === "Quote Received" && (
                <Button size="sm" variant="outline" className="ml-auto" onClick={() => { advanceHook(active.id, { quoteStatus: "Accepted", policyStatus: "Policy Active" }); toast.success("Policy activated"); }}>Accept</Button>
              )}
            </div>
          ) : (
            <Button size="sm" className="mt-3" onClick={request}>Request insurance quote</Button>
          )}
        </div>
      </div>
    </Card>
  );
}
