import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="font-display text-xl tracking-tight">Zivvy</span>
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Zivvy"
      className={cn("block", className)}
    >
      <circle cx="50" cy="50" r="46" fill="#070707" />
      <g stroke="#fffaf5" strokeWidth="6" strokeLinecap="round" fill="none">
        <line x1="25" y1="34" x2="75" y2="34" />
        <line x1="30" y1="46" x2="70" y2="46" />
        <line x1="35" y1="58" x2="65" y2="58" />
        <line x1="41" y1="70" x2="59" y2="70" />
        <line x1="46" y1="80" x2="54" y2="80" />
      </g>
    </svg>
  );
}
