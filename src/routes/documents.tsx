import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="Documents"
      icon={<FileText className="h-5 w-5 text-primary" />}
      subtitle="Every shipment document in one searchable vault — invoices, BLs, packing lists, customs forms, certificates."
      bullets={[
        "Drag-and-drop document upload",
        "Auto-classify by document type",
        "OCR search across uploaded files",
        "Per-shipment document checklist",
        "Sensitive docs released after approval",
        "Audit trail of every access",
      ]}
      primaryAction={{ label: "Upload documents" }}
    />
  ),
});
