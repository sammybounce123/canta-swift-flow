import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_TONE,
  addProject,
  formatMoney,
  removeProject,
  updateProject,
  usePartnerProjects,
  type ProjectStatus,
} from "@/lib/partner-projects";

export const Route = createFileRoute("/partner/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Kingsbridge Property Partners" },
      {
        name: "description",
        content:
          "Maintain the list of property projects and developments you sell, then attach them to client payment cases.",
      },
      { property: "og:title", content: "Projects — Kingsbridge Property Partners" },
      {
        property: "og:description",
        content: "Add and manage the developments available for client payment cases.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectsPage,
});

const CURRENCIES = ["GBP", "EUR", "USD", "AED"];

function ProjectsPage() {
  const projects = usePartnerProjects();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [developer, setDeveloper] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [currency, setCurrency] = useState("GBP");
  const [priceFrom, setPriceFrom] = useState("");
  const [units, setUnits] = useState("");
  const [completion, setCompletion] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Selling");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [p.name, p.developer, p.location, p.country].join(" ").toLowerCase().includes(q),
    );
  }, [projects, query]);

  const reset = () => {
    setName("");
    setDeveloper("");
    setLocation("");
    setCountry("United Kingdom");
    setCurrency("GBP");
    setPriceFrom("");
    setUnits("");
    setCompletion("");
    setStatus("Selling");
  };

  const save = () => {
    if (!name.trim() || !location.trim()) {
      toast.error("Project name and location are required");
      return;
    }
    addProject({
      name: name.trim(),
      developer: developer.trim() || "—",
      location: location.trim(),
      country,
      currency,
      priceFrom: Number(priceFrom.replace(/,/g, "")) || 0,
      units: Number(units) || 0,
      completion: completion.trim() || "TBC",
      status,
    });
    toast.success(`${name.trim()} added to your projects`);
    reset();
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The developments your team sells. Projects added here can be selected when creating a
            client payment case.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="h-4 w-4 mr-1.5" /> Add project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add project</DialogTitle>
              <DialogDescription>
                Add a development to your partner catalogue. Details are used on client payment
                cases and reports.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Project name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="The Wharf Residences"
                />
              </FormField>
              <FormField label="Developer">
                <Input
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  placeholder="Kingsbridge Developments"
                />
              </FormField>
              <FormField label="City / location">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Manchester"
                />
              </FormField>
              <FormField label="Country">
                <Input value={country} onChange={(e) => setCountry(e.target.value)} />
              </FormField>
              <FormField label="Currency">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Price from">
                <Input
                  inputMode="numeric"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  placeholder="245000"
                />
              </FormField>
              <FormField label="Units available">
                <Input
                  inputMode="numeric"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  placeholder="84"
                />
              </FormField>
              <FormField label="Completion">
                <Input
                  value={completion}
                  onChange={(e) => setCompletion(e.target.value)}
                  placeholder="Q3 2027"
                />
              </FormField>
              <FormField label="Status">
                <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-primary" onClick={save}>
                Save project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 shadow-card">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, developers, cities"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center shadow-card">
          <Building2 className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No projects yet. Add the developments your team sells.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="p-4 shadow-card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.developer} · {p.location}, {p.country}
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] ${PROJECT_STATUS_TONE[p.status]}`}>
                  {p.status}
                </Badge>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-xs">
                <Stat label="From" value={p.priceFrom ? formatMoney(p.priceFrom, p.currency) : "—"} />
                <Stat label="Units" value={p.units ? String(p.units) : "—"} />
                <Stat label="Completion" value={p.completion} />
              </dl>
              <div className="flex items-center justify-between gap-2 pt-1 border-t">
                <Select
                  value={p.status}
                  onValueChange={(v) => updateProject(p.id, { status: v as ProjectStatus })}
                >
                  <SelectTrigger className="h-8 w-[150px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    removeProject(p.id);
                    toast.success(`${p.name} removed`);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
