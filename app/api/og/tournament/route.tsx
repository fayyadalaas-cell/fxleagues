// app/api/og/tournament/route.ts

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "Tournament";

  try {

    const img = new ImageResponse(

      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background:
              "linear-gradient(135deg,#020617,#020617,#0f172a)",
            color: "#fff",
            padding: "60px",
          }}
        >

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Forex Leagues
          </div>

          {/* Subtitle */}
          <div
            style={{
              marginTop: 20,
              fontSize: 36,
              opacity: 0.9,
            }}
          >
            Trading Tournament
          </div>

          {/* Tournament */}
          <div
            style={{
              marginTop: 40,
              fontSize: 48,
              fontWeight: 700,
              color: "#facc15",
            }}
          >
            {slug.replaceAll("-", " ")}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 40,
              fontSize: 26,
              opacity: 0.7,
            }}
          >
            forexleagues.com
          </div>

        </div>
      ),

      {
        width: 1200,
        height: 630,
      }
    );

    const buf = await img.arrayBuffer();

    return new Response(buf, {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "no-store",
        "content-length": String(buf.byteLength),
      },
    });

  } catch (err: any) {

    return new Response(
      `OG ERROR:\n${err?.stack || err?.message || String(err)}`,
      { status: 500 }
    );

  }
}