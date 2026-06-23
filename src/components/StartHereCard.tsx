import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export type StartHereAction = {
  label: string;
  to?: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
};

export function StartHereCard({
  eyebrow = "Start here",
  title,
  description,
  primary,
  secondary,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  primary: StartHereAction;
  secondary?: StartHereAction[];
}) {
  const PrimaryBtn = (
    <Button size="lg" className="shadow-md" onClick={primary.onClick} asChild={!!(primary.to || primary.href)}>
      {primary.to ? (
        <Link to={primary.to}>
          <Sparkles className="h-4 w-4" /> {primary.label} <ArrowRight className="h-4 w-4" />
        </Link>
      ) : primary.href ? (
        <a href={primary.href} target="_blank" rel="noopener noreferrer">
          <Sparkles className="h-4 w-4" /> {primary.label} <ArrowRight className="h-4 w-4" />
        </a>
      ) : (
        <span><Sparkles className="h-4 w-4" /> {primary.label} <ArrowRight className="h-4 w-4" /></span>
      )}
    </Button>
  );

  return (
    <Card className="p-5 md:p-6 shadow-card border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-widest text-primary font-semibold">{eyebrow}</div>
          <h2 className="text-xl md:text-2xl font-semibold mt-1">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
        </div>
        <div className="shrink-0">{PrimaryBtn}</div>
      </div>
      {secondary && secondary.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {secondary.map((s, i) => (
            <Button key={i} size="sm" variant="outline" onClick={s.onClick} asChild={!!(s.to || s.href)}>
              {s.to ? (
                <Link to={s.to}>{s.icon}{s.icon && " "}{s.label}</Link>
              ) : s.href ? (
                <a href={s.href} target="_blank" rel="noopener noreferrer">{s.icon}{s.icon && " "}{s.label}</a>
              ) : (
                <span>{s.icon}{s.icon && " "}{s.label}</span>
              )}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}
