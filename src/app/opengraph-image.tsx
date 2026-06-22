import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #064e3b 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>Revision Scheduler</div>
        <div style={{ fontSize: 32, marginTop: 20, color: "#a7f3d0", textAlign: "center", maxWidth: 900 }}>
          Spaced-repetition exam revision, scheduled automatically
        </div>
        <div style={{ fontSize: 22, marginTop: 36, color: "#94a3b8" }}>
          SM-2 algorithm &middot; Smart scheduling &middot; Progress tracking
        </div>
      </div>
    ),
    { ...size }
  );
}
