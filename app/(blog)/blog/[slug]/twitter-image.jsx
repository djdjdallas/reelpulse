import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/data/blog";

export const runtime = "edge";
export const alt = "ReelPulse Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  const title = article?.title || "ReelPulse Blog";
  const category = article?.category?.replace(/-/g, " ") || "Blog";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#ffffff" }}>
            ReelPulse
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#3b82f6",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {category}
          </span>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              maxWidth: "900px",
            }}
          >
            {title}
          </span>
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#94a3b8",
          }}
        >
          reelpulse.com/blog
        </div>
      </div>
    ),
    { ...size }
  );
}
