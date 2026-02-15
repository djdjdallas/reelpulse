import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Reelytics — Analytics for Short-Form Series Creators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6d28d9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: "#ffffff",
            marginTop: 24,
          }}
        >
          Reelytics
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            marginTop: 12,
          }}
        >
          Analytics for Short-Form Series Creators
        </div>
      </div>
    ),
    { ...size }
  );
}
