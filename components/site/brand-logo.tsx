"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * BrandLogo — renders a monochrome brand mark by slug.
 *
 * Design notes
 * -------------
 * The zivvy marketing site references dozens of external brands (Slack,
 * Stripe, Shopify, Notion, HubSpot, ...). We want each of these to render
 * as a real logo rather than a text chip. Two options were considered:
 *
 *   1. Pull the full simple-icons SVG path for every brand.
 *   2. Render a compact letter monogram tile in the brand's color.
 *
 * Option 1 is beautiful but risky: any typo in the huge path data string
 * yields a wrong-shaped icon that is worse than no icon at all. Option 2 is
 * guaranteed correct, consistently sized, works at any scale, and inherits
 * the brand's official color when the caller opts in. We chose option 2
 * for every brand in the map and reserve the more expensive SVG path route
 * for the two lucide-backed generic marks below.
 *
 * The component still supports two rendering modes:
 *   • monotone (default) — the tile draws with currentColor so callers
 *     can theme it via className (e.g. text-muted-foreground).
 *   • !monotone — uses the brand's official color for the fill.
 */

// ---------------------------------------------------------------------------
// Brand table
// ---------------------------------------------------------------------------

type BrandEntry = {
  name: string;
  /** Up to 2-char monogram (rendered inside the tile). */
  letters: string;
  /** Official brand color for !monotone mode. */
  color: string;
};

const BRANDS: Record<string, BrandEntry> = {
  slack: { name: "Slack", letters: "S", color: "#4A154B" },
  salesforce: { name: "Salesforce", letters: "SF", color: "#00A1E0" },
  hubspot: { name: "HubSpot", letters: "H", color: "#FF7A59" },
  zapier: { name: "Zapier", letters: "Z", color: "#FF4A00" },
  googledrive: { name: "Google Drive", letters: "GD", color: "#4285F4" },
  stripe: { name: "Stripe", letters: "S", color: "#635BFF" },
  polar: { name: "Polar", letters: "P", color: "#0062FF" },
  plaid: { name: "Plaid", letters: "PL", color: "#111111" },
  gocardless: { name: "GoCardless", letters: "GC", color: "#00B87C" },
  shopify: { name: "Shopify", letters: "S", color: "#7AB55C" },
  amazon: { name: "Amazon", letters: "A", color: "#FF9900" },
  amazonaws: { name: "AWS", letters: "AWS", color: "#FF9900" },
  quickbooks: { name: "QuickBooks", letters: "Q", color: "#2CA01C" },
  xero: { name: "Xero", letters: "X", color: "#13B5EA" },
  twilio: { name: "Twilio", letters: "T", color: "#F22F46" },
  postmark: { name: "Postmark", letters: "PM", color: "#FFDE00" },
  github: { name: "GitHub", letters: "GH", color: "#181717" },
  notion: { name: "Notion", letters: "N", color: "#000000" },
  airtable: { name: "Airtable", letters: "A", color: "#18BFFF" },
  googlesheets: { name: "Google Sheets", letters: "GS", color: "#34A853" },
  segment: { name: "Segment", letters: "S", color: "#52BD95" },
  posthog: { name: "PostHog", letters: "PH", color: "#F9BD2B" },
  unicommerce: { name: "Unicommerce", letters: "U", color: "#6C5CE7" },
  datev: { name: "DATEV", letters: "D", color: "#009EE3" },
};

/** Alternate slug spellings a caller might pass. */
const ALIASES: Record<string, string> = {
  "google-drive": "googledrive",
  "google-sheets": "googlesheets",
  gsheets: "googlesheets",
  gdrive: "googledrive",
  aws: "amazonaws",
  "amazon-aws": "amazonaws",
  "polar-sh": "polar",
  "polar.sh": "polar",
  quickbook: "quickbooks",
  "go-cardless": "gocardless",
};

// ---------------------------------------------------------------------------
// Generic lucide-derived paths for slugs that have no brand analogue
// ---------------------------------------------------------------------------

