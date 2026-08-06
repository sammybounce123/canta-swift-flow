import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Factory, ArrowRight } from "lucide-react";
import { langStore, useSupplierLang, useT } from "@/lib/supplier-lang";

export const Route = createFileRoute("/supplier-portal")({
  head: () => ({
    meta: [
      { title: "Supplier Portal — Canta" },
      { name: "description", content: "Create RMB invoices, receive NGN payments from Nigerian buyers and get settled in RMB." },
    ],
  }),
  component: SupplierPortalLayout,
});

const TABS: Array<{ to: string; key: string; exact?: boolean }> = [
  { to: "/supplier-portal", key: "dashboard", exact: true },
  { to: "/supplier-portal/create-invoice", key: "createInvoice" },
  { to: "/supplier-portal/ngn-balance", key: "ngnBalance" },
  { to: "/supplier-portal/rmb-bank-account", key: "rmbBankAccount" },
  { to: "/supplier-portal/invoices", key: "invoiceHistory" },
  { to: "/supplier-portal/settlements", key: "settlements" },
  { to: "/supplier-portal/verification", key: "verification" },
  { to: "/supplier-portal/support", key: "support" },
  { to: "/supplier-portal/settings", key: "settings" },
];

function SupplierPortalLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang = useSupplierLang();
  const t = useT();

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Badge variant="outline" className="gap-1"><Factory className="h-3 w-3" /> Supplier Portal · 供应商门户</Badge>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t("welcome")}</h1>
          <p className="text-sm text-muted-foreground">{t("company")}</p>
          <Badge variant="outline" className="mt-2 text-[10px]">{t("demoAccount")}</Badge>
        </div>

        <div className="inline-flex h-9 shrink-0 items-center rounded-lg border bg-card p-0.5" role="group" aria-label="Language">
          <Button
            size="sm"
            variant={lang === "en" ? "default" : "ghost"}
            className="h-8 px-3 text-xs"
            onClick={() => langStore.set("en")}
          >
            English
          </Button>
          <Button
            size="sm"
            variant={lang === "zh" ? "default" : "ghost"}
            className="h-8 px-3 text-xs"
            onClick={() => langStore.set("zh")}
          >
            中文
          </Button>
        </div>
      </header>

      <nav aria-label="Supplier Portal sections" className="flex w-full min-w-0 flex-wrap gap-2">
        {TABS.map((item) => {
          const active = item.exact
            ? pathname === "/supplier-portal" || pathname === "/supplier-portal/"
            : pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`inline-flex min-h-10 items-center rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <section className="space-y-4">
        <Outlet />
      </section>

      <Card className="p-4 text-xs text-muted-foreground">
        Receive-only account. You can only receive buyer payments and settle to your own verified RMB/USD bank account.
        <Link to="/welcome" className="ml-2 inline-flex items-center gap-1 hover:underline">
          Switch workspace <ArrowRight className="h-3 w-3" />
        </Link>
      </Card>
    </div>
  );
}
