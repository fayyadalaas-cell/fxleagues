import { ImageResponse } from "next/og";

export const runtime = "edge";

type DbTournament = {
  title: string | null;
  description: string | null;
  prize_pool: number | null;
  sponsor_name: string | null;
  entry: string | null;
  type: string | null;
  status: string | null;
};

function money(n: number) {
  try {
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  } catch {
    return String(n);
  }
}

function fallbackImage(text = "Forex Leagues Tournament") {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#070A12,#0B1220)",
          color: "white",
          fontSize: 56,
          fontWeight: 900,
          fontFamily: "Arial",
        }}
      >
        {text}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const slug = searchParams.get("slug")?.trim();

  if (!slug) return fallbackImage("Missing slug");

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !ANON) return fallbackImage("Missing Supabase env");

  // ✅ Supabase REST (ممتاز للـ edge)
  const apiUrl =
    `${SUPABASE_URL}/rest/v1/tournaments` +
    `?select=title,description,prize_pool,sponsor_name,entry,type,status` +
    `&slug=eq.${encodeURIComponent(slug)}` +
    `&limit=1`;

  let row: DbTournament | null = null;

  try {
    const r = await fetch(apiUrl, {
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${ANON}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const arr = await r.json();
    row = Array.isArray(arr) ? (arr[0] as DbTournament) : null;
  } catch {
    return fallbackImage("Fetch failed");
  }

  const title = row?.title?.trim() || "Forex Leagues Tournament";
  const desc =
    row?.description?.trim() ||
    "Join this verified forex tournament on Forex Leagues. Compete, rank up, and win prizes.";

  const sponsor = row?.sponsor_name?.trim() || "Forex Leagues";
  const prize = Number(row?.prize_pool || 0);
  const entry = (row?.entry || "FREE").toUpperCase();
  const type = row?.type || "Daily";
  const status = String(row?.status || "UPCOMING").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "linear-gradient(135deg, #070A12 0%, #0B1220 55%, #06080F 100%)",
          padding: "56px",
          color: "#ffffff",
          fontFamily: "Arial",
          position: "relative",
        }}
      >
        {/* glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(700px 300px at 20% 30%, rgba(234,179,8,0.18), transparent 60%), radial-gradient(600px 280px at 80% 70%, rgba(234,179,8,0.10), transparent 60%)",
          }}
        />

        {/* frame */}
        <div
          style={{
            position: "absolute",
            inset: "28px",
            borderRadius: "28px",
            border: "1px solid rgba(234,179,8,0.20)",
          }}
        />

        <div style={{ position: "relative", display: "flex", gap: 28, width: "100%" }}>
          {/* left */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: "#EAB308",
                  boxShadow: "0 0 18px rgba(234,179,8,0.45)",
                }}
              />
              <div style={{ fontSize: 22, fontWeight: 900 }}>Forex Leagues</div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.55)" }}>
                Verified Forex Competitions
              </div>
            </div>

            <div style={{ marginTop: 26, fontSize: 64, fontWeight: 900, lineHeight: 1.05 }}>
              {title}
            </div>

            <div style={{ marginTop: 18, fontSize: 24, lineHeight: 1.3, color: "rgba(255,255,255,0.78)" }}>
              {desc.length > 140 ? desc.slice(0, 140) + "…" : desc}
            </div>

            <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "ENTRY", value: entry },
                { label: "TYPE", value: type },
                { label: "STATUS", value: status },
              ].map((c) => (
                <div
                  key={c.label}
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
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", fontWeight: 900 }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{c.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 18 }}>
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: 18,
                  background: "rgba(234,179,8,0.12)",
                  border: "1px solid rgba(234,179,8,0.25)",
                }}
              >
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 900 }}>
                  Prize Pool
                </div>
                <div style={{ fontSize: 34, fontWeight: 950, color: "#EAB308" }}>
                  ${money(prize)}
                </div>
              </div>

              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.60)" }}>
                {origin.replace(/^https?:\/\//, "")}/tournaments/{slug}
              </div>
            </div>
          </div>

          {/* right */}
          <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                borderRadius: 26,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.28)",
                padding: 18,
              }}
            >
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.60)", fontWeight: 900 }}>
                Sponsor
              </div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 950 }}>{sponsor}</div>

              {/* بدل الصور (حتى ما نرجع لمشكلة الأبيض) */}
              <div
                style={{
                  marginTop: 16,
                  width: "100%",
                  height: 210,
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(234,179,8,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "18px 16px",
                    borderRadius: 16,
                    background: "#111",
                    color: "#ddd",
                    fontSize: 22,
                    fontWeight: 900,
                    textAlign: "center",
                    maxWidth: 320,
                  }}
                >
                  {sponsor}
                </div>
              </div>

              <div style={{ marginTop: 14, fontSize: 16, color: "rgba(255,255,255,0.60)" }}>
                Share this tournament to invite friends.
              </div>
            </div>

            <div
              style={{
                marginTop: "auto",
                borderRadius: 20,
                padding: "14px 16px",
                border: "1px solid rgba(234,179,8,0.20)",
                background: "rgba(234,179,8,0.08)",
                color: "rgba(255,255,255,0.85)",
                fontSize: 16,
                fontWeight: 900,
              }}
            >
              Compete. Rank. Win.
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}