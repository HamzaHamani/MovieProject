/**
 * Robots.txt Generation
 * Controls search engine crawler access
 */

import { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;
  const isProduction = process.env.NODE_ENV === "production";

  // Block everything in development/staging
  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  // Production rules
  return {
    rules: [
      // General rules for all search engines
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // Block API endpoints
          "/admin/", // Block admin areas
          "/_next/", // Block Next.js internals
          "/private/", // Block private content
          "/404", // Block error pages
          "/500",
          "/auth/", // Block auth pages during crawl
        ],
      },

      // Give Google special treatment - allow more crawling
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/", "/private/"],
      },

      // Bing
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
