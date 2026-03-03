// app/sitemap.ts
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600; // Rebuild every hour

const siteUrl = "https://forexleagues.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ================================
  // Static Routes
  // ================================
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/schedule`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/winners`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/how-it-works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/brokers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // ================================
  // Dynamic Tournament Routes
  // ================================
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
          changeFrequency: "daily",
          priority: 0.9,
        } as MetadataRoute.Sitemap[number];
      })
      .filter(Boolean) as MetadataRoute.Sitemap;

    // ================================
    // Remove duplicate URLs
    // ================================
    const unique = new Map<string, MetadataRoute.Sitemap[number]>();
    [...staticRoutes, ...tournamentRoutes].forEach((route) =>
      unique.set(route.url, route)
    );

    return Array.from(unique.values());
  } catch {
    return staticRoutes;
  }
}