import type { Metadata } from "next";
import TournamentDetailsClient from "./TournamentDetailsClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DbTournament = {
  title: string;
  description: string | null;
  slug: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const slug = params.id;

  const siteName = "Forex Leagues";
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://forexleagues.com";

  const supabase = await createClient();
  const { data } = await supabase
    .from("tournaments")
    .select("title,description,slug")
    .eq("slug", slug)
    .maybeSingle<DbTournament>();

  const pageTitle = data?.title
    ? `${data.title} | ${siteName}`
    : `${siteName} Tournament`;

  const desc =
    (data?.description && data.description.trim()) ||
    "Join this verified forex tournament on Forex Leagues. Compete, rank up, and win prizes.";

  const url = `${baseUrl}/tournaments/${encodeURIComponent(slug)}`;

  // ✅ OG image endpoint (absolute) + version busting for caches
  const ogImage = `${baseUrl}/api/og/tournament?slug=${encodeURIComponent(
    slug
  )}&v=1`;

  return {
    metadataBase: new URL(baseUrl),
    title: pageTitle,
    description: desc,
    alternates: { canonical: url },

    openGraph: {
      type: "website",
      url,
      siteName,
      title: pageTitle,
      description: desc,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: data?.title || "Forex Leagues Tournament",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: desc,
      images: [ogImage],
    },
  };
}

export default function Page() {
  return <TournamentDetailsClient />;
}