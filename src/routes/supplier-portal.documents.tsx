import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/supplier-portal/documents")({
  head: () => ({ meta: [{ title: "Documents — Supplier Portal — Canta" }] }),
  component: DocumentsPanel,
});

function DocumentsPanel() {
  return (
    <Card className="p-4 space-y-3">
      <div className="text-sm font-semibold">Documents on file</div>
      <Button size="sm" variant="outline"><Upload className="h-4 w-4 mr-2" /> Upload document</Button>
      <ul className="text-sm space-y-2">
        <li className="flex items-center justify-between border rounded p-2"><span>Business registration.pdf</span><Badge className="bg-emerald-100 text-emerald-800">Verified</Badge></li>
        <li className="flex items-center justify-between border rounded p-2"><span>Factory address proof.pdf</span><Badge className="bg-amber-100 text-amber-800">Pending</Badge></li>
        <li className="flex items-center justify-between border rounded p-2"><span>Bank statement.pdf</span><Badge variant="outline">Required</Badge></li>
      </ul>
    </Card>
  );
}
