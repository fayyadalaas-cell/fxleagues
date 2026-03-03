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
          "/verify-email",
          "/reset-password",
          "/update-password",
          "/members",
          "/not-authorized",
          "/test",
        ],
      },
    ],
    sitemap: "https://forexleagues.com/sitemap.xml",
    host: "https://forexleagues.com",
  };
}