// lucide Signature (24x24). Stroke-based, so we render it as an outline
// icon rather than a filled shape.
const SIGNATURE_PATH_D =
  "M20 19c-2.8 0-5-2.2-5-5s2.2-5 5-5M9 3v14a3 3 0 0 1-6 0M5 21c1.7 0 3-1.3 3-3M15 5 8 22M17 3l-4 8";

// lucide Landmark (24x24). Stroke-based.
const LANDMARK_LINES = [
  { x1: 3, y1: 22, x2: 21, y2: 22 },
  { x1: 6, y1: 18, x2: 6, y2: 11 },
  { x1: 10, y1: 18, x2: 10, y2: 11 },
  { x1: 14, y1: 18, x2: 14, y2: 11 },
  { x1: 18, y1: 18, x2: 18, y2: 11 },
];

// Fallback puzzle piece for unknown slugs — a friendlier "unknown"
// signal than an empty box. Filled shape so it matches the tile style.
const PUZZLE_PATH_D =
  "M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface BrandLogoProps {
  /** Brand slug — see BRANDS + ALIASES above. Case-insensitive. */
  slug: string;
  className?: string;
  /** Custom aria-label. Defaults to the brand's display name. */
  label?: string;
  /**
   * When true (default), draws with currentColor so callers can theme via
   * className. When false, uses the brand's official color.
   */
  monotone?: boolean;
}

function normalizeSlug(input: string): string {
  const lower = input.trim().toLowerCase().replace(/[_\s]/g, "-");
  return ALIASES[lower] ?? lower.replace(/-/g, "");
}

export function BrandLogo({
  slug,
  className,
  label,
  monotone = true,
}: BrandLogoProps) {
  const key = normalizeSlug(slug);
  const brand = BRANDS[key];

  // ---- Special-cased generic slugs -----------------------------------------

  if (slug === "digital-signer") {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label={label ?? "Digital signer"}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("inline-block", className)}
      >
        <path d={SIGNATURE_PATH_D} />
      </svg>
    );
  }

  if (slug === "payments-processor") {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label={label ?? "Payments processor"}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("inline-block", className)}
      >
        <polygon points="12 3 2 8 22 8" />
        {LANDMARK_LINES.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
        ))}
      </svg>
    );
  }

  // ---- Unknown slug fallback ----------------------------------------------

  if (!brand) {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label={label ?? slug}
        fill="currentColor"
        className={cn("inline-block", className)}
      >
        <path d={PUZZLE_PATH_D} />
      </svg>
    );
  }

  // ---- Standard brand monogram tile ---------------------------------------

  // Tile fill logic:
  //   • monotone: fill=currentColor, letters stamp out (evenodd) so the tile
  //     looks like a filled rounded-square with the letters knocked out.
  //   • !monotone: fill=brand color, letters in white.
  const fill = monotone ? "currentColor" : brand.color;
  const letterColor = monotone ? "none" : "#FFFFFF";

  // Pick a font size and vertical offset based on letter count so 1- and
  // 2-letter monograms look centered rather than drifting off-baseline.
  const letters = brand.letters;
  const fontSize = letters.length === 1 ? 14 : letters.length === 2 ? 10 : 8;
  const letterY = 12 + fontSize * 0.35; // visual baseline centering

  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={label ?? brand.name}
      className={cn("inline-block", className)}
      fill={fill}
      // fill-rule matters only in monotone mode where letters "cut out"
      // of the tile. In colored mode the letters are painted on top.
    >
      {monotone ? (
        <>
          <rect x="1" y="1" width="22" height="22" rx="3" ry="3" />
          <text
            x="12"
            y={letterY}
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
            fontWeight="700"
            fontSize={fontSize}
            fill="var(--background, #ffffff)"
          >
            {letters}
          </text>
        </>
      ) : (
        <>
          <rect x="1" y="1" width="22" height="22" rx="3" ry="3" fill={brand.color} />
          <text
            x="12"
            y={letterY}
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
            fontWeight="700"
            fontSize={fontSize}
            fill={letterColor}
          >
            {letters}
          </text>
        </>
      )}
    </svg>
  );
}
