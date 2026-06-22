import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://revision-scheduler-alpha.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/privacy", "/terms", "/auth/login", "/auth/signup"],
        disallow: ["/dashboard", "/schedule", "/exams", "/progress", "/settings", "/study", "/auth/callback", "/auth/reset-password"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
