"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { frappeCall, FrappeError } from "@/lib/frappe";

type LeaveBalance = {
  leave_type: string;
  allocated: number;
  used: number;
  remaining: number;
};

type LeaveApplication = {
  name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_leave_days: number;
  status: string;
  posting_date: string;
};

type LeaveData = {
  year: string;
  balances: LeaveBalance[];
  applications: LeaveApplication[];
};

const STATUS_COLORS: Record<string, string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Open: "bg-blue-50 text-blue-700",
  Rejected: "bg-red-50 text-red-700",
  Cancelled: "bg-gray-100 text-gray-600",
};

export default function LeavePage() {
  const [data, setData] = useState<LeaveData | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formType, setFormType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      frappeCall<LeaveData>("zivvy_brand.api.portal.get_my_leaves"),
      frappeCall<string[]>("zivvy_brand.api.portal.get_leave_types"),
    ])
      .then(([d, types]) => {
        setData(d);
        setLeaveTypes(types);
        if (types.length > 0 && !formType) setFormType(types[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await frappeCall("zivvy_brand.api.portal.submit_leave_application", {
        leave_type: formType,
        from_date: fromDate,
        to_date: toDate,
        reason: reason || undefined,
      });
      toast.success("Leave application submitted");
      setShowForm(false);
      setFromDate("");
      setToDate("");
      setReason("");
      load();
    } catch (err) {
      toast.error(err instanceof FrappeError ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Leave</h1>
          <p className="text-sm text-muted-foreground">
            View your balance and apply for leave
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Apply"}
        </button>
      </div>

      {/* Apply form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-primary/20 bg-card p-4 space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Leave type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              >
                {leaveTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">From</label>
              <input
                type="date"
                required
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">To</label>
              <input
                type="date"
                required
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              Reason <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit application"}
          </button>
        </form>
      )}

      {/* Balances */}
      {data && data.balances.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Balance ({data.year})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.balances.map((b) => (
              <div
                key={b.leave_type}
                className="rounded-xl border border-border bg-card px-4 py-3"
              >
                <p className="text-xs text-muted-foreground">{b.leave_type}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                  {b.remaining}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}/ {b.allocated}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {b.used} used
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent applications */}
      {data && data.applications.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Recent applications
          </h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {data.applications.map((app) => (
              <div key={app.name} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{app.leave_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {app.from_date} to {app.to_date} · {app.total_leave_days}d
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data && data.balances.length === 0 && data.applications.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <CalendarDays className="h-10 w-10 opacity-30" />
          <p className="text-sm">No leave data available yet</p>
        </div>
      )}
    </div>
  );
}
