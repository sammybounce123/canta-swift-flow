import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { UserCheck, Building2, Mail, Phone, MapPin, Eye, Receipt } from "lucide-react";
import { toast } from "sonner";
import { BUYERS, REQUESTS, STATUS_TONE } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/buyers")({
  head: () => ({ meta: [{ title: "Nigerian Buyers — Supplier Portal — Canta" }] }),
  component: BuyersPanel,
});

function BuyersPanel() {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground mb-3">Nigerian buyers linked to your supplier account. You only see buyers you have transacted with.</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left py-2 px-3">Buyer Company</th>
              <th className="text-left py-2 px-3">Contact</th>
              <th className="text-left py-2 px-3">Country</th>
              <th className="text-left py-2 px-3">Last Invoice Ref</th>
              <th className="text-right py-2 px-3">Invoice Value</th>
              <th className="text-left py-2 px-3">Payment Status</th>
              <th className="text-left py-2 px-3">Last Activity</th>
              <th className="text-right py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {BUYERS.map((b) => {
              const rows = REQUESTS.filter((r) => r.buyer === b.company);
              const total = rows.reduce((s, r) => s + r.amountNgn, 0);
              const last = rows[0];
              return (
                <tr key={b.company} className="border-t align-top">
                  <td className="py-2 px-3 font-medium">
                    <div className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {b.company}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><UserCheck className="h-3 w-3" /> {b.name}</div>
                  </td>
                  <td className="py-2 px-3 text-xs">
                    <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {b.email}</div>
                    <div className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {b.phone}</div>
                  </td>
                  <td className="py-2 px-3 text-xs"><MapPin className="h-3 w-3 inline mr-1" />{b.country}</td>
                  <td className="py-2 px-3 font-mono text-xs">{last?.invoiceNumber ?? "—"}</td>
                  <td className="py-2 px-3 text-right tabular-nums">₦{total.toLocaleString()}</td>
                  <td className="py-2 px-3">{last && <Badge className={STATUS_TONE[last.status]}>{last.status}</Badge>}</td>
                  <td className="py-2 px-3 text-xs text-muted-foreground">{last?.updated ?? "—"}</td>
                  <td className="py-2 px-3">
                    <ButtonGroup label={`Actions for ${b.company}`} className="justify-end">
                      <Button size="sm" variant="outline" onClick={() => toast.success(`Opened ${b.company}`)}><Eye className="h-3.5 w-3.5 mr-1" /> View buyer</Button>
                      <Button size="sm" asChild><Link to="/supplier-portal/payment-requests"><Receipt className="h-3.5 w-3.5 mr-1" /> Create payment request</Link></Button>
                    </ButtonGroup>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

