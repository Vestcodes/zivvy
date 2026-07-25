"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * BrandLogo — renders a real brand mark via logo.dev when possible,
 * gracefully degrades to a colored monogram tile if the CDN misses
 * or the publishable token isn't configured.
 *
 * How it works
 * -------------
 * 1. Every brand in the map has a `domain` (the canonical URL used by
 *    logo.dev for lookup, e.g. slack.com, notion.so).
 * 2. When NEXT_PUBLIC_LOGO_DEV_TOKEN is set at build time, we render an
 *    <img> pointing at https://img.logo.dev/{domain}?token=… &format=png
 *    &size=200&retina=true. On onError we swap to the monogram fallback.
 * 3. Without the token we skip the fetch and render the monogram directly.
 *
 * The Zivvy center node in animated-beam diagrams uses <LogoMark /> from
 * components/site/logo.tsx directly — do not import BrandLogo for that.
 */

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN ?? "";

// ---------------------------------------------------------------------------
// Brand table
// ---------------------------------------------------------------------------

type BrandEntry = {
  name: string;
  /** Domain used by logo.dev for lookup. */
  domain: string;
  /** Up to 2-char monogram (rendered inside the tile fallback). */
  letters: string;
  /** Official brand color for !monotone mode. */
  color: string;
};

const BRANDS: Record<string, BrandEntry> = {
  slack: { name: "Slack", domain: "slack.com", letters: "S", color: "#4A154B" },
  salesforce: { name: "Salesforce", domain: "salesforce.com", letters: "SF", color: "#00A1E0" },
  hubspot: { name: "HubSpot", domain: "hubspot.com", letters: "H", color: "#FF7A59" },
  zapier: { name: "Zapier", domain: "zapier.com", letters: "Z", color: "#FF4A00" },
  googledrive: { name: "Google Drive", domain: "drive.google.com", letters: "GD", color: "#4285F4" },
  stripe: { name: "Stripe", domain: "stripe.com", letters: "S", color: "#635BFF" },
  polar: { name: "Polar", domain: "polar.sh", letters: "P", color: "#0062FF" },
  plaid: { name: "Plaid", domain: "plaid.com", letters: "PL", color: "#111111" },
  gocardless: { name: "GoCardless", domain: "gocardless.com", letters: "GC", color: "#00B87C" },
  shopify: { name: "Shopify", domain: "shopify.com", letters: "S", color: "#7AB55C" },
  amazon: { name: "Amazon", domain: "amazon.com", letters: "A", color: "#FF9900" },
  amazonaws: { name: "AWS", domain: "aws.amazon.com", letters: "AWS", color: "#FF9900" },
  quickbooks: { name: "QuickBooks", domain: "quickbooks.intuit.com", letters: "Q", color: "#2CA01C" },
  xero: { name: "Xero", domain: "xero.com", letters: "X", color: "#13B5EA" },
  twilio: { name: "Twilio", domain: "twilio.com", letters: "T", color: "#F22F46" },
  postmark: { name: "Postmark", domain: "postmarkapp.com", letters: "PM", color: "#FFDE00" },
  github: { name: "GitHub", domain: "github.com", letters: "GH", color: "#181717" },
  notion: { name: "Notion", domain: "notion.so", letters: "N", color: "#000000" },
  airtable: { name: "Airtable", domain: "airtable.com", letters: "A", color: "#18BFFF" },
  googlesheets: { name: "Google Sheets", domain: "sheets.google.com", letters: "GS", color: "#34A853" },
  segment: { name: "Segment", domain: "segment.com", letters: "S", color: "#52BD95" },
  posthog: { name: "PostHog", domain: "posthog.com", letters: "PH", color: "#F9BD2B" },
  unicommerce: { name: "Unicommerce", domain: "unicommerce.com", letters: "U", color: "#6C5CE7" },
  datev: { name: "DATEV", domain: "datev.de", letters: "D", color: "#009EE3" },
  razorpay: { name: "Razorpay", domain: "razorpay.com", letters: "R", color: "#0C2451" },
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

const SIGNATURE_PATH_D =
  "M20 19c-2.8 0-5-2.2-5-5s2.2-5 5-5M9 3v14a3 3 0 0 1-6 0M5 21c1.7 0 3-1.3 3-3M15 5 8 22M17 3l-4 8";

const LANDMARK_LINES = [
  { x1: 3, y1: 22, x2: 21, y2: 22 },
  { x1: 6, y1: 18, x2: 6, y2: 11 },
  { x1: 10, y1: 18, x2: 10, y2: 11 },
  { x1: 14, y1: 18, x2: 14, y2: 11 },
  { x1: 18, y1: 18, x2: 18, y2: 11 },
];

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
   * When true (default), draws the monogram fallback with currentColor.
   * When false, uses the brand's official color. logo.dev logos ignore
   * this — they come pre-colored.
   */
  monotone?: boolean;
}

function normalizeSlug(input: string): string {
  const lower = input.trim().toLowerCase().replace(/[_\s]/g, "-");
  return ALIASES[lower] ?? lower.replace(/-/g, "");
}

function logoDevUrl(domain: string): string {
  const params = new URLSearchParams({
    token: LOGO_DEV_TOKEN,
    format: "png",
    size: "128",
    retina: "true",
  });
  return `https://img.logo.dev/${domain}?${params.toString()}`;
}

export function BrandLogo({
  slug,
  className,
  label,
  monotone = true,
}: BrandLogoProps) {
  const key = normalizeSlug(slug);
  const brand = BRANDS[key];
  const [imgFailed, setImgFailed] = React.useState(false);

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

  // ---- Prefer logo.dev if token available and no fetch error yet ----------

  if (LOGO_DEV_TOKEN && !imgFailed) {
    return (
      <img
        src={logoDevUrl(brand.domain)}
        alt={label ?? brand.name}
        loading="lazy"
        decoding="async"
        className={cn("inline-block object-contain", className)}
        onError={() => setImgFailed(true)}
      />
    );
  }

  // ---- Monogram fallback ---------------------------------------------------

  const fill = monotone ? "currentColor" : brand.color;
  const letters = brand.letters;
  const fontSize = letters.length === 1 ? 14 : letters.length === 2 ? 10 : 8;
  const letterY = 12 + fontSize * 0.35;

  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={label ?? brand.name}
      className={cn("inline-block", className)}
      fill={fill}
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
            fill="#FFFFFF"
          >
            {letters}
          </text>
        </>
      )}
    </svg>
  );
}
