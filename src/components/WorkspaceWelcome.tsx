import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { dismissWelcome, getSegment, isWelcomeDismissed, type WorkspaceType } from "@/lib/profile";

export function WorkspaceWelcome({ workspace }: { workspace: WorkspaceType }) {
  const segment = getSegment(workspace);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!isWelcomeDismissed(workspace));
  }, [workspace]);

  if (!segment || !show) return null;

  return (
    <Card className="p-4 shadow-card border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent grid place-items-center flex-shrink-0">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">Welcome to {segment.shortLabel}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{segment.welcome}</div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          dismissWelcome(workspace);
          setShow(false);
        }}
        className="flex-shrink-0"
        aria-label="Dismiss welcome"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </Card>
  );
}
