"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SparklesCoreProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  speed?: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  opacityDirection: number;
  speedFactor: number;
}

export const SparklesCore = ({
  className,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1.4,
  particleDensity = 120,
  particleColor = "#FFFFFF",
  speed = 1,
}: SparklesCoreProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width;
      canvas.height = height;
      const count = Math.floor((width * height) / 10000) * (particleDensity / 100);
      particlesRef.current = new Array(Math.max(1, Math.floor(count)))
        .fill(0)
        .map(() => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * (maxSize - minSize) + minSize,
          opacity: Math.random(),
          opacityDirection: Math.random() > 0.5 ? 1 : -1,
          speedFactor: Math.random() * 0.5 + 0.5,
        }));
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      if (background !== "transparent") {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }
      particlesRef.current.forEach((p) => {
        p.opacity += p.opacityDirection * 0.005 * speed * p.speedFactor;
        if (p.opacity <= 0) {
          p.opacity = 0;
          p.opacityDirection = 1;
          p.x = Math.random() * width;
          p.y = Math.random() * height;
        } else if (p.opacity >= 1) {
          p.opacity = 1;
          p.opacityDirection = -1;
        }
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [background, minSize, maxSize, particleDensity, particleColor, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-full w-full", className)}
    />
  );
};
