import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  shipments,
  shippingLines,
  fmtMoney,
  type Shipment,
  type ShipmentVertical,
} from "@/lib/mock";
import {
  Plus,
  Search,
  Ship,
  Anchor,
  Truck,
  Plane,
  Package,
  Calendar as CalendarIcon,
  List,
  FileText,
  ExternalLink,
  PackageSearch,
  BellRing,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/shipments")({
  head: () => ({ meta: [{ title: "Shipments — Canta" }] }),
  component: ShipmentsPage,
});

// Tracking-only statuses. Canta records movement up to arrival ("landed").
// Anything after arrival (customs clearance, release, delivery) is NOT tracked
// automatically — the importer records it manually.
const TRACKED_STATUSES = [
  "Booked",
  "At Origin",
  "Loaded",
  "On Vessel",
  "Arrived",
  "Delayed",
] as const;
type TrackedStatus = (typeof TRACKED_STATUSES)[number];

function trackedStatus(s: Shipment): TrackedStatus {
  if (s.status === "Customs" || s.status === "Released" || s.status === "Delivered")
    return "Arrived";
  return s.status as TrackedStatus;
}

export const CLEARANCE_OPTIONS = [
  "Not updated",
  "Clearing started",
  "Duty paid",
  "Cleared",
  "Delivered",
] as const;
type Clearance = (typeof CLEARANCE_OPTIONS)[number];

