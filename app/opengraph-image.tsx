import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vanity Phone Number Studio";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
          padding: 80,
          background: "#07080b",
          color: "#f4f5f7",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              border: "2px solid #242936",
              background: "#0d0f14",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#5eead4",
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            #
          </div>
          <div style={{ fontSize: 30, color: "#98a0b3", letterSpacing: 4 }}>VANITY PHONE NUMBER STUDIO</div>
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
          Memorable phone numbers for humans and AI agents
        </div>
        <div style={{ fontSize: 30, color: "#98a0b3" }}>
          Spell, decode, and verify vanity numbers · Open source · REST + MCP
        </div>
      </div>
    ),
    { ...size },
  );
}
