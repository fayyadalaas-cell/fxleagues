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

const OG_VERSION = 5;

function normalizeSlug(input?: string | null) {
  const raw = (input ?? "").trim();
  const decoded = raw ? decodeURIComponent(raw) : "";
  const s = decoded.trim();
  if (!s) return "";
  if (s === "undefined" || s === "null") return "";
  return s;
}

type PageMetaProps = {
  params: { id?: string } | Promise<{ id?: string }>;
};

export async function generateMetadata({ params }: PageMetaProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = normalizeSlug(resolvedParams?.id);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://forexleagues.com";

  const siteName = "Forex Leagues";

  // ✅ إذا slug مش موجود لا ترجع /undefined نهائيًا
  if (!slug) {
    const fallbackTitle = `${siteName} Tournament`;
    const fallbackDesc =
      "Join verified forex tournaments on Forex Leagues. Compete, rank up, and win prizes.";
    const fallbackUrl = `${baseUrl}/tournaments`;
    const fallbackOgImage = `${baseUrl}/api/og/tournament?slug=${encodeURIComponent("tournament")}&v=${OG_VERSION}`;

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
        images: [{ url: fallbackOgImage, width: 1200, height: 630 }],
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

  const title = data?.title ? `${data.title} | ${siteName}` : `${siteName} Tournament`;

  const desc =
    (data?.description && data.description.trim()) ||
    "Join this verified forex tournament on Forex Leagues. Compete, rank up, and win prizes.";

  const ogImage = `${baseUrl}/api/og/tournament?slug=${encodeURIComponent(slug)}&v=${OG_VERSION}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description: desc,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      url,
      siteName,
      title,
      description: desc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: data?.title || "Forex Leagues Tournament" }],
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