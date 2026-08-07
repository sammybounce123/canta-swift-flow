import { Badge } from "@/components/ui/badge";
import { Sparkles, Wrench, Clock, Phone, CheckCircle2 } from "lucide-react";

export type ReadinessStatus =
  | "Live"
  | "Demo Preview"
  | "Requires Setup"
  | "Coming Soon"
  | "Contact Canta to Activate"
  | "Demo data"
  | "Payout tracking active"
  | "Provider confirmation required";

const TONE: Record<ReadinessStatus, string> = {
  Live: "bg-success/15 text-success border-success/30",
  "Demo Preview": "bg-primary/10 text-primary border-primary/30",
  "Requires Setup": "bg-warning/15 text-warning border-warning/30",
  "Coming Soon": "bg-muted text-muted-foreground border-border",
  "Contact Canta to Activate": "bg-accent text-accent-foreground border-border",
  "Demo data": "bg-primary/10 text-primary border-primary/30",
  "Payout tracking active": "bg-success/15 text-success border-success/30",
  "Provider confirmation required": "bg-warning/15 text-warning border-warning/30",
};

const ICONS: Record<ReadinessStatus, React.ComponentType<{ className?: string }>> = {
  Live: CheckCircle2,
  "Demo Preview": Sparkles,
  "Requires Setup": Wrench,
  "Coming Soon": Clock,
  "Contact Canta to Activate": Phone,
  "Demo data": Sparkles,
  "Payout tracking active": CheckCircle2,
  "Provider confirmation required": Wrench,
};

export function StatusLabel({
  status,
  className = "",
}: {
  status: ReadinessStatus;
  className?: string;
}) {
  const Icon = ICONS[status];
  return (
    <Badge variant="outline" className={`text-[10px] gap-1 ${TONE[status]} ${className}`}>
      <Icon className="h-3 w-3" /> {status}
    </Badge>
  );
}
