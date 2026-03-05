// app/api/og/tournament/route.ts
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function titleCaseFromSlug(slug: string) {
  const clean = (slug || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");

  if (!clean) return "Forex Leagues Tournament";

  return clean.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "tournament";

  const tournamentTitle = titleCaseFromSlug(slug);
  const siteName = "Forex Leagues";
  const subTitle = "Verified Forex Competitions";
  const footer = "forexleagues.com";

  try {
    const img = new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            position: "relative",
            background:
              "radial-gradient(900px 450px at 20% 25%, rgba(250,204,21,0.16), transparent 60%), radial-gradient(900px 450px at 85% 70%, rgba(250,204,21,0.10), transparent 60%), linear-gradient(135deg, #020617 0%, #050b1a 45%, #020617 100%)",
            color: "#ffffff",
            padding: "56px",
            boxSizing: "border-box",
          }}
        >
          {/* soft frame */}
          <div
            style={{
              position: "absolute",
              inset: "28px",
              borderRadius: "28px",
              border: "1px solid rgba(250,204,21,0.22)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
            }}
          />

          {/* content */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* top bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: "#FACC15",
                  boxShadow: "0 0 18px rgba(250,204,21,0.55)",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.3 }}>
                  {siteName}
                </div>
                <div style={{ fontSize: 18, color: "rgba(255,255,255,0.70)" }}>
                  {subTitle}
                </div>
              </div>

              {/* badge right */}
              <div style={{ marginLeft: "auto" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(0,0,0,0.25)",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  Trading Tournament
                </div>
              </div>
            </div>

            {/* main title */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  fontSize: 68,
                  fontWeight: 950,
                  lineHeight: 1.05,
                  letterSpacing: -0.8,
                  color: "#FFFFFF",
                }}
              >
                {tournamentTitle}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "COMPETE", value: "Rank up & win prizes" },
                  { label: "SHARE", value: "Invite your friends" },
                ].map((b) => (
                  <div
                    key={b.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(0,0,0,0.25)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: "rgba(255,255,255,0.60)",
                        letterSpacing: 0.6,
                      }}
                    >
                      {b.label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#FACC15" }}>
                      {b.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* footer */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.65)" }}>
                {footer}
              </div>

              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                /tournaments/{slug}
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );

    // اجبار الرندر + ضمان Content-Length صحيح
    const buf = await img.arrayBuffer();

    return new Response(buf, {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "no-store, max-age=0",
        "content-length": String(buf.byteLength),
      },
    });
  } catch (err: any) {
    return new Response(
      `OG ERROR:\n${err?.stack || err?.message || String(err)}`,
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  }
}