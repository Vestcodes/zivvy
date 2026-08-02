"use client";

import { useEffect, useState } from "react";
import { Loader2, Receipt } from "lucide-react";
import { frappeCall } from "@/lib/frappe";

type ExpenseClaim = {
  name: string;
  posting_date: string;
  total_claimed_amount: number;
  total_sanctioned_amount: number;
  status: string;
  approval_status: string;
};

type ExpenseData = {
  year: string;
  claims: ExpenseClaim[];
};

const STATUS_COLORS: Record<string, string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Unpaid: "bg-blue-50 text-blue-700",
  Paid: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Draft: "bg-gray-100 text-gray-600",
  Cancelled: "bg-gray-100 text-gray-600",
};

export default function ExpensesPage() {
  const [data, setData] = useState<ExpenseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    frappeCall<ExpenseData>("zivvy_brand.api.portal.get_my_expenses")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Expenses</h1>
        <p className="text-sm text-muted-foreground">
          Your expense claims for {data?.year}
        </p>
      </div>

      {data && data.claims.length > 0 ? (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {data.claims.map((claim) => (
            <div key={claim.name} className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-sm font-medium">{claim.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(claim.posting_date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tabular-nums">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "EUR",
                    minimumFractionDigits: 2,
                  }).format(claim.total_claimed_amount)}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[claim.approval_status] ?? STATUS_COLORS[claim.status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {claim.approval_status || claim.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <Receipt className="h-10 w-10 opacity-30" />
          <p className="text-sm">No expense claims yet</p>
        </div>
      )}
    </div>
  );
}
