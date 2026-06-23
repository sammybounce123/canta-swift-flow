import { Badge } from "@/components/ui/badge";
import { Sparkles, Wrench, Clock, Phone, CheckCircle2 } from "lucide-react";

export type ReadinessStatus = "Live" | "Demo Preview" | "Requires Setup" | "Coming Soon" | "Contact Canta to Activate";

const TONE: Record<ReadinessStatus, string> = {
  "Live": "bg-success/15 text-success border-success/30",
  "Demo Preview": "bg-primary/10 text-primary border-primary/30",
  "Requires Setup": "bg-warning/15 text-warning border-warning/30",
  "Coming Soon": "bg-muted text-muted-foreground border-border",
  "Contact Canta to Activate": "bg-accent text-accent-foreground border-border",
};

const ICONS: Record<ReadinessStatus, React.ComponentType<{ className?: string }>> = {
  "Live": CheckCircle2,
  "Demo Preview": Sparkles,
  "Requires Setup": Wrench,
  "Coming Soon": Clock,
  "Contact Canta to Activate": Phone,
};

export function StatusLabel({ status, className = "" }: { status: ReadinessStatus; className?: string }) {
  const Icon = ICONS[status];
  return (
    <Badge variant="outline" className={`text-[10px] gap-1 ${TONE[status]} ${className}`}>
      <Icon className="h-3 w-3" /> {status}
    </Badge>
  );
}
