// app/sitemap.ts
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600; // كل ساعة (خفيف على السيرفر وعلى Supabase)

const siteUrl = "https://forexleagues.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // صفحات ثابتة
  const now = new Date();
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

    // جلب slugs من جدول tournaments
    const { data, error } = await supabase
      .from("tournaments")
      .select("slug, updated_at, created_at")
      .not("slug", "is", null);

    if (error || !data) {
      return staticRoutes; // لو فشل، رجّع الستاتيك بدون ما يوقع الموقع
    }

    const tournamentRoutes: MetadataRoute.Sitemap = data
      .map((t) => {
        const slug = String(t.slug || "").trim();
        if (!slug) return null;

        const last =
          (t.updated_at ? new Date(t.updated_at) : null) ??
          (t.created_at ? new Date(t.created_at) : null) ??
          now;

        return {
          url: `${siteUrl}/tournaments/${encodeURIComponent(slug)}`,
          lastModified: last,
        } as MetadataRoute.Sitemap[number];
      })
      .filter(Boolean) as MetadataRoute.Sitemap;

    // منع التكرار لو تكرر slug
    const unique = new Map<string, MetadataRoute.Sitemap[number]>();
    [...staticRoutes, ...tournamentRoutes].forEach((r) => unique.set(r.url, r));
    return Array.from(unique.values());
  } catch {
    return staticRoutes;
  }
}