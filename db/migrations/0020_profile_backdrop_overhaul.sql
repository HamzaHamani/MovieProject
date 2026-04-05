ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "backdrop_path" text;
--> statement-breakpoint
DELETE FROM "list_collaborators"
USING "bookmarks"
WHERE "list_collaborators"."bookmarkId" = "bookmarks"."id"
  AND (
    lower("bookmarks"."bookmarkName") LIKE '%favorite%'
    OR lower("bookmarks"."bookmarkName") LIKE '%favourite%'
    OR lower("bookmarks"."bookmarkName") LIKE '%fav%'
    OR lower("bookmarks"."bookmarkName") LIKE '%likes%'
    OR lower("bookmarks"."bookmarkName") LIKE '%like%'
    OR lower("bookmarks"."bookmarkName") LIKE '%loved%'
    OR lower("bookmarks"."bookmarkName") LIKE '%love%'
    OR lower("bookmarks"."bookmarkName") LIKE '%watchlist%'
    OR lower("bookmarks"."bookmarkName") LIKE '%watch later%'
    OR lower("bookmarks"."bookmarkName") LIKE '%to watch%'
    OR lower("bookmarks"."bookmarkName") LIKE '%queue%'
  );