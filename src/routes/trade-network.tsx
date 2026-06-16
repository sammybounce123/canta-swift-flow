import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Factory, Users, FileText, Receipt, Banknote, Globe, MessageSquare,
  ArrowRight, Handshake,
} from "lucide-react";
import { loadProfile } from "@/lib/profile";
import { SUPPLIERS, BUYERS } from "@/lib/trade-network";

export const Route = createFileRoute("/trade-network")({
  head: () => ({ meta: [{ title: "Canta Trade Network" }] }),
  component: TradeNetworkPage,
});

function TradeNetworkPage() {
  const profile = loadProfile();
  const isSupplier = profile?.workspace_type === "supplier_dashboard";
  const isImporter = profile?.workspace_type === "importer_portal";

  const supplierTiles = [
    { to: "/verified-buyers", label: "Verified Buyers", desc: "Discover screened African buyers ready to import.", icon: Users, count: BUYERS.length },
    { to: "/buyers", label: "Buyer Requests", desc: "Quote requests sent by buyers to your business.", icon: MessageSquare },
    { to: "/invoices", label: "Invoices", desc: "Invoice buyers and track payment status.", icon: Receipt },
    { to: "/escrow", label: "Escrow", desc: "Hold funds securely until shipment milestones.", icon: ShieldCheck },
    { to: "/collections", label: "Settlements", desc: "Receive global settlement in your local currency.", icon: Banknote },
    { to: "/documents", label: "Trade Documents", desc: "BLs, packing lists, certificates of origin.", icon: FileText },
  ];

  const importerTiles = [
    { to: "/verified-suppliers", label: "Verified Suppliers", desc: "Screened suppliers across China, Turkey, UAE, India.", icon: ShieldCheck, count: SUPPLIERS.length },
    { to: "/my-suppliers", label: "My Suppliers", desc: "Your private supplier list and trade history.", icon: Factory },
    { to: "/trade-desk", label: "Trade Files & Quotes", desc: "Quote requests, POs and supplier invoices.", icon: FileText },
    { to: "/verification-center", label: "Supplier Verification", desc: "Ask Canta to verify any supplier you trade with.", icon: ShieldCheck },
    { to: "/payments", label: "Supplier Payments", desc: "Pay suppliers via FX, escrow or stablecoin.", icon: Banknote },
    { to: "/shipments", label: "Shipments", desc: "Track containers, ETAs and arrival readiness.", icon: Globe },
  ];

  const tiles = isSupplier ? supplierTiles : isImporter ? importerTiles : [...importerTiles, ...supplierTiles];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6">
        <Badge variant="outline" className="gap-1 mb-3"><Handshake className="h-3 w-3" /> Canta Trade Network</Badge>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">A trusted network for African trade</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Canta connects screened suppliers in China, Turkey, UAE and India with verified African buyers — backed by escrow, KYB,
          dispute history and payment reliability scores. Every counterparty is checked before contact details are shared.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">{SUPPLIERS.length} verified suppliers</Badge>
          <Badge variant="secondary">{BUYERS.length} verified buyers</Badge>
          <Badge variant="secondary">Escrow & settlement built-in</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="block">
            <Card className="p-5 h-full hover:shadow-card hover:-translate-y-0.5 transition">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <t.icon className="h-5 w-5" />
                </div>
                {"count" in t && t.count !== undefined && (
                  <Badge variant="secondary" className="text-[10px]">{t.count} listed</Badge>
                )}
              </div>
              <div className="mt-3 font-semibold">{t.label}</div>
              <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              <div className="mt-3 text-xs text-accent inline-flex items-center gap-1">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
