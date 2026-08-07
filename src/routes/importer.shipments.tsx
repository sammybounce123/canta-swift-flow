import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Ship, Upload, Bell } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import {
  useImporter, addShipment, updateShipment, addDocument, notify,
  type ImporterShipment,
} from "@/lib/importer-store";

export const Route = createFileRoute("/importer/shipments")({
  head: () => ({
    meta: [
      { title: "Shipments — Canta Importer" },
      { name: "description", content: "Upload your Bill of Lading, add container details and follow your shipment to delivery." },
      { property: "og:title", content: "Shipments — Canta Importer" },
      { property: "og:description", content: "Upload your Bill of Lading, add container details and follow your shipment to delivery." },
    ],
  }),
  component: ShipmentsPage,
});

const STATUSES: ImporterShipment["status"][] = [
  "Documents uploaded", "BL under review", "Shipment booked", "In transit",
  "Arriving soon", "Arrived", "Clearing", "Delivered", "Issue reported",
];

function ShipmentsPage() {
  const s = useImporter();

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Shipment updates are recorded here. Tracking data in this demo is illustrative." />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Ship className="h-5 w-5 text-primary" /> Shipments</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload your BL, add container details, and track your goods to delivery.</p>
        </div>
        <BLDialog />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {s.shipments.map((sh) => (
          <Card key={sh.id} className="p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">{sh.blNumber}</div>
                <div className="text-xs text-muted-foreground truncate">{sh.shippingLine}{sh.vessel ? ` · ${sh.vessel}` : ""} · {sh.container}</div>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">{sh.status}</Badge>
            </div>
            <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
              <div>{sh.portLoading} → {sh.portDestination}</div>
              <div>Estimated arrival: {sh.eta}</div>
              <div>Linked supplier payment: {sh.paymentRef ?? "—"}</div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Shipment status</Label>
                <Select value={sh.status} onValueChange={(v) => { updateShipment(sh.id, { status: v as ImporterShipment["status"] }); notify("Shipment", `${sh.blNumber} update: ${v}.`); }}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Container number</Label>
                <Input className="h-9" defaultValue={sh.container} onBlur={(e) => updateShipment(sh.id, { container: e.target.value })} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => { addDocument({ name: `Bill of Lading — ${sh.blNumber}.pdf`, type: "Bill of Lading", linkedShipment: sh.id }); toast.success("Document uploaded"); }}>
                <Upload className="h-3.5 w-3.5" /> Upload document
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { notify("Shipment", `Update requested for ${sh.blNumber}.`); toast.success("Update requested"); }}>Request update</Button>
              <label className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                <Bell className="h-3.5 w-3.5" /> Notifications
                <Switch checked={sh.notify} onCheckedChange={(v) => updateShipment(sh.id, { notify: v })} />
              </label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BLDialog() {
  const [open, setOpen] = useState(false);
  const s = useImporter();
  const [f, setF] = useState({
    paymentRef: "", blNumber: "", shippingLine: "", vessel: "", container: "",
    portLoading: "", portDestination: "", eta: "",
  });
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));

  const save = () => {
    if (!f.blNumber.trim()) { toast.error("BL number is required"); return; }
    const id = addShipment({ ...f, paymentRef: f.paymentRef || undefined });
    addDocument({ name: `Bill of Lading — ${f.blNumber}.pdf`, type: "Bill of Lading", linkedShipment: id, linkedPayment: f.paymentRef || undefined });
    toast.success("Bill of Lading uploaded", { description: `${id} is now tracked.` });
    setOpen(false);
    setF({ paymentRef: "", blNumber: "", shippingLine: "", vessel: "", container: "", portLoading: "", portDestination: "", eta: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Upload className="h-4 w-4" /> Upload BL</Button></DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Upload Bill of Lading</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label>Supplier payment reference</Label>
            <Select value={f.paymentRef} onValueChange={set("paymentRef")}>
              <SelectTrigger><SelectValue placeholder="Link to a supplier payment (optional)" /></SelectTrigger>
              <SelectContent>{s.payments.map((p) => <SelectItem key={p.id} value={p.id}>{p.id} — {p.supplier}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>BL number *</Label><Input value={f.blNumber} onChange={(e) => set("blNumber")(e.target.value)} /></div>
          <div><Label>Shipping line</Label><Input value={f.shippingLine} onChange={(e) => set("shippingLine")(e.target.value)} /></div>
          <div><Label>Vessel name (optional)</Label><Input value={f.vessel} onChange={(e) => set("vessel")(e.target.value)} /></div>
          <div><Label>Container number</Label><Input value={f.container} onChange={(e) => set("container")(e.target.value)} /></div>
          <div><Label>Port of loading</Label><Input value={f.portLoading} onChange={(e) => set("portLoading")(e.target.value)} /></div>
          <div><Label>Port of destination</Label><Input value={f.portDestination} onChange={(e) => set("portDestination")(e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Estimated arrival date</Label><Input type="date" value={f.eta} onChange={(e) => set("eta")(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={save}>Upload BL</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
