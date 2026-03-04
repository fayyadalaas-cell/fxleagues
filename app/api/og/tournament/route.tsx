import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "black",
          color: "white",
          fontSize: 64,
          fontWeight: 900,
          fontFamily: "Arial",
        }}
      >
        OG WORKS ✅
      </div>
    ),
    { width: 1200, height: 630 }
  );
}