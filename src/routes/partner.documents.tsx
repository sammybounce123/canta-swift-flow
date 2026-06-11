import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Upload } from "lucide-react";
import { CASES, getSolicitor } from "@/lib/partner";

export const Route = createFileRoute("/partner/documents")({
  head: () => ({ meta: [{ title: "Documents — Baron & Cabot" }] }),
  component: DocumentsPage,
});

const DOC_TYPES = [
  "Payment instruction", "Solicitor instruction", "KYC documents",
  "Proof of funds", "Payment receipt", "Canta transaction receipt",
];

function DocumentsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">Every document attached to your client payment cases.</p>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Case</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Solicitor</th>
                <th className="py-3 px-3">Document</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {CASES.flatMap((c) => DOC_TYPES.map((d, idx) => {
                const present = (c.id.charCodeAt(c.id.length - 1) + idx) % 3 !== 0;
                return (
                  <tr key={`${c.id}-${d}`} className="border-t hover:bg-secondary/30">
                    <td className="py-3 px-3"><Link to="/partner/cases/$caseId" params={{ caseId: c.id }} className="text-primary hover:underline">{c.ref}</Link></td>
                    <td className="py-3 px-3">{c.clientName}</td>
                    <td className="py-3 px-3 text-xs">{getSolicitor(c.solicitorId)?.firm}</td>
                    <td className="py-3 px-3 flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> {d}</td>
                    <td className="py-3 px-3">
                      {present
                        ? <Badge variant="outline" className="text-[10px] bg-success/15 text-success border-success/30">Uploaded</Badge>
                        : <Badge variant="outline" className="text-[10px] bg-warning/15 text-warning border-warning/30">Missing</Badge>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {present
                        ? <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5 mr-1" /> Download</Button>
                        : <Button size="sm" variant="outline"><Upload className="h-3.5 w-3.5 mr-1" /> Upload</Button>}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
