import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Brain, Upload, FileText, Paperclip, MessageCircle, ShieldAlert,
  Plus, Link as LinkIcon, FileSearch, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-document-extraction")({
  head: () => ({ meta: [{ title: "AI Document Extraction — Canta" }] }),
  component: AIDocExtraction,
});

const DOC_TYPES = [
  "Supplier Invoice", "Bill of Lading", "Packing List", "Payment Receipt",
  "Freight Invoice", "Solicitor Payment Instruction", "KYC Document", "Proof of Funds",
];

const SAMPLES: Record<string, { fileName: string; fields: { label: string; value: string }[] }> = {
  "Supplier Invoice": {
    fileName: "INV-9024-shenzhen-bright-led.pdf",
    fields: [
      { label: "Supplier name", value: "Shenzhen BrightLED Co." },
      { label: "Invoice number", value: "INV-9024" },
      { label: "Invoice date", value: "2026-06-12" },
      { label: "Amount", value: "USD 24,580.00" },
      { label: "Customer name", value: "Lagos Global Imports Ltd" },
      { label: "Bank account", value: "BoC HK • 6210-***-1144" },
      { label: "Goods description", value: "LED panels 60×60, 1200pcs" },
      { label: "Payment reference", value: "LGI-PO-2042" },
    ],
  },
  "Bill of Lading": {
    fileName: "BL-MAEU-9881204.pdf",
    fields: [
      { label: "BL number", value: "MAEU-9881204" },
      { label: "Container number", value: "MSKU7892311" },
      { label: "Shipment number", value: "SHP-3041" },
      { label: "ETA", value: "2026-07-22" },
      { label: "Supplier", value: "Shenzhen BrightLED Co." },
      { label: "Customer", value: "Lagos Global Imports Ltd" },
      { label: "Goods description", value: "LED panels — 12 cartons" },
    ],
  },
  "Solicitor Payment Instruction": {
    fileName: "solicitor-payment-instruction.pdf",
    fields: [
      { label: "Solicitor name", value: "Hartmann & Co Solicitors LLP" },
      { label: "Amount", value: "GBP 86,400.00" },
      { label: "Currency", value: "GBP" },
      { label: "Bank account details", value: "Barclays • 20-00-00 • ****8821" },
      { label: "Payment reference", value: "MILESTONE-2-BCP-9012" },
      { label: "Document date", value: "2026-06-10" },
    ],
  },
};

function pickSample(t: string) {
  return SAMPLES[t] ?? {
    fileName: t.toLowerCase().replace(/\s+/g, "-") + ".pdf",
    fields: [
      { label: "Document type", value: t },
      { label: "Document date", value: "2026-06-12" },
      { label: "Reference", value: "REF-" + Math.floor(Math.random() * 9000 + 1000) },
    ],
  };
}

function AIDocExtraction() {
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [extracted, setExtracted] = useState<ReturnType<typeof pickSample> | null>(null);
  const [busy, setBusy] = useState(false);

  function runExtract() {
    setBusy(true);
    setExtracted(null);
    setTimeout(() => {
      setExtracted(pickSample(docType));
      setBusy(false);
      toast.success("Fields extracted");
    }, 900);
  }

  return (
    <div className="space-y-6">
      <header>
        <Badge variant="outline" className="gap-1"><Brain className="h-3 w-3" /> AI Tools</Badge>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">AI Document Extraction</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Upload supplier invoices, BLs, packing lists, freight invoices, payment instructions and KYC documents. Canta extracts key
          fields and lets you create or attach them to a Trade File or Payment Case in one click.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 md:col-span-1 space-y-3">
          <div className="text-sm font-semibold">1. Upload</div>
          <div>
            <Label className="text-xs">Document type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <label className="rounded-lg border border-dashed p-5 text-center text-xs text-muted-foreground block cursor-pointer hover:border-primary hover:bg-primary/5">
            <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
            <div className="mt-2">Drag PDF / image, or click to upload</div>
            <Input type="file" className="hidden" onChange={runExtract} />
          </label>
          <Button className="w-full" onClick={runExtract} disabled={busy}>
            <FileSearch className="h-4 w-4 mr-2" />
            {busy ? "Extracting..." : "Run extraction on sample"}
          </Button>
        </Card>

        <Card className="p-4 md:col-span-2 space-y-3 min-h-[320px]">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Extracted fields
            </div>
            {extracted && <Badge variant="secondary">{extracted.fileName}</Badge>}
          </div>

          {!extracted ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-xs text-muted-foreground">
              Upload a document or run sample extraction to preview fields.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {extracted.fields.map((f) => (
                  <div key={f.label} className="border rounded-lg p-2.5">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{f.label}</div>
                    <div className="font-medium mt-0.5">{f.value}</div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                <Button size="sm" onClick={() => toast.success("Trade File draft created")}>
                  <Plus className="h-3 w-3 mr-1" /> Create draft Trade File
                </Button>
                <Button size="sm" onClick={() => toast.success("Payment Case draft created")}>
                  <Plus className="h-3 w-3 mr-1" /> Create Payment Case
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Attached to existing case")}>
                  <LinkIcon className="h-3 w-3 mr-1" /> Attach to existing
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Missing document requested")}>
                  <Paperclip className="h-3 w-3 mr-1" /> Request missing doc
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("WhatsApp follow-up queued")}>
                  <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp follow-up
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Flagged for compliance review")}>
                  <ShieldAlert className="h-3 w-3 mr-1" /> Flag for compliance
                </Button>
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center gap-1 border-t pt-3">
                <CheckCircle2 className="h-3 w-3 text-success" /> Confidence: 96% · Reviewer can edit any field before saving.
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
