import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ActionGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { label?: string }
>(({ className, label = "Actions", ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    aria-label={label}
    data-canta-action-group="true"
    className={cn(
      "grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]",
      className,
    )}
    {...props}
  />
));
ActionGroup.displayName = "ActionGroup";

const ActionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", size = "sm", ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "min-h-11 w-full justify-start whitespace-normal rounded-md px-3 py-2.5 text-left leading-snug hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring [&_svg]:shrink-0",
        className,
      )}
      data-canta-action-button="true"
      {...props}
    />
  ),
);
ActionButton.displayName = "ActionButton";

export { ActionGroup, ActionButton };