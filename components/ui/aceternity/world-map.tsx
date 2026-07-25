"use client";

import React, { useId, useRef } from "react";
import { motion } from "motion/react";

interface MapConnection {
  start: { lat: number; lng: number; label?: string };
  end: { lat: number; lng: number; label?: string };
}

interface WorldMapProps {
  dots?: MapConnection[];
  lineColor?: string;
}

// Convert lat/lng to a simple 800x400 equirectangular projection.
const project = (lat: number, lng: number) => {
  const x = ((lng + 180) / 360) * 800;
  const y = ((90 - lat) / 180) * 400;
  return { x, y };
};

const createCurvedPath = (
  start: { x: number; y: number },
  end: { x: number; y: number },
) => {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 50;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
};

// A minimal set of dotted "continents" — a placeholder so we don't depend
// on external map data. This gives a similar visual to Aceternity's WorldMap
// without requiring react-simple-maps.
const DOT_GRID: Array<[number, number]> = [];
for (let lat = -60; lat <= 80; lat += 6) {
  for (let lng = -170; lng <= 170; lng += 6) {
    // rough land mask: keep dots in continent-ish bands
    const inNAmerica = lat > 15 && lat < 70 && lng > -140 && lng < -55;
    const inSAmerica = lat > -55 && lat < 10 && lng > -80 && lng < -35;
    const inEurope = lat > 35 && lat < 70 && lng > -10 && lng < 40;
    const inAfrica = lat > -35 && lat < 35 && lng > -18 && lng < 50;
    const inAsia = lat > 5 && lat < 70 && lng > 40 && lng < 145;
    const inOceania = lat > -45 && lat < -10 && lng > 110 && lng < 155;
    if (
      inNAmerica ||
      inSAmerica ||
      inEurope ||
      inAfrica ||
      inAsia ||
      inOceania
    ) {
      DOT_GRID.push([lat, lng]);
    }
  }
}

export const WorldMap = ({
  dots = [],
  lineColor = "#0ea5e9",
}: WorldMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId();

  return (
    <div className="w-full aspect-[2/1] dark:bg-black bg-white rounded-lg relative font-sans">
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full select-none absolute inset-0"
      >
        {DOT_GRID.map(([lat, lng], idx) => {
          const { x, y } = project(lat, lng);
          return (
            <circle
              key={`dot-${idx}`}
              cx={x}
              cy={y}
              r="1"
              fill="currentColor"
              className="text-neutral-300 dark:text-neutral-700"
            />
          );
        })}

        {dots.map((connection, i) => {
          const start = project(connection.start.lat, connection.start.lng);
          const end = project(connection.end.lat, connection.end.lng);
          return (
            <g key={`connection-${i}`}>
              <motion.path
                d={createCurvedPath(start, end)}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.5 * i,
                  ease: "easeOut",
                }}
              />
            </g>
          );
        })}

        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((connection, i) => {
          const start = project(connection.start.lat, connection.start.lng);
          const end = project(connection.end.lat, connection.end.lng);
          return (
            <g key={`points-${i}`}>
              <circle cx={start.x} cy={start.y} r="2" fill={lineColor} />
              <circle
                cx={start.x}
                cy={start.y}
                r="2"
                fill={lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="2"
                  to="8"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={end.x} cy={end.y} r="2" fill={lineColor} />
              <circle
                cx={end.x}
                cy={end.y}
                r="2"
                fill={lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="2"
                  to="8"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
