"use client";

import React, { useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001
};

export const MenuItem = ({
  setActive,
  active,
  item,
  href,
  children
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  /** When set, the trigger is a real link (keyboard + crawlable). */
  href?: string;
  children?: React.ReactNode;
}) => {
  const triggerClass =
    "cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground";
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      {href ? (
        <Link href={href} className={triggerClass} onFocus={() => setActive(item)}>
          <motion.span transition={{ duration: 0.3 }}>{item}</motion.span>
        </Link>
      ) : (
        <motion.p transition={{ duration: 0.3 }} className={triggerClass}>
          {item}
        </motion.p>
      )}
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute left-1/2 top-[calc(100%_+_1.1rem)] z-50 -translate-x-1/2 pt-3">
              <motion.div
                transition={transition}
                layoutId="active"
                className="max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-border/70 bg-popover/95 shadow-elevation-lg backdrop-blur-md"
              >
                <motion.div layout className="w-max p-4">
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
  className
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const dismiss = useCallback(() => setActive(null), [setActive]);

  useEffect(() => {
    window.addEventListener("scroll", dismiss, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", dismiss);
      window.removeEventListener("keydown", onKey);
    };
  }, [dismiss]);

  return (
    <nav
      onMouseLeave={dismiss}
      className={cn(
        "relative flex items-center justify-center gap-6 bg-transparent px-1 py-2",
        className
      )}
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex space-x-3 rounded-lg p-1 transition-colors hover:bg-accent/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="h-[70px] w-[140px] shrink-0 rounded-md border border-border/60 object-cover shadow-sm"
      />
      <div>
        <h4 className="mb-1 font-display text-base font-semibold text-foreground">{title}</h4>
        <p className="max-w-[12rem] text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({
  children,
  href,
  className,
  ...rest
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) => {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      {...rest}
    >
      {children}
    </Link>
  );
};
