import type { Metadata } from "next";
import TournamentDetailsClient from "./TournamentDetailsClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DbTournament = {
  title: string;
  description: string | null;
  slug: string | null;
  sponsor_name?: string | null;
  sponsor_logo_url?: string | null;
  sponsor_logo_key?: string | null;
};

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

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const slug = params.id;

  const supabase = await createClient();
  const { data } = await supabase
    .from("tournaments")
    .select("title,description,slug,sponsor_name,sponsor_logo_url,sponsor_logo_key")
    .eq("slug", slug)
    .maybeSingle<DbTournament>();

  const siteName = "Forex Leagues";
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://forexleagues.com";

  const title = data?.title ? `${data.title} | ${siteName}` : `${siteName} Tournament`;
  const desc =
    (data?.description && data.description.trim()) ||
    "Join this verified forex tournament on Forex Leagues. Compete, rank up, and win prizes.";

  const sponsorKey = (data?.sponsor_logo_key || "").toLowerCase();
  const img =
    (data?.sponsor_logo_url &&
      (data.sponsor_logo_url.startsWith("http") || data.sponsor_logo_url.startsWith("/"))
      ? data.sponsor_logo_url
      : logoPathFromKey(sponsorKey)) || "/logo.png";

  // لازم تكون Absolute URL للصورة والرابط
  const url = `${baseUrl}/tournaments/${slug}`;
  const imageUrl = img.startsWith("http") ? img : `${baseUrl}${img}`;

  return {
    title,
    description: desc,
    alternates: { canonical: url },

    openGraph: {
      type: "website",
      url,
      siteName,
      title,
      description: desc,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: data?.title || "Forex Leagues Tournament",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [imageUrl],
    },
  };
}

export default function Page() {
  return <TournamentDetailsClient />;
}