import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Zivvy — the clean way to run your whole business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          background:
            "radial-gradient(ellipse 80% 60% at 30% 15%, rgba(27,152,114,0.28), transparent 55%), linear-gradient(180deg, #fcfdfd 0%, #edf3f1 100%)",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          color: "#0f1729"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(180deg, #22c393, #1b9872)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 24px rgba(27,152,114,0.35)",
              color: "white",
              fontSize: 30,
              fontWeight: 700
            }}
          >
            Z
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: "-0.02em"
            }}
          >
            Zivvy
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              maxWidth: 940
            }}
          >
            The clean way to run{" "}
            <span style={{ fontStyle: "italic", color: "#178262" }}>your whole business</span>.
          </div>
          <div
            style={{
              fontSize: 30,
              marginTop: 28,
              color: "#5a687c",
              maxWidth: 900,
              lineHeight: 1.4
            }}
          >
            Sales, stock, accounting, HR and manufacturing in one product.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            color: "#5a687c",
            fontSize: 22
          }}
        >
          <div
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              background: "#ffffff",
              border: "1px solid #e8edec",
              color: "#178262",
              fontWeight: 600
            }}
          >
            Free · 2 seats included
          </div>
          <div>zivvy.xyz</div>
        </div>
      </div>
    ),
    size
  );
}
