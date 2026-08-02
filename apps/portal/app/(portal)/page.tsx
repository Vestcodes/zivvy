"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Loader2,
  Receipt,
  User,
} from "lucide-react";
import Link from "next/link";
import { frappeCall } from "@/lib/frappe";

type Profile = {
  name: string;
  employee_name: string;
  company: string;
  department: string | null;
  designation: string | null;
  date_of_joining: string | null;
  company_email: string | null;
  personal_email: string | null;
  cell_phone: string | null;
  image: string | null;
  status: string;
};

const QUICK_LINKS = [
  { href: "/leave", label: "Apply for leave", icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
  { href: "/attendance", label: "View attendance", icon: ClipboardCheck, color: "text-emerald-600 bg-emerald-50" },
  { href: "/payslips", label: "View payslips", icon: CreditCard, color: "text-violet-600 bg-violet-50" },
  { href: "/expenses", label: "Submit expense", icon: Receipt, color: "text-amber-600 bg-amber-50" },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    frappeCall<Profile>("zivvy_brand.api.portal.get_my_profile")
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          {profile.image ? (
            <img
              src={profile.image}
              alt=""
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-primary" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {profile.employee_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[profile.designation, profile.department].filter(Boolean).join(" · ") || profile.company}
          </p>
        </div>
      </div>

      {/* Profile details */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Profile</h2>
        </div>
        <dl className="divide-y divide-border text-sm">
          {[
            ["Employee ID", profile.name],
            ["Company", profile.company],
            ["Department", profile.department],
            ["Designation", profile.designation],
            ["Date of Joining", profile.date_of_joining],
            ["Email", profile.company_email || profile.personal_email],
            ["Phone", profile.cell_phone],
          ]
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label} className="flex justify-between px-4 py-2.5">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
        </dl>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition hover:border-primary/30 hover:bg-accent/40"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
