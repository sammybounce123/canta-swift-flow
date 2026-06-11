import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Download, CheckCircle2, Circle, FileText, Upload, MessageSquare,
  Mail, Phone, MapPin, Building2,
} from "lucide-react";
import { getCase, getSolicitor, formatGBP, formatNGN, statusTone, CASE_STATUSES, getMarketer, canSeeSolicitorBankDetails } from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";

export const Route = createFileRoute("/partner/cases/$caseId")({
  head: () => ({ meta: [{ title: "Client Case — Baron & Cabot" }] }),
  component: CaseDetail,
});

const TABS = ["Overview", "Payment Timeline", "FX Details", "Solicitor Payout", "Documents", "Notes", "Activity Log"] as const;
type Tab = (typeof TABS)[number];

function CaseDetail() {
  const { caseId } = useParams({ from: "/partner/cases/$caseId" });
  const { role } = usePartnerRole();
  const c = getCase(caseId);
  const [tab, setTab] = useState<Tab>("Overview");

  if (!c) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Case not found.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/partner/cases">Back to cases</Link></Button>
      </div>
    );
  }
  const sol = getSolicitor(c.solicitorId)!;
  const statusIdx = CASE_STATUSES.indexOf(c.status);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm"><Link to="/partner/cases"><ArrowLeft className="h-4 w-4 mr-1" /> Cases</Link></Button>
        <div className="text-xs text-muted-foreground">/ {c.ref}</div>
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>{c.status}</Badge>
              <span className="text-xs text-muted-foreground">{c.ref}</span>
            </div>
            <h1 className="text-2xl font-semibold">{c.clientName}</h1>
            <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {c.property}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {c.propertyLocation}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Required payment</div>
            <div className="text-3xl font-semibold tabular-nums">{formatGBP(c.amountGBP)}</div>
            {c.amountNGN && <div className="text-xs text-muted-foreground tabular-nums mt-0.5">≈ {formatNGN(c.amountNGN)}</div>}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="p-5 shadow-card lg:col-span-2">
            <div className="text-sm font-semibold mb-3">Client &amp; property</div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Row label="Client name" value={c.clientName} />
              <Row label="Email" value={c.clientEmail} icon={Mail} />
              <Row label="Phone" value={c.clientPhone} icon={Phone} />
              <Row label="Property / project" value={c.property} />
              <Row label="Location" value={c.propertyLocation} />
              <Row label="Currency" value={c.currency} />
              <Row label="Required amount" value={formatGBP(c.amountGBP)} />
              <Row label="Solicitor" value={sol.firm} />
              <Row label="Status" value={c.status} />
              <Row label="Payment deadline" value={c.expectedPayout} />
              <Row label="Date created" value={c.createdAt} />
              <Row label="Assigned officer" value={c.officer} />
              <Row label="Referral marketer" value={getMarketer(c.assignedMarketerId)?.name ?? "—"} />
              {c.paymentReference && <Row label="Payment reference" value={c.paymentReference} />}
            </dl>
          </Card>
          <Card className="p-5 shadow-card">
            <div className="text-sm font-semibold mb-3">Quick actions</div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start"><Upload className="h-4 w-4 mr-2" /> Upload payment receipt</Button>
              <Button variant="outline" className="w-full justify-start"><Download className="h-4 w-4 mr-2" /> Download case summary</Button>
              <Button variant="outline" className="w-full justify-start"><MessageSquare className="h-4 w-4 mr-2" /> Message Canta officer</Button>
              <Button variant="outline" className="w-full justify-start"><Mail className="h-4 w-4 mr-2" /> Email client update</Button>
            </div>
          </Card>
        </div>
      )}

      {tab === "Payment Timeline" && (
        <Card className="p-6 shadow-card">
          <div className="text-sm font-semibold mb-4">Payment timeline</div>
          <ol className="relative border-l border-border ml-3 space-y-4">
            {[
              "Referred", "KYC Pending", "Awaiting Client Funding", "Funding Received",
              "FX Quote Sent", "FX Accepted", "FX Converted", "Payout Processing",
              "Paid to Solicitor", "Receipt Uploaded",
            ].map((step, i) => {
              const done = i <= statusIdx;
              const active = i === statusIdx;
              return (
                <li key={step} className="ml-5">
                  <span className={`absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full border-2 ${
                    done ? "bg-success border-success" : active ? "bg-primary border-primary" : "bg-background border-border"
                  }`} />
                  <div className="text-sm font-medium flex items-center gap-2">
                    {done ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground" />}
                    {step}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{done ? `Completed · ${c.createdAt}` : "Pending"}</div>
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      {tab === "FX Details" && (
        <Card className="p-6 shadow-card">
          <div className="text-sm font-semibold mb-4">FX conversion details</div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <Row label="NGN amount received" value={c.amountNGN ? formatNGN(c.amountNGN) : "—"} />
            <Row label="Exchange rate" value="1 GBP = ₦ 2,054.10" />
            <Row label="Converted GBP" value={formatGBP(c.amountGBP)} />
            <Row label="Canta fees" value={formatGBP(Math.round(c.amountGBP * 0.0075))} />
            <Row label="Quote expiry" value="2026-06-15 17:00 UTC" />
            <Row label="Conversion date" value="2026-06-10 09:42 UTC" />
            <Row label="Transaction reference" value={`CFX-${c.id.replace("CS-", "")}-LON`} />
          </dl>
        </Card>
      )}

      {tab === "Solicitor Payout" && (
        <Card className="p-6 shadow-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">Solicitor payout</div>
              <div className="text-xs text-muted-foreground">{sol.firm}</div>
            </div>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" /> Receipt</Button>
          </div>
          {canSeeSolicitorBankDetails(role) ? (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <Row label="Firm name" value={sol.firm} />
              <Row label="Account name" value={sol.accountName} />
              <Row label="Bank" value={sol.bank} />
              <Row label="Account number" value={sol.accountNumberMasked} />
              <Row label="Sort code" value={sol.sortCode ?? "—"} />
              <Row label="IBAN" value={sol.iban ?? "—"} />
              <Row label="SWIFT / BIC" value={sol.swift} />
              <Row label="Payout amount" value={formatGBP(c.amountGBP)} />
              <Row label="Payout date" value={c.expectedPayout} />
              <Row label="Payout status" value={c.status} />
              <Row label="Payment reference" value={c.paymentReference ?? `BC/${c.id}/COMPL`} />
            </dl>
          ) : (
            <div className="space-y-3">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <Row label="Firm name" value={sol.firm} />
                <Row label="Payout amount" value={formatGBP(c.amountGBP)} />
                <Row label="Payout date" value={c.expectedPayout} />
                <Row label="Payout status" value={c.status} />
                <Row label="Payment reference" value={c.paymentReference ?? `BC/${c.id}/COMPL`} />
              </dl>
              <div className="text-xs text-muted-foreground italic border-t pt-3">
                Solicitor bank details are restricted. Ask a Partner Admin or Finance Viewer for access.
              </div>
            </div>
          )}
        </Card>
      )}

      {tab === "Documents" && (
        <Card className="p-6 shadow-card">
          <div className="text-sm font-semibold mb-4">Documents</div>
          <div className="space-y-2">
            {[
              "Property payment instruction",
              "Solicitor payment instruction",
              "Client KYC documents",
              "Proof of funds",
              "Payment receipt",
              "Canta transaction receipt",
            ].map((d) => (
              <div key={d} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3 text-sm"><FileText className="h-4 w-4 text-muted-foreground" /> {d}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline"><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "Notes" && (
        <Card className="p-6 shadow-card">
          <div className="text-sm font-semibold mb-3">Notes</div>
          <textarea
            rows={6}
            placeholder="Add internal notes visible only to your Baron & Cabot team…"
            className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex justify-end mt-3"><Button size="sm">Save note</Button></div>
        </Card>
      )}

      {tab === "Activity Log" && (
        <Card className="p-6 shadow-card">
          <div className="text-sm font-semibold mb-3">Activity log</div>
          <ul className="text-sm divide-y">
            {[
              { t: "Receipt uploaded", who: "Canta · Adaeze O.", when: "2026-06-04 14:22" },
              { t: "Payout sent to solicitor", who: "Canta system", when: "2026-06-04 11:08" },
              { t: "FX accepted", who: c.clientName, when: "2026-06-03 18:42" },
              { t: "FX quote sent", who: "Canta · Tunde B.", when: "2026-06-03 16:10" },
              { t: "Funding received", who: "Canta system", when: "2026-06-02 09:35" },
              { t: "Client referred", who: "Baron & Cabot", when: c.createdAt },
            ].map((a) => (
              <li key={a.t} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.t}</div>
                  <div className="text-[11px] text-muted-foreground">{a.who}</div>
                </div>
                <div className="text-xs text-muted-foreground tabular-nums">{a.when}</div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium flex items-center gap-1.5 mt-0.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />} {value}
      </dd>
    </div>
  );
}
