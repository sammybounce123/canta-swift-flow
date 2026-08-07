import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";
import type { ReadinessStatus } from "@/components/StatusLabel";

export function WorkspacePlaceholder({
  title,
  subtitle,
  icon,
  bullets,
  primaryAction,
  learnMore,
  readiness,
  trustCue,
}: {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  bullets: string[];
  primaryAction?: { label: string; onClick?: () => void };
  learnMore?: { to: string; label: string };
  readiness?: ReadinessStatus;
  trustCue?: string;
}) {
  const onPrimary =
    primaryAction?.onClick ?? (() => toast.success(`${title} module — coming soon`));
  return (
    <div className="space-y-6">
      {readiness && (
        <ReadinessBar
          status={readiness}
          cue={trustCue ?? `${title} availability depends on activation and compliance review.`}
        />
      )}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" /> Module
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight mt-2 flex items-center gap-2">
            {icon}
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
        </div>
        <Button onClick={onPrimary}>{primaryAction?.label ?? "Get started"}</Button>
      </div>

      <Card className="p-6 shadow-card">
        <div className="text-sm font-semibold mb-3">What you can do here</div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2 p-3 rounded-lg bg-secondary/40 border border-border"
            >
              <ArrowRight className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        {learnMore && (
          <Link
            to={learnMore.to as never}
            className="inline-flex items-center gap-1 mt-5 text-sm font-medium text-primary hover:underline"
          >
            {learnMore.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </Card>
    </div>
  );
}
