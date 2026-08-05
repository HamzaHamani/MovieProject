/**
 * Dynamic Sitemap Generation
 * Auto-generates sitemap.xml with all pages
 */

import { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { db } from "@/db";
import { bookmarks, loggedMovies, users } from "@/db/schema";
import { decodeStoredMediaId } from "@/lib/utils";

function dedupeUrls(items: MetadataRoute.Sitemap) {
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();

  items.forEach((item) => {
    byUrl.set(item.url, item);
  });

  return [...byUrl.values()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const now = new Date();

  // Static pages with strategic priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bookmarks`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/upcoming`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const [profileRows, listRows, loggedRows] = await Promise.all([
      db.select({ username: users.username }).from(users).limit(500),
      db.select({ id: bookmarks.id }).from(bookmarks).limit(1000),
      db.select({ showId: loggedMovies.showId }).from(loggedMovies).limit(1500),
    ]);

    const profilePages: MetadataRoute.Sitemap = profileRows
      .map((row) => row.username?.trim())
      .filter((username): username is string => Boolean(username))
      .flatMap((username) => [
        {
          url: `${baseUrl}/profile/${username}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        },
        {
          url: `${baseUrl}/bookmarks/${username}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
      ]);

    const listPages: MetadataRoute.Sitemap = listRows.map((row) => ({
      url: `${baseUrl}/list/${row.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const titlePages: MetadataRoute.Sitemap = [];
    loggedRows.forEach((row) => {
      const decoded = decodeStoredMediaId(row.showId);
      if (!decoded.id) return;

      const segment = decoded.mediaType === "tv" ? "tv" : "movie";
      titlePages.push({
        url: `${baseUrl}/${segment}/${decoded.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.85,
      });
    });

    return dedupeUrls([
      ...staticPages,
      ...profilePages,
      ...listPages,
      ...titlePages,
    ]);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
