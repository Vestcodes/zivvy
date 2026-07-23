"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  rowHrefs: string[];
  newHref: string;
  children: ReactNode;
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

export function AutoListKeyboard({ rowHrefs, newHref, children }: Props) {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollRowIntoView = useCallback((idx: number) => {
    if (!containerRef.current) return;
    const rows = containerRef.current.querySelectorAll("tbody tr");
    rows[idx]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isInputFocused()) return;

      switch (e.key) {
        case "j": {
          e.preventDefault();
          setSelectedIdx((prev) => {
            const next = Math.min(prev + 1, rowHrefs.length - 1);
            scrollRowIntoView(next);
            return next;
          });
          break;
        }
        case "k": {
          e.preventDefault();
          setSelectedIdx((prev) => {
            const next = Math.max(prev - 1, 0);
            scrollRowIntoView(next);
            return next;
          });
          break;
        }
        case "Enter": {
          if (selectedIdx >= 0 && selectedIdx < rowHrefs.length) {
            e.preventDefault();
            router.push(rowHrefs[selectedIdx]);
          }
          break;
        }
        case "n": {
          e.preventDefault();
          router.push(newHref);
          break;
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rowHrefs, newHref, selectedIdx, router, scrollRowIntoView]);

  // Apply highlight styling to the selected row via data attribute
  useEffect(() => {
    if (!containerRef.current) return;
    const rows = containerRef.current.querySelectorAll("tbody tr");
    rows.forEach((row, i) => {
      if (i === selectedIdx) {
        row.setAttribute("data-kb-selected", "true");
      } else {
        row.removeAttribute("data-kb-selected");
      }
    });
  }, [selectedIdx]);

  return (
    <div ref={containerRef} className="[&_tr[data-kb-selected=true]]:bg-primary/5 [&_tr[data-kb-selected=true]]:ring-1 [&_tr[data-kb-selected=true]]:ring-primary/20">
      {children}
    </div>
  );
}
