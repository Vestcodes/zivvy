"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  placeholder?: string;
}

/**
 * Debounced search input that syncs to `?q=...` on the URL. The RSC AutoList
 * reads the query param and refetches — Next.js handles the streaming.
 */
export function AutoListSearch({ placeholder = "Search…" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const initialRef = useRef(initial);

  // Debounce URL updates
  useEffect(() => {
    if (value === initialRef.current) return;
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set("q", value);
      else params.delete("q");
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
      initialRef.current = value;
    }, 250);
    return () => clearTimeout(id);
  }, [value, router, searchParams]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-56 pl-8 pr-8"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
