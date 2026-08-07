/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Upload, Download, CheckCircle2, XCircle, History } from "lucide-react";
import { toast } from "sonner";
import { CASES, getSolicitor, MARKETERS } from "@/lib/partner";
import { addDocument, listCases } from "@/lib/partner-store";
import { appendDocAudit, listDocAudit, subscribeExtras } from "@/lib/partner-extras";
import { usePartnerRole } from "@/hooks/usePartnerRole";

export const Route = createFileRoute("/partner/documents")({
  head: () => ({ meta: [{ title: "Documents — Kingsbridge Property Partners" }] }),
  component: DocumentsPage,
});

const DOC_TYPES = [
  "International passport",
  "National ID",
  "Driver's license",
  "Proof of address",
  "Proof of funds",
  "Property payment instruction",
  "Solicitor payment instruction",
  "Source of funds",
  "Other",
] as const;

function DocumentsPage() {
  const [, force] = useState(0);
  useEffect(() => subscribeExtras(() => force((n) => n + 1)), []);
  const { userId, role, user } = usePartnerRole();
  const cases = listCases();
  const audit = listDocAudit();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [caseId, setCaseId] = useState<string>("");
  const [docType, setDocType] = useState<string>(DOC_TYPES[0]);
  const [docName, setDocName] = useState<string>("");

  const submitUpload = () => {
    if (!caseId || !docName) {
      toast.error("Pick a case and a document name");
      return;
    }
    addDocument(caseId, {
      type: docType as any,
      name: docName,
      uploadedBy: userId,
      uploadedByName: user?.name ?? "Partner user",
      uploadedByRole: role,
    });
    appendDocAudit({
      caseId,
      docType,
      action: "Document uploaded by Kingsbridge Property Partners",
      actorId: userId,
      actorName: user?.name ?? "Partner user",
      actorRole: role,
    });
    toast.success("Document uploaded");
    setUploadOpen(false);
    setDocName("");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every document attached to your client payment cases, with full audit trail.
          </p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-1.5" /> Upload document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload document collected from client</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Case</Label>
                <Select value={caseId} onValueChange={setCaseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a case…" />
                  </SelectTrigger>
                  <SelectContent>
                    {CASES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.ref} — {c.clientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Document type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Document file name</Label>
                <Input
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="passport-john-doe.pdf"
                />
              </div>
              <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                Drag &amp; drop the file here (mock — file is not actually uploaded)
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submitUpload}>Save & audit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="p-4 border-b text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" /> Documents on file
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Case</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Solicitor</th>
                <th className="py-3 px-3">Document type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {cases.flatMap((c) => {
                const have = c.documents;
                const missing = DOC_TYPES.filter((d) => !have.find((h) => h.type === d));
                return [
                  ...have.map((d) => (
                    <tr key={`${c.id}-${d.id}`} className="border-t hover:bg-secondary/30">
                      <td className="py-3 px-3">
                        <Link
                          to="/partner/cases/$caseId"
                          params={{ caseId: c.id }}
                          className="text-primary hover:underline"
                        >
                          {c.ref}
                        </Link>
                      </td>
                      <td className="py-3 px-3">{c.clientName}</td>
                      <td className="py-3 px-3 text-xs">{getSolicitor(c.solicitorId)?.firm}</td>
                      <td className="py-3 px-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" /> {d.type}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-success/15 text-success border-success/30"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />{" "}
                          {d.uploadedByRole === "client" ? "Client" : "B&C"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            appendDocAudit({
                              caseId: c.id,
                              docType: d.type,
                              action: "Document approved",
                              actorId: "system",
                              actorName: "Canta Ops",
                              actorRole: "canta_system",
                            });
                            toast.success("Marked approved");
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            appendDocAudit({
                              caseId: c.id,
                              docType: d.type,
                              action: "Document rejected",
                              actorId: "system",
                              actorName: "Canta Ops",
                              actorRole: "canta_system",
                            });
                            toast.error("Marked rejected");
                          }}
                        >
                          Reject
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  )),
                  ...missing.slice(0, 2).map((d) => (
                    <tr key={`${c.id}-missing-${d}`} className="border-t hover:bg-secondary/30">
                      <td className="py-3 px-3">
                        <Link
                          to="/partner/cases/$caseId"
                          params={{ caseId: c.id }}
                          className="text-primary hover:underline"
                        >
                          {c.ref}
                        </Link>
                      </td>
                      <td className="py-3 px-3">{c.clientName}</td>
                      <td className="py-3 px-3 text-xs">{getSolicitor(c.solicitorId)?.firm}</td>
                      <td className="py-3 px-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" /> {d}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-warning/15 text-warning border-warning/30"
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Missing
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            appendDocAudit({
                              caseId: c.id,
                              docType: d,
                              action: "Missing document requested",
                              actorId: userId,
                              actorName: user?.name ?? "Partner user",
                              actorRole: role,
                            });
                            toast.success("Request sent to client");
                          }}
                        >
                          Request from client
                        </Button>
                      </td>
                    </tr>
                  )),
                ];
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="p-4 border-b text-sm font-semibold flex items-center gap-2">
          <History className="h-4 w-4 text-primary" /> Document audit trail
        </div>
        <div className="overflow-x-auto max-h-[420px]">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 sticky top-0">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Case</th>
                <th className="py-2 px-3">Document</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Actor</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Consent</th>
              </tr>
            </thead>
            <tbody>
              {audit.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No audit entries yet. Upload a document or request one from a client to populate
                    the log.
                  </td>
                </tr>
              ) : (
                audit.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="py-2 px-3 text-xs">{new Date(e.at).toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono text-xs">{e.caseId}</td>
                    <td className="py-2 px-3 text-xs">{e.docType}</td>
                    <td className="py-2 px-3 text-xs">{e.action}</td>
                    <td className="py-2 px-3 text-xs">{e.actorName}</td>
                    <td className="py-2 px-3 text-xs">{e.actorRole}</td>
                    <td className="py-2 px-3 text-xs">
                      {e.consent === true ? "Yes" : e.consent === false ? "No" : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-[11px] text-muted-foreground">
        Recognised actors: {MARKETERS.length} B&amp;C users, Canta Ops &amp; clients via /pay link.
      </div>
    </div>
  );
}
