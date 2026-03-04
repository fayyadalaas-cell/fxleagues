/* app/tournaments/[id]/opengraph-image.tsx */
import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type DbTournament = {
  title: string;
  description: string | null;
  prize_pool: number | null;
  sponsor_name: string | null;
  sponsor_logo_url: string | null;
  sponsor_logo_key: string | null;
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
  return map[k] || "/logo.png";
}

export default async function Image({ params }: { params: { id: string } }) {
  const slug = params.id;

  const baseUrl =
    (process.env.NEXT_PUBLIC_SITE_URL || "https://forexleagues.com").replace(/\/$/, "");

  // Fetch tournament (public read policy لازم تكون شغالة)
  const supabase = await createClient();
  const { data } = await supabase
    .from("tournaments")
    .select("title,description,prize_pool,sponsor_name,sponsor_logo_url,sponsor_logo_key,entry,type,status")
    .eq("slug", slug)
    .maybeSingle<DbTournament>();

  const title = data?.title || "Forex Leagues Tournament";
  const desc =
    (data?.description && data.description.trim()) ||
    "Join this verified forex tournament and compete for prizes.";

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

  const logoUrl = rawLogo.startsWith("http") ? rawLogo : `${baseUrl}${rawLogo}`;

  // Dark navy + gold theme
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
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
          position: "relative",
        }}
      >
        {/* subtle glow */}
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

        {/* content */}
        <div style={{ position: "relative", display: "flex", gap: "28px", width: "100%" }}>
          {/* Left column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* brand */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: "#EAB308",
                  boxShadow: "0 0 18px rgba(234,179,8,0.45)",
                }}
              />
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.2 }}>
                Forex Leagues
              </div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.55)" }}>
                Verified Forex Competitions
              </div>
            </div>

            {/* title */}
            <div
              style={{
                marginTop: 26,
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: -0.6,
              }}
            >
              {title}
            </div>

            {/* desc */}
            <div style={{ marginTop: 18, fontSize: 24, lineHeight: 1.3, color: "rgba(255,255,255,0.78)" }}>
              {desc.length > 140 ? desc.slice(0, 140) + "…" : desc}
            </div>

            {/* chips */}
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
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* bottom */}
            <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 18 }}>
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: 18,
                  background: "rgba(234,179,8,0.12)",
                  border: "1px solid rgba(234,179,8,0.25)",
                }}
              >
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 700 }}>
                  Prize Pool
                </div>
                <div style={{ fontSize: 34, fontWeight: 950, color: "#EAB308" }}>
                  ${money(prizePool)}
                </div>
              </div>

              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.60)" }}>
                forexleagues.com/tournaments/{slug}
              </div>
            </div>
          </div>

          {/* Right column (Sponsor) */}
          <div
            style={{
              width: 360,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                borderRadius: 26,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.28)",
                padding: 18,
              }}
            >
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.60)", fontWeight: 800 }}>
                Sponsor
              </div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 950 }}>{sponsorName}</div>

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
                  src={logoUrl}
                  alt={sponsorName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
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
                fontWeight: 700,
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