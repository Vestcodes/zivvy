"use client";

import { useEffect, useState } from "react";
import { ChevronRight, CreditCard, Loader2 } from "lucide-react";
import { frappeCall } from "@/lib/frappe";

type SalarySlip = {
  name: string;
  posting_date: string;
  start_date: string;
  end_date: string;
  gross_pay: number;
  total_deduction: number;
  net_pay: number;
  currency: string;
};

type SlipDetail = {
  name: string;
  employee_name: string;
  posting_date: string;
  start_date: string;
  end_date: string;
  gross_pay: number;
  total_deduction: number;
  net_pay: number;
  currency: string;
  earnings: { component: string; amount: number }[];
  deductions: { component: string; amount: number }[];
  total_working_days: number;
  payment_days: number;
};

type PayslipData = {
  year: string;
  slips: SalarySlip[];
};

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function PayslipsPage() {
  const [data, setData] = useState<PayslipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SlipDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    frappeCall<PayslipData>("zivvy_brand.api.portal.get_my_payslips")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function openDetail(name: string) {
    setLoadingDetail(true);
    try {
      const d = await frappeCall<SlipDetail>(
        "zivvy_brand.api.portal.get_payslip_detail",
        { slip_name: name }
      );
      setDetail(d);
    } catch {
      // ignore
    } finally {
      setLoadingDetail(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (detail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDetail(null)}
            className="flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-sm transition hover:bg-accent"
          >
            Back
          </button>
          <h1 className="text-xl font-semibold tracking-tight">
            Payslip — {new Date(detail.posting_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h1>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {detail.start_date} to {detail.end_date} · {detail.payment_days}/{detail.total_working_days} days
            </p>
          </div>

          {/* Earnings */}
          <div className="border-b border-border px-4 py-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Earnings
            </p>
            {detail.earnings.map((e) => (
              <div key={e.component} className="flex justify-between py-1 text-sm">
                <span>{e.component}</span>
                <span className="tabular-nums font-medium">{fmt(e.amount, detail.currency)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-medium">
              <span>Gross Pay</span>
              <span className="tabular-nums">{fmt(detail.gross_pay, detail.currency)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="border-b border-border px-4 py-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Deductions
            </p>
            {detail.deductions.map((d) => (
              <div key={d.component} className="flex justify-between py-1 text-sm">
                <span>{d.component}</span>
                <span className="tabular-nums font-medium">{fmt(d.amount, detail.currency)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-medium">
              <span>Total Deductions</span>
              <span className="tabular-nums">{fmt(detail.total_deduction, detail.currency)}</span>
            </div>
          </div>

          {/* Net Pay */}
          <div className="flex justify-between px-4 py-4">
            <span className="text-base font-semibold">Net Pay</span>
            <span className="text-base font-semibold tabular-nums text-primary">
              {fmt(detail.net_pay, detail.currency)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Payslips</h1>
        <p className="text-sm text-muted-foreground">
          Your salary slips for {data?.year}
        </p>
      </div>

      {data && data.slips.length > 0 ? (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {data.slips.map((slip) => (
            <button
              key={slip.name}
              onClick={() => openDetail(slip.name)}
              disabled={loadingDetail}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-accent/40"
            >
              <div>
                <p className="text-sm font-medium">
                  {new Date(slip.posting_date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {slip.start_date} to {slip.end_date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums">
                  {fmt(slip.net_pay, slip.currency)}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <CreditCard className="h-10 w-10 opacity-30" />
          <p className="text-sm">No payslips available yet</p>
        </div>
      )}
    </div>
  );
}
