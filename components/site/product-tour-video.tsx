"use client";

import { BorderBeam } from "@/components/ui/border-beam";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import { cn } from "@/lib/utils";

const VIDEO_SRC = "/videos/zivvy-product-tour.mp4";
const VIDEO_SRC_WEBM = "/videos/zivvy-product-tour.webm";
const POSTER_SRC = "/videos/zivvy-product-tour-poster.jpg";

type Props = {
  className?: string;
  /** Kept for call-site compatibility; dialog always uses thumbnail + modal. */
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  showBeam?: boolean;
  animationStyle?: "from-center" | "top-in-bottom-out" | "from-bottom";
  thumbnailAlt?: string;
};

/**
 * Product tour embed via Magic UI HeroVideoDialog (thumbnail → modal player).
 * Self-hosted mp4; light/dark wrappers match the Magic UI dual-instance pattern.
 */
export function ProductTourVideo({
  className,
  showBeam = false,
  animationStyle = "from-center",
  thumbnailAlt = "Zivvy product tour"
}: Props) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div className="block dark:hidden">
        <HeroVideoDialog
          animationStyle={animationStyle}
          videoSrc={VIDEO_SRC}
          videoSrcWebm={VIDEO_SRC_WEBM}
          thumbnailSrc={POSTER_SRC}
          thumbnailAlt={thumbnailAlt}
        />
      </div>
      <div className="hidden dark:block">
        <HeroVideoDialog
          animationStyle={animationStyle}
          videoSrc={VIDEO_SRC}
          videoSrcWebm={VIDEO_SRC_WEBM}
          thumbnailSrc={POSTER_SRC}
          thumbnailAlt={thumbnailAlt}
        />
      </div>
      {showBeam ? (
        <BorderBeam
          size={140}
          duration={9}
          colorFrom="#34d399"
          colorTo="#0f766e"
          borderWidth={1.5}
        />
      ) : null}
    </div>
  );
}
