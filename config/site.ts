/**
 * Site Configuration
 * Single source of truth for domain and site info
 * Update this file and it propagates everywhere
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cinesphere.app";
export const SITE_NAME = "Cinesphere";
export const SITE_DESCRIPTION =
  "Discover movies, TV shows, and connect with cinephiles. Log films, create lists, and share reviews on Cinesphere.";
export const SOCIAL_LINKS = {
  github: "https://github.com",
  twitter: "https://twitter.com",
  instagram: "https://instagram.com",
};

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
