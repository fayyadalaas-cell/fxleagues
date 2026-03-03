import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/signin",
          "/signup",
          "/verify-phone",
          "/reset-password",
          "/update-password",
          "/account",
        ],
      },
    ],
    sitemap: "https://forexleagues.com/sitemap.xml",
    host: "https://forexleagues.com",
  };
}