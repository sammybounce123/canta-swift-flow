import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function intersperseActionSpacing(children: React.ReactNode) {
  return React.Children.toArray(children).flatMap((child, index) =>
    index === 0
      ? [child]
      : [
          <span
            key={`action-separator-${index}`}
            aria-hidden="true"
            className="contents select-none"
          >
            {" "}
          </span>,
          child,
        ],
  );
}

const ActionGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { label?: string }
>(({ className, label = "Actions", children, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    aria-label={label}
    data-canta-action-group="true"
    className={cn(
      "grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]",
      className,
    )}
    {...props}
  >
    {intersperseActionSpacing(children)}
  </div>
));
ActionGroup.displayName = "ActionGroup";

const ActionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", size = "sm", ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "min-h-11 w-full min-w-0 shrink-0 justify-start whitespace-normal break-words rounded-md px-3 py-2.5 text-left leading-snug hover:border-primary/50 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring [&_svg]:shrink-0 [&>span]:min-w-0 [&>span]:whitespace-normal [&>span]:break-words",
        className,
      )}
      data-canta-action-button="true"
      {...props}
    />
  ),
);
ActionButton.displayName = "ActionButton";

const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { label?: string }
>(({ className, label = "Button actions", children, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    aria-label={label}
    data-canta-button-group="true"
    className={cn("flex w-full min-w-0 flex-wrap items-center gap-2", className)}
    {...props}
  >
    {intersperseActionSpacing(children)}
  </div>
));
ButtonGroup.displayName = "ButtonGroup";

export { ActionGroup, ActionButton, ButtonGroup };
