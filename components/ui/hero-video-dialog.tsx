"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Play, XIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out"

interface HeroVideoProps {
  animationStyle?: AnimationStyle
  videoSrc: string
  /** Optional WebM (or other) source for browsers that prefer it. */
  videoSrcWebm?: string
  thumbnailSrc: string
  thumbnailAlt?: string
  className?: string
  /** Set true for above-the-fold thumbnails (adds fetchpriority="high"). */
  priority?: boolean
}

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
}

function isSelfHostedVideo(src: string) {
  return (
    src.startsWith("/") ||
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(src) ||
    src.startsWith("blob:")
  )
}

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  videoSrcWebm,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className,
  priority,
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const selectedAnimation = animationVariants[animationStyle]
  const selfHosted = isSelfHostedVideo(videoSrc)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isVideoOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsVideoOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prev
    }
  }, [isVideoOpen])

  const dialog =
    mounted &&
    createPortal(
      <AnimatePresence>
        {isVideoOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Product tour video"
            onClick={() => setIsVideoOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative mx-4 aspect-video w-full max-w-4xl md:mx-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close video"
                onClick={() => setIsVideoOpen(false)}
                className="absolute -top-16 right-0 rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black"
              >
                <XIcon className="size-5" />
              </button>
              <div className="relative isolate z-1 size-full overflow-hidden rounded-2xl border-2 border-white bg-black">
                {selfHosted ? (
                  <video
                    key={videoSrc}
                    title="Product tour"
                    className="mt-0 size-full rounded-2xl object-contain"
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                  >
                    {videoSrcWebm ? (
                      <source src={videoSrcWebm} type="video/webm" />
                    ) : null}
                    <source src={videoSrc} type="video/mp4" />
                  </video>
                ) : (
                  <iframe
                    src={videoSrc}
                    title="Hero Video player"
                    className="mt-0 size-full rounded-2xl"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body
    )

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Play video"
        className="group relative w-full cursor-pointer border-0 bg-transparent p-0 text-left"
        onClick={() => setIsVideoOpen(true)}
      >
        <Image
          src={thumbnailSrc}
          alt={thumbnailAlt}
          width={1920}
          height={1080}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
          className="w-full rounded-xl border border-border/70 shadow-lg transition-all duration-200 ease-out group-hover:brightness-[0.8]"
        />
        <div className="absolute inset-0 flex scale-[0.9] items-center justify-center rounded-xl transition-all duration-200 ease-out group-hover:scale-100">
          <div className="flex size-28 items-center justify-center rounded-full bg-primary/10 backdrop-blur-md">
            <div className="relative flex size-20 scale-100 items-center justify-center rounded-full bg-linear-to-b from-primary/30 to-primary shadow-md transition-all duration-200 ease-out group-hover:scale-[1.2]">
              <Play
                className="size-8 scale-100 fill-white text-white transition-transform duration-200 ease-out group-hover:scale-105"
                style={{
                  filter:
                    "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
                }}
              />
            </div>
          </div>
        </div>
      </button>
      {dialog}
    </div>
  )
}
