import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare, FilePlus, BadgeCheck, Lock, Calculator, Ship,
  Paperclip, CreditCard, LinkIcon, Truck, MessageCircle, Bookmark, Copy,
} from "lucide-react";
import { toast } from "sonner";
import { openWhatsApp, buildWhatsAppUrl } from "@/lib/whatsapp";

export type ImporterActionContext = {
  /** Trade file id, if known */
  tradeFileId?: string;
  /** Shipment id, if known */
  shipmentId?: string;
  /** Supplier name, if known */
  supplier?: string;
  /** Supplier id, if known */
  supplierId?: string;
  /** Origin/Destination for prefill */
  origin?: string;
  destination?: string;
  eta?: string;
  invoiceAmount?: number;
  currency?: string;
};

type Variant = "toolbar" | "supplier" | "tradefile";

const LS = {
  savedSuppliers: "canta:importer:savedSuppliers",
  cards: "canta:importer:cards",
  quotes: "canta:importer:quotes",
  verifications: "canta:importer:verifications",
  forwarderInvites: "canta:importer:forwarderInvites",
  linkedShipments: "canta:importer:linkedShipments",
  linkedDocs: "canta:importer:linkedDocs",
  landedRequests: "canta:importer:landedRequests",
};

function push(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    const cur = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    cur.unshift({ id: `${Date.now()}`, createdAt: new Date().toISOString(), ...((value as object) ?? {}) });
    window.localStorage.setItem(key, JSON.stringify(cur.slice(0, 200)));
  } catch { /* ignore */ }
}

