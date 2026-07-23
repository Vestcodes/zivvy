"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { GO_TO_MAP, groupShortcuts } from "@/lib/keyboard";
import { cn } from "@/lib/utils";

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const pendingG = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearG = useCallback(() => {
    pendingG.current = false;
    if (gTimer.current) {
      clearTimeout(gTimer.current);
      gTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isInputFocused()) return;

      const key = e.key;

      // "g" sequence — wait for second key
      if (pendingG.current) {
        clearG();
        const dest = GO_TO_MAP[key];
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        return;
      }

      if (key === "g") {
        pendingG.current = true;
        gTimer.current = setTimeout(clearG, 800);
        return;
      }

      // "/" to open command bar
      if (key === "/") {
        e.preventDefault();
        // Dispatch the same Cmd+K event the awesomebar listens for
        window.dispatchEvent(new KeyboardEvent("keydown", {
          key: "k",
          code: "KeyK",
          metaKey: true,
          bubbles: true
        }));
        return;
      }

      // "?" to show help
      if (key === "?") {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearG();
    };
  }, [router, clearG]);

  const groups = groupShortcuts();

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {Object.entries(groups).map(([section, shortcuts]) => (
            <div key={section}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {section}
              </h3>
              <div className="space-y-1">
                {shortcuts.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
                  >
                    <span>{s.label}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i}>
                          {i > 0 && (
                            <span className="mx-0.5 text-xs text-muted-foreground">then</span>
                          )}
                          <kbd
                            className={cn(
                              "inline-flex min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                            )}
                          >
                            {k}
                          </kbd>
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Press <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">?</kbd> anytime to open this reference.
        </p>
      </DialogContent>
    </Dialog>
  );
}
