import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Upload, Download, RefreshCw } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import { useImporter, addDocument, update } from "@/lib/importer-store";

export const Route = createFileRoute("/importer/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Canta Importer" },
      {
        name: "description",
        content:
          "Upload invoices, packing lists, Bills of Lading and payment proof, and see review status.",
      },
      { property: "og:title", content: "Documents — Canta Importer" },
      {
        property: "og:description",
        content:
          "Upload invoices, packing lists, Bills of Lading and payment proof, and see review status.",
      },
    ],
  }),
  component: DocumentsPage,
});

const TYPES = [
  "Supplier invoice",
  "Proforma invoice",
  "Commercial invoice",
  "Packing list",
  "Bill of Lading",
  "Form M / PAAR",
  "Payment proof",
  "Other supporting document",
];

function DocumentsPage() {
  const s = useImporter();
  const [type, setType] = useState(TYPES[0]);

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Uploaded documents are reviewed before payout. Files here are illustrative."
      />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Documents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload and manage the documents linked to your payments and shipments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              addDocument({ name: `${type} — ${new Date().toLocaleDateString()}.pdf`, type });
              toast.success("Document uploaded");
            }}
          >
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {s.documents.map((d) => (
          <Card key={d.id} className="p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{d.name}</div>
                <div className="text-xs text-muted-foreground">
                  {d.type} · {d.uploadedAt}
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {d.status}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {d.linkedPayment && <div>Linked payment: {d.linkedPayment}</div>}
              {d.linkedShipment && <div>Linked shipment: {d.linkedShipment}</div>}
              {!d.linkedPayment && !d.linkedShipment && <div>Not linked to a payment yet</div>}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" onClick={() => toast.success("Download started")}>
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  update((st) => ({
                    ...st,
                    documents: st.documents.map((x) =>
                      x.id === d.id
                        ? {
                            ...x,
                            status: "Under review",
                            uploadedAt: new Date().toISOString().slice(0, 10),
                          }
                        : x,
                    ),
                  }));
                  toast.success("Document replaced — under review");
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Replace
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