export function ImporterActions({
  ctx = {},
  variant = "toolbar",
  className,
}: {
  ctx?: ImporterActionContext;
  variant?: Variant;
  className?: string;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState<null | "quote" | "verify" | "escrow" | "landed" | "linkShipment" | "linkDocs" | "card" | "share" | "forwarder" | "whatsapp">(null);

  // Local form state per dialog
  const [quote, setQuote] = useState({ supplier: ctx.supplier ?? "", goods: "", qty: "", target: "", incoterm: "FOB", notes: "" });
  const [verify, setVerify] = useState({ supplier: ctx.supplier ?? "", location: "", contact: "", amount: ctx.invoiceAmount?.toString() ?? "", category: "" });
  const [escrow, setEscrow] = useState({ tradeFile: ctx.tradeFileId ?? "", supplier: ctx.supplier ?? "", amount: ctx.invoiceAmount?.toString() ?? "", ccy: ctx.currency ?? "USD", milestones: "50% on BL, 50% on inspection signoff" });
  const [landed, setLanded] = useState({ goodsCost: ctx.invoiceAmount?.toString() ?? "", currency: ctx.currency ?? "USD", freight: "", clearing: "", destination: ctx.destination ?? "", sellingPrice: "" });
  const [linkShip, setLinkShip] = useState({ shipmentRef: ctx.shipmentId ?? "", tradeFile: ctx.tradeFileId ?? "" });
  const [linkDocs, setLinkDocs] = useState({ tradeFile: ctx.tradeFileId ?? "", docTypes: [] as string[], notes: "" });
  const [card, setCard] = useState({ label: "", limit: "5000", linkKind: ctx.tradeFileId ? "Trade file" : "Shipment", linked: ctx.tradeFileId ?? ctx.shipmentId ?? "" });
  const [forwarder, setForwarder] = useState({ name: "", email: "", tradeFile: ctx.tradeFileId ?? "" });
  const [waMsg, setWaMsg] = useState(`Hi Canta, please send a status update on ${ctx.tradeFileId ?? ctx.shipmentId ?? "my shipment"}.`);

  const trackUrl = ctx.shipmentId && typeof window !== "undefined"
    ? `${window.location.origin}/track/${ctx.shipmentId}`
    : "";

  // -- handlers --------------------------------------------------------------
  const submitQuote = () => {
    if (!quote.supplier || !quote.goods) return toast.error("Supplier and goods are required");
    push(LS.quotes, { ...quote, status: "Sent" });
    openWhatsApp("sendInvoice");
    toast.success(`Quote request sent to ${quote.supplier}`);
    setOpen(null);
  };
  const startTradeFile = () => {
    push(LS.quotes, { type: "trade-file-draft", supplier: ctx.supplier ?? "", from: "supplier-profile" });
    toast.success("Trade file drafted — opening Trade Desk");
    navigate({ to: "/trade-desk" });
  };
  const saveSupplier = () => {
    if (!ctx.supplier) return toast.error("Open a supplier first");
    push(LS.savedSuppliers, { supplier: ctx.supplier, supplierId: ctx.supplierId });
    toast.success(`${ctx.supplier} saved to My Suppliers`);
  };
  const submitVerify = () => {
    if (!verify.supplier) return toast.error("Supplier name required");
    push(LS.verifications, { ...verify, status: "Pending" });
    openWhatsApp("verifySupplier", { supplier: verify.supplier, location: verify.location, contact: verify.contact, amount: verify.amount, category: verify.category });
    toast.success("Verification requested — Canta will reply on WhatsApp");
    setOpen(null);
  };
  const submitEscrow = () => {
    if (!escrow.amount) return toast.error("Escrow amount required");
    push("canta:importer:escrowRequests", { ...escrow, status: "Escrow Requested" });
    toast.success("Escrow request submitted");
    setOpen(null);
  };
  const submitLanded = () => {
    push(LS.landedRequests, { ...landed, status: "Estimating" });
    openWhatsApp("landedCost", landed);
    toast.success("Landed cost estimate requested");
    setOpen(null);
  };
  const submitLinkShipment = () => {
    if (!linkShip.shipmentRef || !linkShip.tradeFile) return toast.error("Shipment ref and trade file required");
    push(LS.linkedShipments, linkShip);
    toast.success(`Linked ${linkShip.shipmentRef} → ${linkShip.tradeFile}`);
    setOpen(null);
  };
  const submitLinkDocs = () => {
    if (!linkDocs.tradeFile) return toast.error("Pick a trade file");
    push(LS.linkedDocs, linkDocs);
    toast.success("Documents linked to trade file");
    setOpen(null);
  };
  const submitCard = () => {
    if (!card.label || !card.limit) return toast.error("Card label and limit required");
    push(LS.cards, { ...card, last4: String(1000 + Math.floor(Math.random() * 8999)) });
    toast.success(`Card "${card.label}" issued — linked to ${card.linked || card.linkKind}`);
    setOpen(null);
  };
  const submitForwarder = () => {
    if (!forwarder.email || !forwarder.tradeFile) return toast.error("Forwarder email and trade file required");
    push(LS.forwarderInvites, forwarder);
    if (typeof window !== "undefined") {
      const subject = encodeURIComponent(`Invite: Collaborate on Canta trade file ${forwarder.tradeFile}`);
      const body = encodeURIComponent(`Hi ${forwarder.name || "team"},\n\nI'd like to invite you to handle the freight side of trade file ${forwarder.tradeFile} on Canta.\n\nThanks.`);
      window.open(`mailto:${forwarder.email}?subject=${subject}&body=${body}`, "_blank");
    }
    toast.success(`Invitation sent to ${forwarder.email}`);
    setOpen(null);
  };
  const sendWhatsAppUpdate = () => {
    if (typeof window !== "undefined") {
      window.open(buildWhatsAppUrl("shipmentUpdate", { shipment: ctx.shipmentId ?? ctx.tradeFileId, status: "Update requested" }), "_blank");
    }
    toast.success("WhatsApp update requested");
    setOpen(null);
  };
  const copyTrackUrl = () => {
    if (!trackUrl) return toast.error("Add a shipment id first");
    navigator.clipboard?.writeText(trackUrl);
    toast.success("Tracking link copied");
  };

  // -- which buttons per variant --------------------------------------------
  const buttons: { label: string; icon: typeof MessageSquare; onClick: () => void; primary?: boolean; show: boolean }[] = [
    { label: "Request Quote",          icon: MessageSquare, onClick: () => setOpen("quote"),         primary: variant === "supplier", show: true },
    { label: "Start Trade File",       icon: FilePlus,      onClick: startTradeFile,                 primary: variant === "supplier", show: variant !== "tradefile" },
    { label: "Verify Supplier",        icon: BadgeCheck,    onClick: () => setOpen("verify"),        show: true },
    { label: "Save Supplier",          icon: Bookmark,      onClick: saveSupplier,                   show: variant === "supplier" },
    { label: "Request Escrow",         icon: Lock,          onClick: () => setOpen("escrow"),        show: true },
    { label: "Request Clearing Quotes", icon: Calculator,   onClick: () => navigate({ to: "/clearing-quotes", search: { file: ctx.tradeFileId, request: undefined } }), show: true },
    { label: "Estimate Landed Cost",   icon: Calculator,    onClick: () => setOpen("landed"),        show: true },
    { label: "Link Shipment",          icon: Ship,          onClick: () => setOpen("linkShipment"),  show: variant !== "supplier" },
    { label: "Link Documents",         icon: Paperclip,     onClick: () => setOpen("linkDocs"),      show: variant === "tradefile" },
    { label: "Create Importer Card",   icon: CreditCard,    onClick: () => setOpen("card"),          show: variant !== "supplier" },
    { label: "Share Tracking Link",    icon: LinkIcon,      onClick: () => setOpen("share"),         show: !!ctx.shipmentId || variant === "tradefile" },
    { label: "Invite Freight Forwarder", icon: Truck,       onClick: () => setOpen("forwarder"),     show: variant !== "supplier" },
    { label: "Send WhatsApp Update",   icon: MessageCircle, onClick: () => setOpen("whatsapp"),      show: true },
  ];

  return (
    <div className={className}>
      <div
        className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}
        role="group"
        aria-label={variant === "tradefile" ? "Trade file quick actions" : "Importer quick actions"}
      >
        {buttons.filter((b) => b.show).map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.onClick}
            className={`group flex min-h-12 w-full items-start gap-2 rounded-md border px-3 py-2.5 text-left text-sm font-medium leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              b.primary
                ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-secondary/70"
            }`}
          >
            <b.icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 whitespace-normal break-words">{b.label}</span>
          </button>
        ))}
      </div>

      {/* Quote */}
      <Dialog open={open === "quote"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Request Quote</DialogTitle><DialogDescription>Send an RFQ to a verified supplier via Canta + WhatsApp.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label className="text-xs">Supplier</Label><Input value={quote.supplier} onChange={(e) => setQuote({ ...quote, supplier: e.target.value })} placeholder="e.g. Guangzhou Tech Factory" /></div>
            <div className="col-span-2"><Label className="text-xs">Goods / SKUs</Label><Input value={quote.goods} onChange={(e) => setQuote({ ...quote, goods: e.target.value })} placeholder="e.g. Bluetooth speakers, model X-200" /></div>
            <div><Label className="text-xs">Quantity</Label><Input value={quote.qty} onChange={(e) => setQuote({ ...quote, qty: e.target.value })} placeholder="500" /></div>
            <div><Label className="text-xs">Target price (USD)</Label><Input value={quote.target} onChange={(e) => setQuote({ ...quote, target: e.target.value })} placeholder="12.50" /></div>
            <div><Label className="text-xs">Incoterm</Label>
              <Select value={quote.incoterm} onValueChange={(v) => setQuote({ ...quote, incoterm: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["EXW","FOB","CIF","CFR","DDP"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label className="text-xs">Notes</Label><Textarea value={quote.notes} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button><Button onClick={submitQuote}>Send Quote Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify */}
      <Dialog open={open === "verify"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Request Supplier Verification</DialogTitle><DialogDescription>Canta runs registration, address, bank and reputation checks.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label className="text-xs">Supplier</Label><Input value={verify.supplier} onChange={(e) => setVerify({ ...verify, supplier: e.target.value })} /></div>
            <div><Label className="text-xs">Country / City</Label><Input value={verify.location} onChange={(e) => setVerify({ ...verify, location: e.target.value })} /></div>
            <div><Label className="text-xs">Website / contact</Label><Input value={verify.contact} onChange={(e) => setVerify({ ...verify, contact: e.target.value })} /></div>
            <div><Label className="text-xs">Invoice amount</Label><Input value={verify.amount} onChange={(e) => setVerify({ ...verify, amount: e.target.value })} /></div>
            <div><Label className="text-xs">Category</Label><Input value={verify.category} onChange={(e) => setVerify({ ...verify, category: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button><Button onClick={submitVerify}>Submit Verification</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escrow */}
      <Dialog open={open === "escrow"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Request Escrow</DialogTitle><DialogDescription>Hold supplier funds until BL / inspection milestones clear.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Trade file</Label><Input value={escrow.tradeFile} onChange={(e) => setEscrow({ ...escrow, tradeFile: e.target.value })} /></div>
            <div><Label className="text-xs">Supplier</Label><Input value={escrow.supplier} onChange={(e) => setEscrow({ ...escrow, supplier: e.target.value })} /></div>
            <div><Label className="text-xs">Amount</Label><Input value={escrow.amount} onChange={(e) => setEscrow({ ...escrow, amount: e.target.value })} /></div>
            <div><Label className="text-xs">Currency</Label>
              <Select value={escrow.ccy} onValueChange={(v) => setEscrow({ ...escrow, ccy: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["USD","EUR","GBP","CNY","AED"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label className="text-xs">Milestones</Label><Textarea value={escrow.milestones} onChange={(e) => setEscrow({ ...escrow, milestones: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button><Button onClick={submitEscrow}>Submit Escrow Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Landed cost */}
      <Dialog open={open === "landed"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Estimated Landed Cost</DialogTitle><DialogDescription>Goods, freight, duty estimate and FX. Clearing fee comes from a selected agent quote — request bids in the Clearing Agent Marketplace.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Goods cost</Label><Input value={landed.goodsCost} onChange={(e) => setLanded({ ...landed, goodsCost: e.target.value })} /></div>
            <div><Label className="text-xs">Currency</Label>
              <Select value={landed.currency} onValueChange={(v) => setLanded({ ...landed, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["USD","EUR","GBP","CNY"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Freight</Label><Input value={landed.freight} onChange={(e) => setLanded({ ...landed, freight: e.target.value })} /></div>
            <div><Label className="text-xs">Agent-provided clearing quote</Label><Input value={landed.clearing} onChange={(e) => setLanded({ ...landed, clearing: e.target.value })} placeholder="From selected agent bid" /></div>
            <div><Label className="text-xs">Destination</Label><Input value={landed.destination} onChange={(e) => setLanded({ ...landed, destination: e.target.value })} /></div>
            <div><Label className="text-xs">Selling price</Label><Input value={landed.sellingPrice} onChange={(e) => setLanded({ ...landed, sellingPrice: e.target.value })} /></div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Clearing fee source: selected agent quote, manual estimate, or awaiting agent bids. Canta does not quote clearing fees directly.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { navigate({ to: "/landed-cost" }); setOpen(null); }}>Open Landed Cost Tool</Button>
            <Button onClick={submitLanded}>Request Estimate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link shipment */}
      <Dialog open={open === "linkShipment"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Link Shipment to Trade File</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label className="text-xs">Shipment reference (SHP / Container / BL)</Label><Input value={linkShip.shipmentRef} onChange={(e) => setLinkShip({ ...linkShip, shipmentRef: e.target.value })} /></div>
            <div><Label className="text-xs">Trade file</Label><Input value={linkShip.tradeFile} onChange={(e) => setLinkShip({ ...linkShip, tradeFile: e.target.value })} placeholder="TR-2031" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { navigate({ to: "/shipments" }); setOpen(null); }}>Browse Shipments</Button>
            <Button onClick={submitLinkShipment}>Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link docs */}
      <Dialog open={open === "linkDocs"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Link Documents to Trade File</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label className="text-xs">Trade file</Label><Input value={linkDocs.tradeFile} onChange={(e) => setLinkDocs({ ...linkDocs, tradeFile: e.target.value })} /></div>
            <div className="border border-dashed border-border rounded-lg p-4 text-xs text-muted-foreground text-center">
              Drop invoice, packing list, BL, SONCAP, Form M, insurance certificate or inspection report here
            </div>
            <div><Label className="text-xs">Notes</Label><Textarea value={linkDocs.notes} onChange={(e) => setLinkDocs({ ...linkDocs, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button><Button onClick={submitLinkDocs}>Attach</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card */}
      <Dialog open={open === "card"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Importer Card</DialogTitle><DialogDescription>Issue a card linked to this trade file or shipment.</DialogDescription></DialogHeader>
          <div className="grid gap-3">
            <div><Label className="text-xs">Card label</Label><Input value={card.label} onChange={(e) => setCard({ ...card, label: e.target.value })} placeholder="Guangzhou sourcing" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Link to</Label>
                <Select value={card.linkKind} onValueChange={(v) => setCard({ ...card, linkKind: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Trade file","Shipment","Supplier","Project"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Reference</Label><Input value={card.linked} onChange={(e) => setCard({ ...card, linked: e.target.value })} placeholder="TR-2031" /></div>
            </div>
            <div><Label className="text-xs">Monthly limit (USD)</Label><Input value={card.limit} onChange={(e) => setCard({ ...card, limit: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { navigate({ to: "/importer/cards" }); setOpen(null); }}>Open Cards</Button>
            <Button onClick={submitCard}>Issue Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share */}
      <Dialog open={open === "share"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Share Tracking Link</DialogTitle><DialogDescription>Anyone with this link can see live shipment status.</DialogDescription></DialogHeader>
          <div className="flex gap-2">
            <Input value={trackUrl || `https://canta.app/track/${ctx.shipmentId ?? "SHP-…" }`} readOnly className="font-mono text-xs" />
            <Button onClick={copyTrackUrl}><Copy className="h-3.5 w-3.5" /></Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { if (typeof window !== "undefined") window.open(`https://wa.me/?text=${encodeURIComponent(trackUrl)}`, "_blank"); }}>Share via WhatsApp</Button>
            <Button onClick={() => setOpen(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forwarder */}
      <Dialog open={open === "forwarder"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Invite Freight Forwarder</DialogTitle><DialogDescription>Bring a forwarder onto this trade file. They'll get a Canta collaborator invite by email.</DialogDescription></DialogHeader>
          <div className="grid gap-3">
            <div><Label className="text-xs">Company / contact name</Label><Input value={forwarder.name} onChange={(e) => setForwarder({ ...forwarder, name: e.target.value })} /></div>
            <div><Label className="text-xs">Email</Label><Input type="email" value={forwarder.email} onChange={(e) => setForwarder({ ...forwarder, email: e.target.value })} placeholder="ops@dragonfreight.com" /></div>
            <div><Label className="text-xs">Trade file</Label><Input value={forwarder.tradeFile} onChange={(e) => setForwarder({ ...forwarder, tradeFile: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button><Button onClick={submitForwarder}>Send Invite</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp update */}
      <Dialog open={open === "whatsapp"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Send WhatsApp Update Request</DialogTitle><DialogDescription>Canta replies on WhatsApp with the latest status.</DialogDescription></DialogHeader>
          <Textarea value={waMsg} onChange={(e) => setWaMsg(e.target.value)} rows={5} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
            <Button onClick={sendWhatsAppUpdate} className="bg-[#25D366] hover:bg-[#1FB855] text-white">Open WhatsApp</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
