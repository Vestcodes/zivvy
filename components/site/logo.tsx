import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-primary-gradient grid h-8 w-8 place-items-center rounded-md text-lg font-semibold text-primary-foreground shadow-elevation-sm">
        Z
      </div>
      <span className="font-display text-xl tracking-tight">Zivvy</span>
    </div>
  );
}
