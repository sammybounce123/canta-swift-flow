import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondary,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void };
  secondary?: { label: string; onClick?: () => void };
}) {
  return (
    <Card className="p-10 text-center shadow-card">
      <div className="mx-auto h-12 w-12 rounded-full bg-muted grid place-items-center text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div className="mt-4 text-base font-semibold">{title}</div>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{description}</p>
      )}
      {(action || secondary) && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {action && <Button onClick={action.onClick}>{action.label}</Button>}
          {secondary && (
            <Button variant="outline" onClick={secondary.onClick}>
              {secondary.label}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
