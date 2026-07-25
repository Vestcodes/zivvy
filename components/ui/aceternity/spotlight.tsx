"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { useMotionValue, useMotionTemplate, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  fill?: string;
  children?: React.ReactNode;
}

export const Spotlight = ({
  className,
  fill = "white",
  children,
}: SpotlightProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [opacity, setOpacity] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };
  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };
  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  const background = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, ${fill}, transparent 40%)`;

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden", className)}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{ background, opacity }}
      />
      {children}
    </div>
  );
};
