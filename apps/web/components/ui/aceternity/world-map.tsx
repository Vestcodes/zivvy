"use client";

import React, { useId, useMemo, useRef } from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";

interface MapConnection {
  start: { lat: number; lng: number; label?: string };
  end: { lat: number; lng: number; label?: string };
}

interface WorldMapProps {
  dots?: MapConnection[];
  lineColor?: string;
}

// Convert lat/lng to a 800x400 equirectangular projection.
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

export const WorldMap = ({
  dots = [],
  lineColor = "#0f766e",
}: WorldMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId();

  const mapSvgDataUri = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    const svg = map.getSVG({
      radius: 0.22,
      color: "#00000030",
      shape: "circle",
      backgroundColor: "transparent",
    });
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, []);

  return (
    <div className="w-full aspect-[2/1] dark:bg-black bg-white rounded-lg relative font-sans">
      <img
        src={mapSvgDataUri}
        alt="World map"
        className="pointer-events-none absolute inset-0 h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full select-none absolute inset-0"
      >
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
