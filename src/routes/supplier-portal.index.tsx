import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Landmark, Banknote, Wallet, ShieldCheck } from "lucide-react";
import { AutoConvertCard } from "@/components/supplier/AutoConvertCard";
import { useSimpleInvoices, ngnSummary, useRmbBanks } from "@/lib/supplier-simple";
import { useVerified } from "@/lib/supplier-data";
import { useT, useSupplierLang } from "@/lib/supplier-lang";

export const Route = createFileRoute("/supplier-portal/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Supplier Portal — Canta" },
      {
        name: "description",
        content:
          "Your NGN balance, RMB settlement pending and payouts to your verified RMB bank account.",
      },
    ],
  }),
  component: SupplierDashboard,
});

function SupplierDashboard() {
  const t = useT();
  const lang = useSupplierLang();
  const invoices = useSimpleInvoices();
  const banks = useRmbBanks();
  const verified = useVerified();
  const s = ngnSummary(invoices);

  const verificationLabel = verified
    ? "Verified"
    : banks.some((b) => b.status === "Pending Review" || b.status === "Submitted")
      ? "Under Review"
      : "Incomplete";

  const steps = [
    { n: 1, en: t("step1"), zh: "创建人民币发票" },
    { n: 2, en: t("step2"), zh: "买家支付尼日利亚奈拉" },
    { n: 3, en: t("step3"), zh: "Canta 自动兑换" },
    { n: 4, en: t("step4"), zh: "人民币打入您的银行账户" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Banknote}
          label={t("ngnBalance")}
          value={`₦${s.available.toLocaleString()}`}
          help={t("ngnBalanceHelp")}
        />
        <Metric
          icon={Wallet}
          label={t("rmbPending")}
          value={`¥${s.rmbPending.toLocaleString()}`}
          help={t("rmbPendingHelp")}
        />
        <Metric
          icon={Landmark}
          label={t("paidToBank")}
          value={`¥${s.rmbPaid.toLocaleString()}`}
          help={t("paidToBankHelp")}
        />
        <Metric
          icon={ShieldCheck}
          label={t("verificationStatus")}
          value={verificationLabel}
          help={t("verificationHelp")}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/supplier-portal/create-invoice">
            <FileText className="mr-2 h-4 w-4" /> {t("createInvoice")}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/supplier-portal/ngn-balance">{t("viewNgnDetails")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/supplier-portal/rmb-bank-account">{t("addRmbBank")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/supplier-portal/settlements">{t("viewSettlements")}</Link>
        </Button>
      </div>

      <AutoConvertCard />

      <Card className="p-4">
        <div className="text-sm font-semibold">{t("howItWorks")}</div>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((st) => (
            <li key={st.n} className="rounded-lg border p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Step {st.n}
              </div>
              <div className="mt-1 text-sm font-medium">{st.en}</div>
              {lang === "en" && <div className="mt-1 text-xs text-muted-foreground">{st.zh}</div>}
            </li>
          ))}
        </ol>
      </Card>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Recent invoices</div>
          <Link to="/supplier-portal/invoices" className="text-xs text-primary hover:underline">
            {t("invoiceHistory")}
          </Link>
        </div>
        <ul className="space-y-2 text-sm">
          {invoices.slice(0, 4).map((i) => (
            <li
              key={i.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2"
            >
              <div>
                <div className="font-mono text-xs">{i.invoiceNumber}</div>
                <div className="text-xs text-muted-foreground">
                  {i.buyerCompany} · ¥{i.amountRmb.toLocaleString()}
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {i.status}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  help,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  help: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{help}</p>
    </Card>
  );
}
