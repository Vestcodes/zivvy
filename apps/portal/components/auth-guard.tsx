"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { frappeLoggedUser } from "@/lib/frappe";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    frappeLoggedUser()
      .then((user) => {
        if (!user || user === "Guest") {
          router.replace("/login");
        } else {
          setChecked(true);
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router, pathname]);

  if (!checked) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