const STATUS_CARDS: { label: string; statuses: TrackedStatus[]; tone: string }[] = [
  {
    label: "Active",
    statuses: ["Booked", "At Origin", "Loaded"],
    tone: "bg-primary/10 text-primary border-primary/20",
  },
  {
    label: "On Vessel",
    statuses: ["On Vessel"],
    tone: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  {
    label: "Landed",
    statuses: ["Arrived"],
    tone: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  {
    label: "Delayed",
    statuses: ["Delayed"],
    tone: "bg-destructive/10 text-destructive border-destructive/20",
  },
];

function ShipmentsPage() {
  const [q, setQ] = useState("");
  const [statusCard, setStatusCard] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [fStatus, setFStatus] = useState("all");
  const [fLine, setFLine] = useState("all");
  const [fOrigin, setFOrigin] = useState("all");
  const [fDest, setFDest] = useState("all");
  const [fImporter, setFImporter] = useState("all");
  const [fSupplier, setFSupplier] = useState("all");
  const [fForwarder, setFForwarder] = useState("all");
  const [fEta, setFEta] = useState("");
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [clearance, setClearance] = useState<Record<string, Clearance>>({});
  const [dismissedLanded, setDismissedLanded] = useState<Set<string>>(new Set());

  const uniq = (k: keyof Shipment) =>
    Array.from(new Set(shipments.map((s) => s[k] as string).filter(Boolean)));

  const filtered = useMemo(
    () =>
      shipments.filter((s) => {
        const ts = trackedStatus(s);
        const cardOk =
          !statusCard || STATUS_CARDS.find((c) => c.label === statusCard)?.statuses.includes(ts);
        const qOk =
          !q ||
          `${s.id} ${s.name} ${s.shipmentNumber} ${s.container ?? ""} ${s.bl ?? ""} ${s.supplier} ${s.importer} ${s.category} ${s.vertical.kind === "Vehicles" ? s.vertical.vin : ""}`
            .toLowerCase()
            .includes(q.toLowerCase());
        if (!cardOk || !qOk) return false;
        if (fStatus !== "all" && ts !== fStatus) return false;
        if (fLine !== "all" && s.shippingLine !== fLine) return false;
        if (fOrigin !== "all" && s.origin !== fOrigin) return false;
        if (fDest !== "all" && s.destination !== fDest) return false;
        if (fImporter !== "all" && s.importer !== fImporter) return false;
        if (fSupplier !== "all" && s.supplier !== fSupplier) return false;
        if (fForwarder !== "all" && s.forwarder !== fForwarder) return false;
        if (fEta && s.eta !== fEta) return false;
        return true;
      }),
    [q, statusCard, fStatus, fLine, fOrigin, fDest, fImporter, fSupplier, fForwarder, fEta],
  );

  // Landed notifications: goods that have arrived at destination port and have
  // no clearance update recorded yet.
  const landed = shipments.filter(
    (s) =>
      trackedStatus(s) === "Arrived" &&
      (clearance[s.id] ?? "Not updated") === "Not updated" &&
      !dismissedLanded.has(s.id),
  );

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Tracking depends on the accuracy of BL, container, shipment, VIN, or AWB details."
      />
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Shipments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and record movement up to arrival. Customs clearance and delivery are recorded by
            you — Canta does not detect them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PackageSearch className="h-4 w-4 mr-1.5" /> Claim shipment
              </Button>
            </DialogTrigger>
            <ClaimShipmentDialog
              onClose={() => setClaimOpen(false)}
              onClaim={(id) => setClaimedIds((prev) => new Set(prev).add(id))}
            />
          </Dialog>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary">
                <Plus className="h-4 w-4 mr-1.5" /> New Shipment
              </Button>
            </DialogTrigger>
            <NewShipmentDialog onClose={() => setCreateOpen(false)} />
          </Dialog>
        </div>
      </div>

      {/* Goods landed notifications */}
      {landed.length > 0 && (
        <Card className="p-4 shadow-card border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
            <BellRing className="h-4 w-4" /> {landed.length} shipment
            {landed.length === 1 ? " has" : "s have"} landed
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Goods have arrived at the destination port. Clearance status is not tracked
            automatically — record it yourself once your agent confirms.
          </p>
          <div className="mt-3 space-y-2">
            {landed.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 flex-wrap rounded-lg border border-amber-500/20 bg-card px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {s.shipmentNumber} · {s.destination}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {s.name} · arrived {s.eta}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelected(s)}>
                    Record clearance
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDismissedLanded((p) => new Set(p).add(s.id))}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {STATUS_CARDS.map((g) => {
          const count = shipments.filter((s) => g.statuses.includes(trackedStatus(s))).length;
          const active = statusCard === g.label;
          return (
            <button
              key={g.label}
              onClick={() => setStatusCard(active ? null : g.label)}
              className={`p-4 rounded-xl border text-left transition ${active ? "ring-2 ring-primary " + g.tone : g.tone + " hover:opacity-80"}`}
            >
              <div className="text-[10px] uppercase tracking-widest">{g.label}</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{count}</div>
            </button>
          );
        })}
        <div className="p-4 rounded-xl border border-dashed bg-secondary/30 text-left">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Cleared (you recorded)
          </div>
          <div className="text-2xl font-semibold tabular-nums mt-1">
            {Object.values(clearance).filter((c) => c === "Cleared" || c === "Delivered").length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 shadow-card space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Container, BL, shipment #, VIN, supplier, client, category…"
              className="pl-9"
            />
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "calendar")}>
            <TabsList>
              <TabsTrigger value="list">
                <List className="h-3.5 w-3.5 mr-1.5" /> List
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" /> ETA Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <FilterSelect
            label="Tracking status"
            value={fStatus}
            onChange={setFStatus}
            options={[...TRACKED_STATUSES]}
          />
          <FilterSelect
            label="Shipping line"
            value={fLine}
            onChange={setFLine}
            options={shippingLines}
          />
          <FilterSelect
            label="Origin"
            value={fOrigin}
            onChange={setFOrigin}
            options={uniq("origin")}
          />
          <FilterSelect
            label="Destination"
            value={fDest}
            onChange={setFDest}
            options={uniq("destination")}
          />
          <FilterSelect
            label="Client"
            value={fImporter}
            onChange={setFImporter}
            options={uniq("importer")}
          />
          <FilterSelect
            label="Supplier"
            value={fSupplier}
            onChange={setFSupplier}
            options={uniq("supplier")}
          />
          <FilterSelect
            label="Forwarder"
            value={fForwarder}
            onChange={setFForwarder}
            options={uniq("forwarder")}
          />
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              ETA
            </div>
            <Input
              type="date"
              value={fEta}
              onChange={(e) => setFEta(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>
      </Card>

      {view === "list" ? (
        <ShipmentTable
          rows={filtered}
          onSelect={setSelected}
          claimedIds={claimedIds}
          clearance={clearance}
        />
      ) : (
        <EtaCalendar rows={filtered} onSelect={setSelected} />
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <ShipmentDetail
            s={selected}
            clearance={clearance[selected.id] ?? "Not updated"}
            onClearanceChange={(c) => {
              setClearance((prev) => ({ ...prev, [selected.id]: c }));
              toast.success(`Clearance status recorded: ${c}`);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TypeIcon({ type }: { type: Shipment["type"] }) {
  if (type === "RORO") return <Truck className="h-3.5 w-3.5 text-muted-foreground" />;
  if (type === "Air Freight") return <Plane className="h-3.5 w-3.5 text-muted-foreground" />;
  if (type === "Courier") return <Package className="h-3.5 w-3.5 text-muted-foreground" />;
  if (type === "Loose Cargo") return <Anchor className="h-3.5 w-3.5 text-muted-foreground" />;
  return <Ship className="h-3.5 w-3.5 text-muted-foreground" />;
}

function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    "On Vessel": "bg-blue-500/15 text-blue-700 border-blue-500/30",
    Arrived: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    Customs: "bg-orange-500/15 text-orange-700 border-orange-500/30",
    Delivered: "bg-success/15 text-success border-success/30",
    Released: "bg-success/15 text-success border-success/30",
    Delayed: "bg-destructive/15 text-destructive border-destructive/30",
    Loaded: "bg-primary/10 text-primary border-primary/20",
    "At Origin": "bg-secondary text-secondary-foreground border-border",
    Booked: "bg-secondary text-secondary-foreground border-border",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full border ${tones[status] ?? "bg-secondary"}`}
    >
      {status}
    </span>
  );
}

function ClearanceBadge({ value }: { value: Clearance }) {
  const tones: Record<Clearance, string> = {
    "Not updated": "bg-secondary text-muted-foreground border-border",
    "Clearing started": "bg-orange-500/15 text-orange-700 border-orange-500/30",
    "Duty paid": "bg-blue-500/15 text-blue-700 border-blue-500/30",
    Cleared: "bg-success/15 text-success border-success/30",
    Delivered: "bg-success/15 text-success border-success/30",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tones[value]}`}>{value}</span>
  );
}

function ShipmentTable({
  rows,
  onSelect,
  claimedIds,
  clearance,
}: {
  rows: Shipment[];
  onSelect: (s: Shipment) => void;
  claimedIds: Set<string>;
  clearance: Record<string, Clearance>;
}) {
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-4 py-3">Shipment</th>
              <th className="px-4 py-3">Type · Line</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Client · Supplier</th>
              <th className="px-4 py-3">Forwarder</th>
              <th className="px-4 py-3">ETA / Arrival</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3">Tracking</th>
              <th className="px-4 py-3">Clearance (recorded)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.id}
                onClick={() => onSelect(s)}
                className="border-t border-border hover:bg-secondary/30 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="font-medium flex items-center gap-2">
                    <TypeIcon type={s.type} /> {s.shipmentNumber}
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                    {s.name}
                  </div>
                  {s.container && (
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {s.container} · {s.bl}
                    </div>
                  )}
                  {s.vertical.kind === "Vehicles" && (
                    <div className="text-[10px] font-mono text-muted-foreground">
                      VIN {s.vertical.vin}
                    </div>
                  )}
                  {claimedIds.has(s.id) && (
                    <Badge
                      variant="outline"
                      className="text-[10px] mt-1 border-success/30 text-success"
                    >
                      Claimed by you
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px]">
                    {s.type}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">{s.shippingLine}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{s.origin}</div>
                  <div className="text-xs text-muted-foreground">→ {s.destination}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="truncate max-w-[180px]">{s.importer}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {s.supplier}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{s.forwarder}</td>
                <td className="px-4 py-3 tabular-nums text-xs">
                  <div>{s.eta}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {trackedStatus(s) === "Arrived" ? "Arrived at port" : "Estimated arrival"}
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">
                  {fmtMoney(s.value, s.ccy)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={trackedStatus(s)} />
                </td>
                <td className="px-4 py-3">
                  <ClearanceBadge value={clearance[s.id] ?? "Not updated"} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No shipments match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function EtaCalendar({ rows, onSelect }: { rows: Shipment[]; onSelect: (s: Shipment) => void }) {
  // Group by ETA month
  const groups = useMemo(() => {
    const map = new Map<string, Shipment[]>();
    rows.forEach((s) => {
      const month = s.eta.slice(0, 7); // YYYY-MM
      if (!map.has(month)) map.set(month, []);
      map.get(month)!.push(s);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  return (
    <div className="space-y-6">
      {groups.map(([month, list]) => {
        const [y, m] = month.split("-").map(Number);
        const monthName = new Date(y, m - 1, 1).toLocaleString(undefined, {
          month: "long",
          year: "numeric",
        });
        const firstDay = new Date(y, m - 1, 1).getDay();
        const daysInMonth = new Date(y, m, 0).getDate();
        const cells: { day: number | null; ships: Shipment[] }[] = [];
        for (let i = 0; i < firstDay; i++) cells.push({ day: null, ships: [] });
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${month}-${String(d).padStart(2, "0")}`;
          cells.push({ day: d, ships: list.filter((s) => s.eta === dateStr) });
        }
        return (
          <Card key={month} className="p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{monthName}</h3>
              <Badge variant="outline" className="text-[10px]">
                {list.length} ETA{list.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[10px] text-muted-foreground mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="px-2 py-1 uppercase tracking-widest">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((c, i) => (
                <div
                  key={i}
                  className={`min-h-[88px] rounded-md border p-1.5 ${c.day ? "bg-card" : "bg-secondary/20 border-dashed"}`}
                >
                  {c.day && (
                    <div className="text-[10px] text-muted-foreground tabular-nums mb-1">
                      {c.day}
                    </div>
                  )}
                  <div className="space-y-1">
                    {c.ships.slice(0, 3).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onSelect(s)}
                        className="w-full text-left text-[10px] px-1.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 truncate"
                      >
                        {s.shipmentNumber}
                      </button>
                    ))}
                    {c.ships.length > 3 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{c.ships.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
      {groups.length === 0 && (
        <Card className="p-12 text-center text-sm text-muted-foreground shadow-card">
          No shipments with matching ETAs.
        </Card>
      )}
    </div>
  );
}

function ShipmentDetail({
  s,
  clearance,
  onClearanceChange,
}: {
  s: Shipment;
  clearance: Clearance;
  onClearanceChange: (c: Clearance) => void;
}) {
  const [draft, setDraft] = useState<Clearance>(clearance);
  const ts = trackedStatus(s);
  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <TypeIcon type={s.type} /> {s.shipmentNumber} <StatusBadge status={ts} />
        </DialogTitle>
        <p className="text-xs text-muted-foreground">{s.name}</p>
      </DialogHeader>

      {ts === "Arrived" && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
          <BellRing className="h-3.5 w-3.5" /> Goods have landed at {s.destination} on {s.eta}.
        </div>
      )}

      {/* User-recorded clearance — never inferred by Canta */}
      <Card className="p-4 shadow-card">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Clearance status (recorded by you)
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Canta tracks movement up to arrival only. Customs clearance, release and delivery are not
          detected automatically — update them here when confirmed.
        </p>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Select value={draft} onValueChange={(v) => setDraft(v as Clearance)}>
            <SelectTrigger className="h-9 text-xs w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLEARANCE_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="bg-primary"
            disabled={draft === clearance}
            onClick={() => onClearanceChange(draft)}
          >
            Save update
          </Button>
          <ClearanceBadge value={clearance} />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <Field label="Shipment type" value={s.type} />
        <Field label="Shipping line" value={s.shippingLine} />
        <Field label="Vessel" value={s.vessel ?? "—"} />
        <Field label="Container #" value={s.container ?? "—"} mono />
        <Field label="BL #" value={s.bl ?? "—"} mono />
        <Field label="Origin" value={s.origin} />
        <Field label="Destination" value={s.destination} />
        <Field label="ETA" value={s.eta} />
        <Field label="Value" value={fmtMoney(s.value, s.ccy)} />
        <Field label="Client / Importer" value={s.importer} />
        <Field label="Supplier" value={s.supplier} />
        <Field label="Freight Forwarder" value={s.forwarder} />
        <Field label="Goods category" value={s.category} />
      </div>

      <VerticalDetails v={s.vertical} />

      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Documents
        </div>
        <div className="flex flex-wrap gap-2">
          {s.documents.map((d) => (
            <Badge key={d} variant="outline" className="text-[10px] gap-1">
              <FileText className="h-3 w-3" /> {d}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Notes
        </div>
        <p className="text-sm text-foreground/80">{s.notes}</p>
      </div>
    </DialogContent>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function VerticalDetails({ v }: { v: ShipmentVertical }) {
  return (
    <Card className="p-4 bg-secondary/30 border-dashed">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Vertical · {v.kind}
      </div>
      {v.kind === "Vehicles" && (
        <div className="grid md:grid-cols-[160px_1fr] gap-4">
          <img
            src={v.image}
            alt={`${v.make} ${v.model}`}
            className="rounded-lg object-cover w-full h-32"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <Field label="VIN" value={v.vin} mono />
            <Field label="Make" value={v.make} />
            <Field label="Model" value={v.model} />
            <Field label="Year" value={String(v.year)} />
            <Field label="Color" value={v.color} />
            <Field label="Vehicle status" value={v.vehicleStatus} />
            <div className="col-span-full">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Auction / source
              </div>
              <a href="#" className="text-primary text-xs inline-flex items-center gap-1 mt-0.5">
                {v.source} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
      {v.kind === "Electronics" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <Field label="SKU" value={v.sku} mono />
          <Field label="Cartons" value={String(v.cartons)} />
          <Field label="Units" value={v.units.toLocaleString()} />
          <Field label="Product category" value={v.productCategory} />
          <Field label="Supplier invoice #" value={v.supplierInvoice} mono />
        </div>
      )}
      {v.kind === "Fashion" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <Field label="Bales / cartons" value={String(v.bales)} />
          <Field label="Size mix" value={v.sizeMix} />
          <Field label="Product category" value={v.productCategory} />
        </div>
      )}
      {v.kind === "Machinery" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <Field label="Serial #" value={v.serial} mono />
          <Field label="Weight" value={`${v.weightKg.toLocaleString()} kg`} />
          <Field label="Machine category" value={v.machineCategory} />
          <div className="col-span-full">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Installation documents
            </div>
            <div className="text-xs mt-0.5">{v.installDocs}</div>
          </div>
        </div>
      )}
      {v.kind === "General" && (
        <div className="text-xs">
          <Field label="Product category" value={v.productCategory} />
        </div>
      )}
    </Card>
  );
}

function NewShipmentDialog({ onClose }: { onClose: () => void }) {
  const [template, setTemplate] = useState<
    "Vehicles" | "Electronics" | "Fashion" | "Machinery" | "General"
  >("Electronics");
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>New shipment</DialogTitle>
        <p className="text-xs text-muted-foreground">
          Pick a vertical template — fields adapt to the goods you're shipping.
        </p>
      </DialogHeader>

      <div>
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
          Vertical template
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
          {(["Vehicles", "Electronics", "Fashion", "Machinery", "General"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`text-xs px-3 py-2 rounded-lg border transition ${template === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Shipment name">
          <Input placeholder="e.g. Shenzhen → Lagos Q3" />
        </FormField>
        <FormField label="Shipment type">
          <Select defaultValue="Container">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Container", "RORO", "Air Freight", "Courier", "Loose Cargo"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Shipping line">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {shippingLines.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Vessel name">
          <Input placeholder="e.g. MSC Antonia" />
        </FormField>
        <FormField label="Container #">
          <Input placeholder="MSCU7762213" />
        </FormField>
        <FormField label="BL #">
          <Input placeholder="BL-998211" />
        </FormField>
        <FormField label="Shipment #">
          <Input placeholder="Auto-generated" />
        </FormField>
        <FormField label="ETA">
          <Input type="date" />
        </FormField>
        <FormField label="Origin">
          <Input placeholder="Guangzhou, CN" />
        </FormField>
        <FormField label="Destination">
          <Input placeholder="Apapa, LOS" />
        </FormField>
        <FormField label="Client / Importer">
          <Input placeholder="ABC Electronics" />
        </FormField>
        <FormField label="Supplier">
          <Input placeholder="Guangzhou Tech Factory" />
        </FormField>
        <FormField label="Freight forwarder">
          <Input placeholder="Dragon Freight Nigeria" />
        </FormField>
        <FormField label="Goods category">
          <Input placeholder="Consumer Electronics" />
        </FormField>
      </div>

      {/* Vertical-specific fields */}
      <div className="rounded-lg border border-dashed p-3 space-y-3 bg-secondary/30">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {template} fields
        </div>
        <div className="grid grid-cols-2 gap-3">
          {template === "Vehicles" && (
            <>
              <FormField label="VIN">
                <Input placeholder="1HGCM82633A123456" />
              </FormField>
              <FormField label="Make">
                <Input placeholder="Toyota" />
              </FormField>
              <FormField label="Model">
                <Input placeholder="Highlander" />
              </FormField>
              <FormField label="Year">
                <Input type="number" placeholder="2020" />
              </FormField>
              <FormField label="Color">
                <Input placeholder="Pearl White" />
              </FormField>
              <FormField label="Vehicle status">
                <Input placeholder="Loaded on vessel" />
              </FormField>
              <FormField label="Image URL">
                <Input placeholder="https://…" />
              </FormField>
              <FormField label="Auction / source">
                <Input placeholder="Copart · Lot #88210" />
              </FormField>
            </>
          )}
          {template === "Electronics" && (
            <>
              <FormField label="SKU">
                <Input placeholder="ELC-MIX-Q2" />
              </FormField>
              <FormField label="Cartons">
                <Input type="number" placeholder="240" />
              </FormField>
              <FormField label="Units">
                <Input type="number" placeholder="6480" />
              </FormField>
              <FormField label="Product category">
                <Input placeholder="Consumer Electronics" />
              </FormField>
              <FormField label="Supplier invoice #">
                <Input placeholder="INV-2241" />
              </FormField>
            </>
          )}
          {template === "Fashion" && (
            <>
              <FormField label="Bale / carton count">
                <Input type="number" placeholder="180" />
              </FormField>
              <FormField label="Size mix">
                <Input placeholder="S 25% · M 40% · L 25% · XL 10%" />
              </FormField>
              <FormField label="Product category">
                <Input placeholder="Mixed Apparel" />
              </FormField>
            </>
          )}
          {template === "Machinery" && (
            <>
              <FormField label="Serial #">
                <Input placeholder="CNC-9981-22A" />
              </FormField>
              <FormField label="Weight (kg)">
                <Input type="number" placeholder="4200" />
              </FormField>
              <FormField label="Machine category">
                <Input placeholder="CNC Milling" />
              </FormField>
              <FormField label="Installation documents">
                <Input placeholder="Install manual + schematics" />
              </FormField>
            </>
          )}
          {template === "General" && (
            <FormField label="Product category">
              <Input placeholder="Office Furniture" />
            </FormField>
          )}
        </div>
      </div>

      <FormField label="Notes">
        <Textarea placeholder="Any handling instructions, risk notes, or comments…" />
      </FormField>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-primary"
          onClick={() => {
            toast.success("Shipment created");
            onClose();
          }}
        >
          Create shipment
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ClaimShipmentDialog({
  onClose,
  onClaim,
}: {
  onClose: () => void;
  onClaim: (id: string) => void;
}) {
  const [ref, setRef] = useState("");
  const [error, setError] = useState("");

  function submit() {
    const value = ref.trim();
    if (!value) {
      setError("Enter a BL or container number to claim your shipment.");
      return;
    }
    const match = shipments.find(
      (s) =>
        s.bl?.toLowerCase() === value.toLowerCase() ||
        s.container?.toLowerCase() === value.toLowerCase(),
    );
    if (!match) {
      setError(
        "We couldn't find a shipment with that BL / container number. Check the details and try again.",
      );
      return;
    }
    onClaim(match.id);
    toast.success(`Shipment ${match.shipmentNumber} claimed`);
    setRef("");
    setError("");
    onClose();
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Claim shipment</DialogTitle>
        <p className="text-xs text-muted-foreground">
          Enter your BL or container number to link an unassigned shipment to your account.
        </p>
      </DialogHeader>
      <div>
        <Label className="text-xs">BL / Container number</Label>
        <Input
          value={ref}
          onChange={(e) => {
            setRef(e.target.value);
            setError("");
          }}
          placeholder="e.g. MSCU7762213 or BL-998211"
          aria-invalid={!!error}
        />
        {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="bg-primary" onClick={submit}>
          Claim shipment
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
