"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Client wrapper around next/image for BLG hero images.
 * Hides gracefully when the remote URL 404s or fails to load.
 */
export function BlogHeroImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <Image
      src={src}
      alt={alt}
      width={960}
      height={540}
      className="rounded-xl border border-border/70"
      priority
      onError={() => setFailed(true)}
    />
  );
}
