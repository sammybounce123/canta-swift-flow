import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { REQUESTS } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/trade-files")({
  head: () => ({ meta: [{ title: "Trade Files — Supplier Portal — Canta" }] }),
  component: TradeFilesPanel,
});

function TradeFilesPanel() {
  return (
    <Card className="p-4 space-y-3 text-sm">
      <div className="text-muted-foreground">You can only see Trade Files where you have been invited as a supplier.</div>
      {Array.from(new Set(REQUESTS.map((r) => r.tradeFile))).map((tf) => (
        <div key={tf} className="flex items-center justify-between border rounded-lg p-3">
          <div>
            <div className="font-mono text-xs">{tf}</div>
            <div className="text-xs text-muted-foreground">Buyer: {REQUESTS.find((r) => r.tradeFile === tf)?.buyer}</div>
          </div>
          <Button size="sm" variant="outline">Open</Button>
        </div>
      ))}
    </Card>
  );
}
