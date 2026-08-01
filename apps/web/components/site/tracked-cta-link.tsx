"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackCtaClicked } from "@/lib/analytics";

interface TrackedCtaLinkProps {
  href: string;
  location: string;
  label: string;
  className?: string;
  children: ReactNode;
}

export function TrackedCtaLink({
  href,
  location,
  label,
  className,
  children
}: TrackedCtaLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackCtaClicked({ location, label })}
    >
      {children}
    </Link>
  );
}
