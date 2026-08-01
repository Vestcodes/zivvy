"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Topbar theme toggle. Cycles through system → light → dark via a shadcn
 * DropdownMenu so keyboard users can jump straight to the target without
 * clicking twice. Renders a placeholder on the first client render to avoid
 * hydration-mismatch flashes.
 */
export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeIsDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={
            !mounted
              ? "Theme"
              : theme === "system"
                ? "Theme (system)"
                : theme === "dark"
                  ? "Theme (dark)"
                  : "Theme (light)"
          }
          className="text-muted-foreground hover:text-foreground"
        >
          <Sun
            className={cn(
              "size-4 rotate-0 scale-100 transition-all",
              activeIsDark && "-rotate-90 scale-0"
            )}
          />
          <Moon
            className={cn(
              "absolute size-4 rotate-90 scale-0 transition-all",
              activeIsDark && "rotate-0 scale-100"
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          <Sun className="size-4" />
          Light
          {theme === "light" && <span className="ms-auto text-xs text-muted-foreground">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          <Moon className="size-4" />
          Dark
          {theme === "dark" && <span className="ms-auto text-xs text-muted-foreground">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}>
          <Monitor className="size-4" />
          System
          {theme === "system" && <span className="ms-auto text-xs text-muted-foreground">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
