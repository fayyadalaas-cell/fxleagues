// app/sitemap.ts
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600; // every hour

const siteUrl = "https://forexleagues.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now },
    { url: `${siteUrl}/schedule`, lastModified: now },
    { url: `${siteUrl}/winners`, lastModified: now },
    { url: `${siteUrl}/how-it-works`, lastModified: now },
    { url: `${siteUrl}/brokers`, lastModified: now },
  ];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ✅ NOTE: your table doesn't have updated_at, so we use start_date / created_at
    const { data, error } = await supabase
      .from("tournaments")
      .select("slug, start_date, created_at")
      .not("slug", "is", null);

    if (error || !data?.length) return staticRoutes;

    const tournamentRoutes: MetadataRoute.Sitemap = data
      .map((t) => {
        const slug = String((t as any).slug || "").trim();
        if (!slug) return null;

        const startDateRaw = (t as any).start_date;
        const createdAtRaw = (t as any).created_at;

        const lastModified =
          (startDateRaw ? new Date(startDateRaw) : null) ??
          (createdAtRaw ? new Date(createdAtRaw) : null) ??
          now;

        return {
          url: `${siteUrl}/tournaments/${encodeURIComponent(slug)}`,
          lastModified,
        } as MetadataRoute.Sitemap[number];
      })
      .filter(Boolean) as MetadataRoute.Sitemap;

    // De-dup by URL (in case of duplicate slugs)
    const unique = new Map<string, MetadataRoute.Sitemap[number]>();
    [...staticRoutes, ...tournamentRoutes].forEach((r) => unique.set(r.url, r));

    return Array.from(unique.values());
  } catch {
    return staticRoutes;
  }
}