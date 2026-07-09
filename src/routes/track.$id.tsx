import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shipments, freightInvoices, fmtMoney, type Shipment } from "@/lib/mock";
import { MessageCircle, CheckCircle2, Circle, AlertCircle, Calendar, Ship, MapPin, ArrowRight, FileText, Receipt } from "lucide-react";


export const Route = createFileRoute("/track/$id")({
  head: ({ params }) => ({ meta: [{ title: `Track ${params.id} — Canta` }] }),
  loader: ({ params }) => {
    const s = shipments.find((x) => x.id === params.id || x.shipmentNumber === params.id);
    if (!s) throw notFound();
    return s;
  },
  component: TrackPage,
  notFoundComponent: () => (
    <PublicShell>
      <Card className="p-10 text-center max-w-md mx-auto shadow-card">
        <h1 className="text-xl font-semibold">Shipment not found</h1>
        <p className="text-sm text-muted-foreground mt-2">Check the tracking ID and try again.</p>
        <Link to="/track" className="text-primary text-sm underline mt-4 inline-block">Try another ID</Link>
      </Card>
    </PublicShell>
  ),
});

const TIMELINE: { key: Shipment["status"]; label: string; copy: string }[] = [
  { key: "Booked",     label: "Booked",             copy: "Your goods are booked with the supplier." },
  { key: "At Origin",  label: "At supplier",        copy: "Your goods are at the supplier warehouse." },
  { key: "Loaded",     label: "Loaded",             copy: "Your goods have been loaded into the container." },
  { key: "On Vessel",  label: "On vessel",          copy: "Your goods are on the vessel." },
  { key: "Arrived",    label: "Arrived at port",    copy: "Your goods have arrived at the port." },
  { key: "Customs",    label: "Customs clearance",  copy: "Your goods are clearing customs." },
  { key: "Released",   label: "Released",           copy: "Your goods have been released." },
  { key: "Delivered",  label: "Delivered",          copy: "Your goods have been delivered." },
];

const REQUIRED_DOCS = ["Commercial Invoice", "Packing List", "Bill of Lading", "Form M", "SONCAP"];

function daysUntil(eta: string) {
  return Math.ceil((new Date(eta).getTime() - Date.now()) / 86400000);
}

function nextActionText(s: Shipment) {
  if (s.status === "Customs") return "Prepare clearing documents.";
  if (s.status === "Arrived") return "Pay duty so we can release your goods.";
  if (s.status === "Delayed") return "Wait — we'll send a new ETA on WhatsApp.";
  if (s.status === "At Origin") return "Confirm payment so supplier can load.";
  if (s.status === "Delivered" || s.status === "Released") return "Nothing to do — goods delivered.";
  return "Sit back — we'll update you as your goods move.";
}

function TrackPage() {
  const s = Route.useLoaderData();
  const currentIdx = TIMELINE.findIndex((t) => t.key === s.status);
  const days = daysUntil(s.eta);
  const missing = REQUIRED_DOCS.filter((d) => !s.documents.includes(d));
  const invoice = freightInvoices.find((i) => i.shipment === s.id);
  const delayed = s.status === "Delayed";
  const whatsappHref = buildWhatsAppUrl("trackShipment", {
    reference: s.shipmentNumber,
    origin: s.origin,
    destination: s.destination,
    eta: s.eta,
  });

  return (
    <PublicShell>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <Card className="p-6 shadow-card">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Tracking · {s.shipmentNumber}</div>
              <h1 className="text-xl md:text-2xl font-semibold mt-0.5">{s.name}</h1>
              <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {s.origin} → {s.destination}</div>
            </div>
            <Badge variant="outline" className={`text-xs ${delayed ? "border-destructive/30 text-destructive" : "border-primary/30 text-primary"}`}>{s.status}</Badge>
          </div>

          {/* ETA countdown */}
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center gap-4">
            <Calendar className="h-8 w-8 text-primary shrink-0" />
            <div>
              <div className="text-2xl font-semibold tabular-nums">
                {days < 0 ? `Arrived ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`
                  : days === 0 ? "Arriving today"
                  : `${days} day${days === 1 ? "" : "s"} to go`}
              </div>
              <div className="text-sm text-muted-foreground">Expected in {s.destination.split(",")[0]} on {s.eta}</div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-secondary/40 text-sm flex items-center gap-2">
            <Ship className="h-4 w-4 text-primary" /> {TIMELINE[currentIdx]?.copy ?? "Update coming soon."}
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6 shadow-card">
          <div className="text-sm font-semibold mb-4">Shipment timeline</div>
          <ol className="space-y-3">
            {TIMELINE.map((t, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <li key={t.key} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {done ? <CheckCircle2 className="h-5 w-5 text-success" />
                      : active ? <div className="h-5 w-5 rounded-full bg-primary animate-pulse" />
                      : <Circle className="h-5 w-5 text-muted-foreground/40" />}
                  </div>
                  <div>
                    <div className={`text-sm ${active ? "font-semibold text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</div>
                    {active && <div className="text-xs text-muted-foreground">{t.copy}</div>}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* Documents */}
        <Card className="p-6 shadow-card">
          <div className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Documents checklist</div>
          <div className="space-y-2">
            {REQUIRED_DOCS.map((d) => {
              const have = s.documents.includes(d);
              return (
                <div key={d} className="flex items-center gap-2 text-sm">
                  {have ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-amber-600" />}
                  <span className={have ? "" : "text-amber-700"}>{d} {have ? "" : "— missing"}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Payment */}
        {invoice && (
          <Card className="p-6 shadow-card">
            <div className="text-sm font-semibold mb-3 flex items-center gap-2"><Receipt className="h-4 w-4" /> Freight payment</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold tabular-nums">{fmtMoney(invoice.amount, invoice.ccy)}</div>
                <div className="text-xs text-muted-foreground">Invoice {invoice.id} · due {invoice.due}</div>
              </div>
              <Badge variant="outline" className={`text-xs ${invoice.status === "Paid" ? "border-success/30 text-success" : "border-amber-500/30 text-amber-700"}`}>{invoice.status}</Badge>
            </div>
          </Card>
        )}

        {/* Next action */}
        <Card className="p-6 shadow-card border-primary/20 bg-primary/5">
          <div className="text-sm font-semibold flex items-center gap-2 text-primary"><ArrowRight className="h-4 w-4" /> What to do next</div>
          <p className="text-sm mt-2">{nextActionText(s)}</p>
          {missing.length > 0 && <p className="text-sm text-amber-700 mt-1">Please also send your {missing.join(", ")}.</p>}
        </Card>

        {/* WhatsApp CTA */}
        <Link
          to="/track/whatsapp"
          search={{ ref: s.shipmentNumber, origin: s.origin, destination: s.destination, eta: s.eta }}
          className="block group"
        >
          <Card className="p-5 shadow-card flex items-center justify-between bg-[#25D366] hover:bg-[#1FB855] hover:shadow-lg hover:shadow-[#25D366]/30 transition text-white">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6" />
              <div>
                <div className="font-semibold">Continue on WhatsApp</div>
                <div className="text-xs opacity-90">Share a few details and we'll open WhatsApp pre-filled with your shipment.</div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Card>
        </Link>

        <div className="text-center text-xs text-muted-foreground pb-6">
          Powered by <Link to="/" className="text-primary font-medium">Canta</Link>
        </div>
      </div>
    </PublicShell>
  );
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">Canta</Link>
          <Link to="/track" className="text-xs text-muted-foreground">Track another shipment</Link>
        </div>
      </header>
      <main className="px-4 py-6">{children}</main>
    </div>
  );
}
