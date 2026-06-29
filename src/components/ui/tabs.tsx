import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function intersperseTabSpacing(children: React.ReactNode) {
  return React.Children.toArray(children).flatMap((child, index) => (
    index === 0
      ? [child]
      : [
          <span key={`tab-separator-${index}`} aria-hidden="true" className="contents select-none">
            {" "}
          </span>,
          child,
        ]
  ));
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-canta-tabs-list="true"
    className={cn(
      "!flex !h-auto w-full min-w-0 !flex-wrap items-center justify-start !gap-2 overflow-visible rounded-lg border border-border bg-muted/60 p-2 text-muted-foreground",
      className,
    )}
    {...props}
  >
    {intersperseTabSpacing(children)}
  </TabsPrimitive.List>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-canta-tabs-trigger="true"
    className={cn(
      "!inline-flex min-h-10 max-w-full flex-none shrink-0 select-none items-center justify-center gap-1.5 whitespace-normal break-words rounded-md border border-border bg-background/80 px-3 py-2 text-center text-sm font-medium leading-snug ring-offset-background transition-all hover:border-primary/40 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
