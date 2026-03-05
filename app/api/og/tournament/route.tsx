import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("slug") || "tournament"

  const title =
    slug
      .replaceAll("-", " ")
      .replace(/\b\w/g, c => c.toUpperCase())

  return new ImageResponse(

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
            "linear-gradient(135deg,#020617,#0f172a)",
          color: "#fff",
        }}
      >

        <div
          style={{
            fontSize: 70,
            fontWeight: 900,
          }}
        >
          Forex Leagues
        </div>

        <div
          style={{
            fontSize: 36,
            marginTop: 10,
            opacity: 0.8,
          }}
        >
          Trading Tournament
        </div>

        <div
          style={{
            fontSize: 50,
            marginTop: 40,
            color: "#facc15",
            fontWeight: 800,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 24,
            marginTop: 40,
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
  )
}