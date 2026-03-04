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

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const slug = params.id;

  const supabase = await createClient();
  const { data } = await supabase
    .from("tournaments")
    .select("title,description,slug")
    .eq("slug", slug)
    .maybeSingle<DbTournament>();

  const siteName = "Forex Leagues";

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://forexleagues.com";

  const title = data?.title
    ? `${data.title} | ${siteName}`
    : `${siteName} Tournament`;

  const desc =
    (data?.description && data.description.trim()) ||
    "Join this verified forex tournament on Forex Leagues. Compete, rank up, and win prizes.";

  const url = `${baseUrl}/tournaments/${slug}`;

  // 👇 الصورة الجديدة التي ستستخدمها Facebook / WhatsApp
  const ogImage = `${baseUrl}/api/og/tournament?slug=${encodeURIComponent(
    slug
  )}&v=1`;

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
          url: ogImage,
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
      images: [ogImage],
    },
  };
}

export default function Page() {
  return <TournamentDetailsClient />;
}