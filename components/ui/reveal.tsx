"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  /** ms to delay the entrance — used to stagger siblings. */
  delay?: number;
  /** Once true, stays revealed; if false, hides again when scrolled out. */
  once?: boolean;
  className?: string;
  /** Fraction of the element in-viewport before revealing. */
  threshold?: number;
  as?: React.ElementType;
}

/**
 * Fade-and-lift on scroll into view. Uses IntersectionObserver.
 * Respects `prefers-reduced-motion` via the global CSS override in globals.css
 * (which neutralizes transition-duration).
 */
export function Reveal({
  children,
  delay = 0,
  once = true,
  className,
  threshold = 0.12,
  as: Comp = "div"
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) io.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);

  return (
    <Comp
      ref={ref as React.RefObject<HTMLDivElement>}
      data-visible={visible ? "true" : "false"}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-[var(--duration-slow)] ease-[cubic-bezier(0.25,1,0.5,1)]",
        "data-[visible=false]:opacity-0 data-[visible=false]:translate-y-2",
        "data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0",
        className
      )}
    >
      {children}
    </Comp>
  );
}
