import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#070707",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="132"
          height="132"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            stroke="#fffaf5"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          >
            <line x1="20" y1="30" x2="80" y2="30" />
            <line x1="26" y1="44" x2="74" y2="44" />
            <line x1="32" y1="58" x2="68" y2="58" />
            <line x1="40" y1="72" x2="60" y2="72" />
            <line x1="46" y1="84" x2="54" y2="84" />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
