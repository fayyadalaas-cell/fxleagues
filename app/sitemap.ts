// app/sitemap.ts
import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://forexleagues.com";

  // الروابط الثابتة الأساسية
  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/schedule`, lastModified: new Date() },
    { url: `${baseUrl}/winners`, lastModified: new Date() },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date() },
    { url: `${baseUrl}/brokers`, lastModified: new Date() },
  ];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // لو المتغيرات مش موجودة لأي سبب، رجع الثابت فقط
    if (!supabaseUrl || !supabaseAnonKey) return staticUrls;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    // ✅ عدّل أسماء الأعمدة إذا عندك مختلفة
    // نفترض جدول tournaments وفيه slug + updated_at (أو created_at)
    const { data, error } = await supabase
      .from("tournaments")
      .select("slug, updated_at, created_at")
      .not("slug", "is", null);

    if (error || !data) return staticUrls;

    const tournamentUrls: MetadataRoute.Sitemap = data
      .map((t: any) => {
        const slug = String(t.slug || "").trim();
        if (!slug) return null;

        const last =
          t.updated_at || t.created_at ? new Date(t.updated_at || t.created_at) : new Date();

        return {
          url: `${baseUrl}/tournaments/${slug}`,
          lastModified: last,
        };
      })
      .filter(Boolean) as MetadataRoute.Sitemap;

    return [...staticUrls, ...tournamentUrls];
  } catch {
    return staticUrls;
  }
}