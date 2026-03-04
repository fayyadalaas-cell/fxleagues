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

const OG_VERSION = 2; // غيّرها كل مرة بدك تكسر كاش فيسبوك/واتس

export async function generateMetadata({
  params,
}: {
  params: { id?: string };
}): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://forexleagues.com";

  const siteName = "Forex Leagues";

  // ✅ Fix: params.id ممكن يطلع undefined لبعض crawlers
  const slug = decodeURIComponent(params?.id ?? "");

  // ✅ إذا ما في slug، لا ترجع /undefined ولا OG undefined
  if (!slug) {
    const fallbackTitle = `${siteName} Tournament`;
    const fallbackDesc =
      "Join verified forex tournaments on Forex Leagues. Compete, rank up, and win prizes.";
    const fallbackUrl = `${baseUrl}/tournaments`;

    const fallbackOgImage = `${baseUrl}/api/og/tournament?slug=${encodeURIComponent(
      "tournament"
    )}&v=${OG_VERSION}`;

    return {
      metadataBase: new URL(baseUrl),
      title: fallbackTitle,
      description: fallbackDesc,
      alternates: { canonical: fallbackUrl },
      robots: { index: true, follow: true },

      openGraph: {
        type: "website",
        url: fallbackUrl,
        siteName,
        title: fallbackTitle,
        description: fallbackDesc,
        images: [
          {
            url: fallbackOgImage,
            width: 1200,
            height: 630,
            alt: "Forex Leagues Tournament",
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDesc,
        images: [fallbackOgImage],
      },
    };
  }

  const url = `${baseUrl}/tournaments/${encodeURIComponent(slug)}`;

  const supabase = await createClient();
  const { data } = await supabase
    .from("tournaments")
    .select("title,description,slug")
    .eq("slug", slug)
    .maybeSingle<DbTournament>();

  const title = data?.title
    ? `${data.title} | ${siteName}`
    : `${siteName} Tournament`;

  const desc =
    (data?.description && data.description.trim()) ||
    "Join this verified forex tournament on Forex Leagues. Compete, rank up, and win prizes.";

  // ✅ OG image endpoint (absolute URL + version)
  const ogImage = `${baseUrl}/api/og/tournament?slug=${encodeURIComponent(
    slug
  )}&v=${OG_VERSION}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description: desc,
    alternates: { canonical: url },

    // إذا بدك تمنع الأرشفة مؤقتًا غيّرها إلى: { index: false, follow: false }
    robots: { index: true, follow: true },

    openGraph: {
      type: "article",
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