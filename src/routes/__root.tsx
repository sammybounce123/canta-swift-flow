import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ActionsProvider } from "@/components/ActionsProvider";
import { RoleProvider } from "@/components/RoleProvider";
import { Toaster } from "@/components/ui/sonner";
import { useRouterState } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Canta — Cross-Border Payments & FX for Enterprises" },
      { name: "description", content: "Enterprise-grade cross-border payments and FX platform for oil & gas and large corporates in Nigeria." },
      { property: "og:title", content: "Canta — Cross-Border Payments & FX for Enterprises" },
      { name: "twitter:title", content: "Canta — Cross-Border Payments & FX for Enterprises" },
      { property: "og:description", content: "Enterprise-grade cross-border payments and FX platform for oil & gas and large corporates in Nigeria." },
      { name: "twitter:description", content: "Enterprise-grade cross-border payments and FX platform for oil & gas and large corporates in Nigeria." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7bbbef14-bf56-4f1e-8f06-6e3114e00897/id-preview-4e80521b--12388e53-a5ea-4592-8d74-6743c605f92f.lovable.app-1778508840567.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7bbbef14-bf56-4f1e-8f06-6e3114e00897/id-preview-4e80521b--12388e53-a5ea-4592-8d74-6743c605f92f.lovable.app-1778508840567.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLanding = pathname === "/";
  return (
    <QueryClientProvider client={queryClient}>
      {isLanding ? (
        <Outlet />
      ) : (
        <RoleProvider>
          <ActionsProvider>
            <AppShell>
              <Outlet />
            </AppShell>
          </ActionsProvider>
        </RoleProvider>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}
