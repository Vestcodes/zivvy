"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ClipboardCheck, Loader2 } from "lucide-react";
import { frappeCall } from "@/lib/frappe";

type AttendanceRecord = {
  name: string;
  attendance_date: string;
  status: string;
  working_hours: number | null;
  late_entry: number;
  early_exit: number;
};

type AttendanceData = {
  year: string;
  month: string;
  records: AttendanceRecord[];
  summary: Record<string, number>;
};

const STATUS_DOT: Record<string, string> = {
  Present: "bg-emerald-500",
  Absent: "bg-red-500",
  "Half Day": "bg-amber-500",
  "On Leave": "bg-blue-500",
  "Work From Home": "bg-violet-500",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AttendancePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const m = String(month).padStart(2, "0");
    frappeCall<AttendanceData>("zivvy_brand.api.portal.get_my_attendance", {
      year: String(year),
      month: m,
    })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month]);

  function prev() {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function next() {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Your monthly attendance records
        </p>
      </div>

      {/* Month picker */}
      <div className="flex items-center gap-3">
        <button onClick={prev} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition hover:bg-accent">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[140px] text-center text-sm font-medium">
          {MONTHS[month - 1]} {year}
        </span>
        <button onClick={next} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition hover:bg-accent">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          {/* Summary */}
          {Object.values(data.summary).some((v) => v > 0) && (
            <div className="flex flex-wrap gap-4">
              {Object.entries(data.summary)
                .filter(([, v]) => v > 0)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2 text-sm">
                    <div className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[status] ?? "bg-gray-400"}`} />
                    <span className="text-muted-foreground">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          )}

          {/* Records */}
          {data.records.length > 0 ? (
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {data.records.map((r) => (
                <div key={r.name} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[r.status] ?? "bg-gray-400"}`} />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(r.attendance_date + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.status}</p>
                    </div>
                  </div>
                  {r.working_hours != null && r.working_hours > 0 && (
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {r.working_hours.toFixed(1)}h
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <ClipboardCheck className="h-10 w-10 opacity-30" />
              <p className="text-sm">No attendance records for this month</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
