import { Card } from "@/components/ui/card";
import { StatusLabel, type ReadinessStatus } from "@/components/StatusLabel";
import { ShieldCheck } from "lucide-react";

export function ReadinessBar({
  status,
  cue,
  className = "",
}: {
  status: ReadinessStatus;
  cue: string;
  className?: string;
}) {
  return (
    <Card
      className={`p-3 shadow-card flex flex-wrap items-center gap-3 border-border/70 ${className}`}
    >
      <StatusLabel status={status} />
      <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="truncate">{cue}</span>
      </div>
    </Card>
  );
}
