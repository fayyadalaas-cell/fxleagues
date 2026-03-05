import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type DbTournament = {
  title: string;
  description: string | null;
  prize_pool: number | null;
  sponsor_name: string | null;
  sponsor_logo_key: string | null;
  sponsor_logo_url: string | null;
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

function logoPathFromKey(key?: string | null) {
  const k = (key || "").toLowerCase();
  const map: Record<string, string> = {
    exness: "/brokers/exness.png",
    icmarkets: "/brokers/icmarkets.png",
    fxtm: "/brokers/fxtm.png",
    fxm: "/brokers/fxtm.png",
    vantage: "/brokers/vantage.png",
    fxleagues: "/brokers/fxleagues.png",
  };
  return map[k] || "/brokers/fxleagues.png";
}

async function fetchTournamentBySlug(slug: string): Promise<DbTournament | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const endpoint =
    `${url.replace(/\/$/, "")}/rest/v1/tournaments` +
    `?select=title,description,prize_pool,sponsor_name,sponsor_logo_key,sponsor_logo_url,entry,type,status` +
    `&slug=eq.${encodeURIComponent(slug)}` +
    `&limit=1`;

  const res = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const arr = (await res.json()) as DbTournament[];
  return arr?.[0] ?? null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get("slug") || "").trim();

  const baseUrlRaw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://forexleagues.com");

  const baseUrl = baseUrlRaw.replace(/\/$/, "");

  const data = slug ? await fetchTournamentBySlug(slug) : null;

  const title = data?.title || "Forex Leagues Tournament";
  const desc =
    (data?.description && data.description.trim()) ||
    "Join this verified forex tournament on Forex Leagues. Compete, rank up, and win prizes.";

  const sponsorName = data?.sponsor_name || "Forex Leagues";
  const prizePool = Number(data?.prize_pool || 0);
  const entry = (data?.entry || "FREE").toUpperCase();
  const type = data?.type || "Daily";
  const status = (data?.status || "UPCOMING").toUpperCase();

  const sponsorKey = (data?.sponsor_logo_key || "").toLowerCase();

  const rawLogo =
    data?.sponsor_logo_url &&
    (data.sponsor_logo_url.startsWith("http") || data.sponsor_logo_url.startsWith("/"))
      ? data.sponsor_logo_url
      : logoPathFromKey(sponsorKey);

  const sponsorLogoUrl = rawLogo.startsWith("http") ? rawLogo : `${baseUrl}${rawLogo}`;

  const brandLogoUrl = `${baseUrl}/brokers/fxleagues.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          padding: "54px",
          color: "#fff",
          background: "linear-gradient(135deg, #05060A 0%, #0A1020 55%, #05060A 100%)",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
          position: "relative",
        }}
      >
        {/* glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(700px 320px at 18% 28%, rgba(234,179,8,0.20), transparent 60%), radial-gradient(600px 280px at 85% 72%, rgba(234,179,8,0.10), transparent 60%)",
          }}
        />

        {/* frame */}
        <div
          style={{
            position: "absolute",
            inset: "24px",
            borderRadius: "28px",
            border: "1px solid rgba(234,179,8,0.22)",
          }}
        />

        <div style={{ position: "relative", display: "flex", gap: "28px", width: "100%" }}>
          {/* Left */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* brand header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(0,0,0,0.30)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brandLogoUrl}
                  alt="Forex Leagues"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 0.2 }}>
                  Forex Leagues
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                  Verified Forex Competitions
                </div>
              </div>
            </div>

            {/* title */}
            <div
              style={{
                marginTop: 26,
                fontSize: 64,
                fontWeight: 950,
                lineHeight: 1.05,
                letterSpacing: -0.8,
              }}
            >
              {title}
            </div>

            {/* desc */}
            <div
              style={{
                marginTop: 18,
                fontSize: 24,
                lineHeight: 1.35,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              {desc.length > 150 ? desc.slice(0, 150) + "…" : desc}
            </div>

            {/* chips */}
            <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
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
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.28)",
                  }}
                >
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 800 }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 950 }}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* footer row */}
            <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 18 }}>
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: 18,
                  background: "rgba(234,179,8,0.12)",
                  border: "1px solid rgba(234,179,8,0.25)",
                }}
              >
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 800 }}>
                  Prize Pool
                </div>
                <div style={{ fontSize: 34, fontWeight: 950, color: "#EAB308" }}>
                  ${money(prizePool)}
                </div>
              </div>

              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.60)" }}>
                forexleagues.com/tournaments/{slug || "…"}
              </div>
            </div>
          </div>

          {/* Right sponsor card */}
          <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                borderRadius: 26,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.30)",
                padding: 18,
              }}
            >
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 900 }}>
                Sponsor
              </div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 950 }}>
                {sponsorName}
              </div>

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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sponsorLogoUrl}
                  alt={sponsorName}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>

              <div style={{ marginTop: 14, fontSize: 14, color: "rgba(255,255,255,0.60)" }}>
                Share this tournament and invite friends.
              </div>
            </div>

            <div
              style={{
                marginTop: "auto",
                borderRadius: 20,
                padding: "14px 16px",
                border: "1px solid rgba(234,179,8,0.22)",
                background: "rgba(234,179,8,0.08)",
                color: "rgba(255,255,255,0.88)",
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              Compete. Rank. Win.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}