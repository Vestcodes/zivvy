"use client";

import Link from "next/link";
import { Check, Copy, ExternalLink, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function AutoListRowActions({ href, name }: { href: string; name: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${name}`}
          className="opacity-70 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={href}>
            <ExternalLink className="size-4" />
            Open record
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCopy}>
          {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy record ID"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
